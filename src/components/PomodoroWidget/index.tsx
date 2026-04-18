import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './PomodoroWidget.module.css';

type Mode = 'focus' | 'break';

type PomodoroState = {
  open: boolean;
  mode: Mode;
  running: boolean;
  endsAt: number | null; // epoch ms
  remainingMs: number; // used when paused
  focusMin: number;
  breakMin: number;
  completedFocusSessions: number;
};

const STORAGE_KEY = 'tds_pomodoro_state_v1';

const DEFAULT_STATE: PomodoroState = {
  open: false,
  mode: 'focus',
  running: false,
  endsAt: null,
  remainingMs: 25 * 60_000,
  focusMin: 25,
  breakMin: 5,
  completedFocusSessions: 0,
};

function clampInt(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}

function formatMMSS(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function loadState(): PomodoroState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<PomodoroState>;
    const focusMin = clampInt(Number(parsed.focusMin ?? DEFAULT_STATE.focusMin), 5, 90);
    const breakMin = clampInt(Number(parsed.breakMin ?? DEFAULT_STATE.breakMin), 1, 30);

    const next: PomodoroState = {
      ...DEFAULT_STATE,
      ...parsed,
      focusMin,
      breakMin,
    };

    // Recompute remaining when running
    if (next.running && typeof next.endsAt === 'number') {
      const now = Date.now();
      const remaining = next.endsAt - now;
      if (remaining <= 0) {
        next.running = false;
        next.endsAt = null;
        next.remainingMs = 0;
      } else {
        next.remainingMs = remaining;
      }
    }

    return next;
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: PomodoroState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export default function PomodoroWidget(): React.JSX.Element {
  const [state, setState] = useState<PomodoroState>(() => {
    if (typeof window === 'undefined') return DEFAULT_STATE;
    return loadState();
  });

  // Tick while running
  useEffect(() => {
    if (!state.running || !state.endsAt) return;

    const t = setInterval(() => {
      const remaining = state.endsAt! - Date.now();
      if (remaining <= 0) {
        setState((prev) => {
          const finishedMode = prev.mode;
          const nextMode: Mode = finishedMode === 'focus' ? 'break' : 'focus';
          const completed = finishedMode === 'focus' ? prev.completedFocusSessions + 1 : prev.completedFocusSessions;
          const nextDurationMs = (nextMode === 'focus' ? prev.focusMin : prev.breakMin) * 60_000;
          const next: PomodoroState = {
            ...prev,
            mode: nextMode,
            running: false,
            endsAt: null,
            remainingMs: nextDurationMs,
            completedFocusSessions: completed,
            open: true,
          };
          saveState(next);
          return next;
        });
      } else {
        setState((prev) => {
          const next = { ...prev, remainingMs: remaining };
          saveState(next);
          return next;
        });
      }
    }, 250);

    return () => clearInterval(t);
  }, [state.running, state.endsAt]);

  // Persist on changes (non-ticking changes)
  const prevRef = useRef<string>('');
  useEffect(() => {
    const raw = JSON.stringify(state);
    if (raw !== prevRef.current) {
      prevRef.current = raw;
      saveState(state);
    }
  }, [state]);

  // External toggle event (navbar button)
  useEffect(() => {
    const handler = () => setState((prev) => ({ ...prev, open: !prev.open }));
    window.addEventListener('tds:toggle-pomodoro', handler);
    return () => window.removeEventListener('tds:toggle-pomodoro', handler);
  }, []);

  const totalMs = useMemo(() => {
    return (state.mode === 'focus' ? state.focusMin : state.breakMin) * 60_000;
  }, [state.mode, state.focusMin, state.breakMin]);

  const progress = useMemo(() => {
    if (totalMs <= 0) return 0;
    return 1 - Math.max(0, Math.min(1, state.remainingMs / totalMs));
  }, [state.remainingMs, totalMs]);

  const start = () => {
    setState((prev) => {
      const durationMs =
        prev.remainingMs > 0
          ? prev.remainingMs
          : (prev.mode === 'focus' ? prev.focusMin : prev.breakMin) * 60_000;
      const next: PomodoroState = {
        ...prev,
        running: true,
        endsAt: Date.now() + durationMs,
        remainingMs: durationMs,
        open: true,
      };
      saveState(next);
      return next;
    });
  };

  const pause = () => {
    setState((prev) => {
      const remaining = prev.endsAt ? Math.max(0, prev.endsAt - Date.now()) : prev.remainingMs;
      const next: PomodoroState = {
        ...prev,
        running: false,
        endsAt: null,
        remainingMs: remaining,
      };
      saveState(next);
      return next;
    });
  };

  const reset = () => {
    setState((prev) => {
      const nextDurationMs = (prev.mode === 'focus' ? prev.focusMin : prev.breakMin) * 60_000;
      const next: PomodoroState = {
        ...prev,
        running: false,
        endsAt: null,
        remainingMs: nextDurationMs,
      };
      saveState(next);
      return next;
    });
  };

  const switchMode = (mode: Mode) => {
    setState((prev) => {
      const nextDurationMs = (mode === 'focus' ? prev.focusMin : prev.breakMin) * 60_000;
      const next: PomodoroState = {
        ...prev,
        mode,
        running: false,
        endsAt: null,
        remainingMs: nextDurationMs,
        open: true,
      };
      saveState(next);
      return next;
    });
  };

  const setDurations = (focusMin: number, breakMin: number) => {
    setState((prev) => {
      const f = clampInt(focusMin, 5, 90);
      const b = clampInt(breakMin, 1, 30);
      const nextDurationMs = (prev.mode === 'focus' ? f : b) * 60_000;
      const next: PomodoroState = {
        ...prev,
        focusMin: f,
        breakMin: b,
        running: false,
        endsAt: null,
        remainingMs: nextDurationMs,
      };
      saveState(next);
      return next;
    });
  };

  if (!state.open) return <></>;

  const accentClass = state.mode === 'focus' ? styles.accentFocus : styles.accentBreak;

  return (
    <aside className={styles.panel} role="dialog" aria-label="Pomodoro timer">
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.title}>Pomodoro</div>
          <button className={styles.iconBtn} onClick={() => setState((p) => ({ ...p, open: false }))} aria-label="Close">
            ✕
          </button>
        </div>
        <div className={styles.modeRow}>
          <button
            className={`${styles.modeBtn} ${state.mode === 'focus' ? styles.modeBtnActive : ''}`}
            onClick={() => switchMode('focus')}
            type="button"
          >
            Focus
          </button>
          <button
            className={`${styles.modeBtn} ${state.mode === 'break' ? styles.modeBtnActive : ''}`}
            onClick={() => switchMode('break')}
            type="button"
          >
            Break
          </button>
          <div className={styles.sessions}>Sessions: {state.completedFocusSessions}</div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={`${styles.timerCard} ${accentClass}`}>
          <div className={styles.timerTop}>
            <div className={styles.timerLabel}>{state.mode === 'focus' ? 'Focus' : 'Break'}</div>
            <div className={styles.timerValue}>{formatMMSS(state.remainingMs)}</div>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        </div>

        <div className={styles.actions}>
          {!state.running ? (
            <button className={styles.primaryBtn} onClick={start} type="button">
              Start
            </button>
          ) : (
            <button className={styles.primaryBtn} onClick={pause} type="button">
              Pause
            </button>
          )}
          <button className={styles.secondaryBtn} onClick={reset} type="button">
            Reset
          </button>
        </div>

        <div className={styles.settings}>
          <div className={styles.settingsTitle}>Durations</div>
          <div className={styles.settingsRow}>
            <label className={styles.field}>
              <span>Focus</span>
              <input
                className={styles.input}
                type="number"
                min={5}
                max={90}
                value={state.focusMin}
                onChange={(e) => setDurations(Number(e.target.value), state.breakMin)}
              />
              <span className={styles.unit}>min</span>
            </label>
            <label className={styles.field}>
              <span>Break</span>
              <input
                className={styles.input}
                type="number"
                min={1}
                max={30}
                value={state.breakMin}
                onChange={(e) => setDurations(state.focusMin, Number(e.target.value))}
              />
              <span className={styles.unit}>min</span>
            </label>
          </div>
          <div className={styles.hint}>Tip: Use the navbar timer button to toggle this panel.</div>
        </div>
      </div>
    </aside>
  );
}
