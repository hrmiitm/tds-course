import React, { useState, useEffect, useCallback, useRef } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {
  X,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
  Monitor,

  Globe,
  Link2,
  Sun,
  Moon,
  Save,
  Trash2,
} from 'lucide-react';
import styles from './CodePanel.module.css';
import {
  deleteTerminalSession,
  listTerminalSessions,
  upsertTerminalSession,
  type TerminalSession,
} from '../../utils/terminalSessions';

/* ---------- Types ---------- */

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
type ConnectionType = 'localhost' | 'codespaces' | 'custom';
type DockMode = 'floating' | 'bottom' | 'right';

interface StoredDimensions {
  top: number; // px from viewport top
  left: number; // px from viewport left
  width: number; // px or % — we store px
  height: number; // px
}

interface StoredConnection {
  type: ConnectionType;
  url: string;
  port?: string;
}

type Codespace = {
  name: string;
  display_name?: string;
  state?: string;
  web_url?: string;
  repository?: { full_name?: string };
};

/* ---------- Constants ---------- */

const STORAGE_KEY_URL = 'tds_terminal_last_connection';
const STORAGE_KEY_DIMS = 'tds_terminal_dimensions';
const STORAGE_KEY_OPACITY = 'tds_terminal_opacity';
const STORAGE_KEY_DOCK = 'tds_terminal_dock_mode';

const PANEL_MARGIN = 12;

const DEFAULT_DIMS: StoredDimensions = {
  top: -1, // -1 means "use vh calc"
  left: 0,
  width: -1, // -1 means full width
  height: -1, // -1 means 60vh
};

const MIN_WIDTH = 320;
const MIN_HEIGHT = 200;

const SANDBOX_ATTR =
  'allow-scripts allow-same-origin allow-forms allow-popups allow-modals';

/* ---------- Helpers ---------- */

function safeGetJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* ignore */
  }
  return fallback;
}

function safeSetJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function safeGetNumber(key: string, fallback: number): number {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const n = parseFloat(raw);
      if (!isNaN(n)) return n;
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

function safeSetNumber(key: string, value: number) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    /* ignore */
  }
}

function detectConnectionType(url: string): ConnectionType {
  if (!url) return 'localhost';
  try {
    const u = new URL(url);
    if (u.protocol === 'http:' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1')) return 'localhost';
    if (
      u.hostname.endsWith('try.github.dev') ||
      u.hostname.endsWith('.github.dev')
    )
      return 'codespaces';
    return 'custom';
  } catch {
    return 'custom';
  }
}

function buildLocalhostUrl(port: string): string {
  return `http://localhost:${port}`;
}

function buildUrl(type: ConnectionType, raw: string, port?: string): string {
  switch (type) {
    case 'localhost':
      return buildLocalhostUrl(port || '8080');
    case 'codespaces':
    case 'custom':
      return raw.trim();
  }
}

/* ---------- Inner Component ---------- */

function CodePanelInner() {
  /* ---- State ---- */
  const [isOpen, setIsOpen] = useState(false);
  const [connectionType, setConnectionType] = useState<ConnectionType>('localhost');
  const [inputUrl, setInputUrl] = useState('');
  const [inputPort, setInputPort] = useState('8080');
  const [connectedUrl, setConnectedUrl] = useState('');
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [opacity, setOpacity] = useState(() => safeGetNumber(STORAGE_KEY_OPACITY, 1.0));
  const [dims, setDims] = useState<StoredDimensions>(() => {
    const stored = safeGetJSON<StoredDimensions>(STORAGE_KEY_DIMS, DEFAULT_DIMS);
    return stored;
  });
  const [dockMode, setDockMode] = useState<DockMode>(() =>
    safeGetJSON<DockMode>(STORAGE_KEY_DOCK, 'bottom')
  );
  const [sessions, setSessions] = useState<TerminalSession[]>([]);
  const [sessionName, setSessionName] = useState('');
  const [sessionsError, setSessionsError] = useState('');
  const [sessionsBusy, setSessionsBusy] = useState(false);

  const [ghToken, setGhToken] = useState('');
  const [codespaces, setCodespaces] = useState<Codespace[]>([]);
  const [codespacesBusy, setCodespacesBusy] = useState(false);
  const [codespacesError, setCodespacesError] = useState('');

  const [urlError, setUrlError] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const resizeType = useRef<string | null>(null);
  const resizeStart = useRef({ x: 0, y: 0, top: 0, left: 0, width: 0, height: 0 });

  /* ---- Computed pixel dims ---- */
  const computedDims = useCallback((): { top: number; left: number; width: number; height: number } => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (dockMode === 'bottom') {
      const height = Math.min(vh - PANEL_MARGIN * 2, dims.height === -1 ? vh * 0.6 : dims.height);
      return {
        top: Math.max(PANEL_MARGIN, vh - height - PANEL_MARGIN),
        left: PANEL_MARGIN,
        width: Math.max(0, vw - PANEL_MARGIN * 2),
        height,
      };
    }

    if (dockMode === 'right') {
      const preferredWidth = dims.width === -1 ? Math.min(520, Math.round(vw * 0.42)) : dims.width;
      const width = Math.max(MIN_WIDTH, Math.min(vw - PANEL_MARGIN * 2, preferredWidth));
      const height = Math.max(MIN_HEIGHT, vh - PANEL_MARGIN * 2);
      return {
        top: PANEL_MARGIN,
        left: Math.max(PANEL_MARGIN, vw - width - PANEL_MARGIN),
        width,
        height,
      };
    }

    // floating
    const height = Math.min(vh - PANEL_MARGIN * 2, dims.height === -1 ? vh * 0.6 : dims.height);
    const width = Math.min(vw - PANEL_MARGIN * 2, dims.width === -1 ? vw - PANEL_MARGIN * 2 : dims.width);

    let top = dims.top === -1 ? vh - height - PANEL_MARGIN : dims.top;
    let left = dims.left === -1 ? PANEL_MARGIN : dims.left;

    top = Math.max(PANEL_MARGIN, Math.min(top, vh - PANEL_MARGIN - height));
    left = Math.max(PANEL_MARGIN, Math.min(left, vw - PANEL_MARGIN - width));

    return { top, left, width, height };
  }, [dims, dockMode]);

  /* ---- Restore persisted connection ---- */
  useEffect(() => {
    try {
      const stored = safeGetJSON<StoredConnection | null>(STORAGE_KEY_URL, null);
      if (stored && stored.url) {
        setConnectionType(stored.type || detectConnectionType(stored.url));
        setInputUrl(stored.url);
        if (stored.type === 'localhost' && stored.port) {
          setInputPort(stored.port);
        }
        // Auto-reconnect
        setConnectedUrl(stored.url);
        setStatus('connecting');
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* ---- Persist opacity ---- */
  useEffect(() => {
    safeSetNumber(STORAGE_KEY_OPACITY, opacity);
  }, [opacity]);

  /* ---- Persist dock mode ---- */
  useEffect(() => {
    safeSetJSON(STORAGE_KEY_DOCK, dockMode);
  }, [dockMode]);

  const refreshSessions = useCallback(async () => {
    setSessionsBusy(true);
    setSessionsError('');
    try {
      const list = await listTerminalSessions();
      setSessions(list);
    } catch {
      setSessionsError('Could not load saved sessions');
    } finally {
      setSessionsBusy(false);
    }
  }, []);

  useEffect(() => {
    void refreshSessions();
  }, [refreshSessions]);

  /* ---- Persist dims (debounced) ---- */
  const dimsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (dimsTimer.current) clearTimeout(dimsTimer.current);
    dimsTimer.current = setTimeout(() => {
      safeSetJSON(STORAGE_KEY_DIMS, dims);
    }, 300);
    return () => {
      if (dimsTimer.current) clearTimeout(dimsTimer.current);
    };
  }, [dims]);

  /* ---- Keyboard shortcut ---- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* ---- Custom toggle event ---- */
  useEffect(() => {
    const handler = () => setIsOpen((prev) => !prev);
    window.addEventListener('tds:toggle-terminal', handler);
    return () => window.removeEventListener('tds:toggle-terminal', handler);
  }, []);

  /* ---- Auto-reconnect on page nav ---- */
  useEffect(() => {
    if (connectedUrl && status === 'disconnected') {
      // Try auto-reconnect
      setStatus('connecting');
    }
  }, [connectedUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- Connection handlers ---- */
  const validateUrl = useCallback((type: ConnectionType, raw: string, port?: string): string | null => {
    const url = buildUrl(type, raw, port);
    if (!url) return 'Please enter a URL';
    try {
      new URL(url);
    } catch {
      return 'Please enter a valid URL';
    }
    if (type === 'localhost') {
      if (!url.startsWith('http://')) return 'Localhost URLs must use http://';
      return null;
    }

    if (type === 'codespaces') {
      if (!url.startsWith('https://')) return 'Codespaces URLs must use https://';
      return null;
    }

    // custom
    if (!(url.startsWith('https://') || url.startsWith('http://'))) {
      return 'Custom URLs must start with http:// or https://';
    }
    return null;
  }, []);

  const handleConnect = useCallback(() => {
    const error = validateUrl(connectionType, inputUrl, inputPort);
    if (error) {
      setUrlError(error);
      return;
    }
    setUrlError('');
    const url = buildUrl(connectionType, inputUrl, inputPort);
    setStatus('connecting');
    setConnectedUrl(url);
    safeSetJSON(STORAGE_KEY_URL, {
      type: connectionType,
      url,
      port: connectionType === 'localhost' ? inputPort : undefined,
    });
  }, [connectionType, inputUrl, inputPort, validateUrl]);

  const handleQuickConnect = useCallback(
    (type: ConnectionType, url: string, port?: string) => {
      setConnectionType(type);
      if (type === 'localhost' && port) setInputPort(port);
      if (type !== 'localhost') setInputUrl(url);
      setUrlError('');
      setStatus('connecting');
      setConnectedUrl(url);
      safeSetJSON(STORAGE_KEY_URL, { type, url, port });
    },
    []
  );

  const makeSessionId = useCallback((): string => {
    const c = globalThis.crypto as Crypto | undefined;
    if (c?.randomUUID) return c.randomUUID();
    return `ts_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }, []);

  const handleSaveSession = useCallback(async () => {
    const name = sessionName.trim();
    if (!name) {
      setSessionsError('Please enter a session name');
      return;
    }

    const error = validateUrl(connectionType, inputUrl, inputPort);
    if (error) {
      setUrlError(error);
      return;
    }

    setUrlError('');
    const url = buildUrl(connectionType, inputUrl, inputPort);
    if (!url) return;

    setSessionsError('');
    try {
      const now = Date.now();
      const session: TerminalSession = {
        id: makeSessionId(),
        name,
        type: connectionType,
        url,
        port: connectionType === 'localhost' ? inputPort : undefined,
        createdAt: now,
        updatedAt: now,
      };
      await upsertTerminalSession(session);
      setSessionName('');
      await refreshSessions();
    } catch {
      setSessionsError('Could not save session');
    }
  }, [connectionType, inputPort, inputUrl, makeSessionId, refreshSessions, sessionName, validateUrl]);

  const handleConnectSession = useCallback(
    async (s: TerminalSession) => {
      setIsOpen(true);
      handleQuickConnect(s.type as ConnectionType, s.url, s.port);

      try {
        await upsertTerminalSession({ ...s, updatedAt: Date.now() });
        await refreshSessions();
      } catch {
        // Non-fatal
      }
    },
    [handleQuickConnect, refreshSessions]
  );

  const handleDeleteSession = useCallback(
    async (id: string) => {
      setSessionsError('');
      try {
        await deleteTerminalSession(id);
        await refreshSessions();
      } catch {
        setSessionsError('Could not delete session');
      }
    },
    [refreshSessions]
  );

  const openUrlInPanel = useCallback(
    (url: string) => {
      setUrlError('');
      setStatus('connecting');
      setConnectedUrl(url);
      safeSetJSON(STORAGE_KEY_URL, { type: 'custom', url });
    },
    []
  );

  const loadCodespaces = useCallback(async () => {
    const token = ghToken.trim();
    if (!token) {
      setCodespacesError('Paste a GitHub token to load your Codespaces');
      return;
    }

    setCodespacesBusy(true);
    setCodespacesError('');
    try {
      const res = await fetch('https://api.github.com/user/codespaces', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      if (!res.ok) {
        throw new Error(`GitHub API error (${res.status})`);
      }

      const data = (await res.json()) as any;
      const list = Array.isArray(data?.codespaces) ? data.codespaces : Array.isArray(data) ? data : [];
      setCodespaces(list as Codespace[]);
    } catch {
      setCodespacesError('Could not load Codespaces (check token / permissions)');
    } finally {
      setCodespacesBusy(false);
    }
  }, [ghToken]);

  const codespaceAction = useCallback(
    async (name: string, action: 'start' | 'stop' | 'delete') => {
      const token = ghToken.trim();
      if (!token) {
        setCodespacesError('Paste a GitHub token to manage Codespaces');
        return;
      }

      setCodespacesBusy(true);
      setCodespacesError('');
      try {
        const url = `https://api.github.com/user/codespaces/${encodeURIComponent(name)}${action === 'delete' ? '' : `/${action}`}`;
        const res = await fetch(url, {
          method: action === 'delete' ? 'DELETE' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        });

        if (!res.ok) {
          throw new Error(`GitHub API error (${res.status})`);
        }

        await loadCodespaces();
      } catch {
        setCodespacesError(`Could not ${action} Codespace`);
      } finally {
        setCodespacesBusy(false);
      }
    },
    [ghToken, loadCodespaces]
  );

  const handleDisconnect = useCallback(() => {
    setConnectedUrl('');
    setStatus('disconnected');
    setUrlError('');
    try {
      localStorage.removeItem(STORAGE_KEY_URL);
    } catch {
      /* ignore */
    }
  }, []);

  const handleIframeLoad = useCallback(() => {
    if (status === 'connecting') {
      setStatus('connected');
    }
  }, [status]);

  const handleIframeError = useCallback(() => {
    setStatus('error');
  }, []);

  const handleRefresh = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.src = connectedUrl;
    }
  }, [connectedUrl]);

  const handleOpenNewTab = useCallback(() => {
    window.open(connectedUrl, '_blank');
  }, [connectedUrl]);

  /* ---- Resize system ---- */
  const startResize = useCallback(
    (e: React.MouseEvent | React.TouchEvent, type: string) => {
      e.preventDefault();
      e.stopPropagation();
      const point = 'touches' in e ? e.touches[0] : e;
      const cd = computedDims();
      resizeType.current = type;
      resizeStart.current = {
        x: point.clientX,
        y: point.clientY,
        top: cd.top,
        left: cd.left,
        width: cd.width,
        height: cd.height,
      };
      setIsResizing(true);

      const onMove = (ev: MouseEvent | TouchEvent) => {
        const pt = 'touches' in ev ? ev.touches[0] : ev;
        const dx = pt.clientX - resizeStart.current.x;
        const dy = pt.clientY - resizeStart.current.y;
        const rt = resizeType.current;
        if (!rt) return;

        let newTop = resizeStart.current.top;
        let newLeft = resizeStart.current.left;
        let newWidth = resizeStart.current.width;
        let newHeight = resizeStart.current.height;

        if (rt.includes('top')) {
          newTop = Math.min(resizeStart.current.top + dy, window.innerHeight - MIN_HEIGHT);
          newHeight = resizeStart.current.height - (newTop - resizeStart.current.top);
        }
        if (rt.includes('bottom')) {
          newHeight = Math.max(MIN_HEIGHT, resizeStart.current.height + dy);
        }
        if (rt.includes('left')) {
          newLeft = Math.min(resizeStart.current.left + dx, resizeStart.current.left + resizeStart.current.width - MIN_WIDTH);
          newWidth = resizeStart.current.width - (newLeft - resizeStart.current.left);
        }
        if (rt.includes('right')) {
          newWidth = Math.max(MIN_WIDTH, resizeStart.current.width + dx);
        }

        // Clamp to viewport
        if (newTop < 0) { newHeight += newTop; newTop = 0; }
        if (newLeft < 0) { newWidth += newLeft; newLeft = 0; }
        if (newLeft + newWidth > window.innerWidth) newWidth = window.innerWidth - newLeft;
        if (newTop + newHeight > window.innerHeight) newHeight = window.innerHeight - newTop;

        setDims({ top: newTop, left: newLeft, width: newWidth, height: newHeight });
      };

      const onEnd = () => {
        resizeType.current = null;
        setIsResizing(false);
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchmove', onMove, { passive: false } as EventListenerOptions);
      document.addEventListener('touchend', onEnd);
    },
    [computedDims]
  );

  /* ---- Status dot color ---- */
  const statusDotClass = {
    disconnected: styles.dotGray,
    connecting: styles.dotYellow,
    connected: styles.dotGreen,
    error: styles.dotRed,
  }[status];

  const statusLabel = {
    disconnected: 'Disconnected',
    connecting: 'Connecting...',
    connected: 'Connected',
    error: 'Connection error',
  }[status];

  /* ---- Connection type config ---- */
  const connectionTypes: { key: ConnectionType; label: string; icon: React.ReactNode }[] = [
    { key: 'localhost', label: 'Localhost', icon: <Monitor size={14} /> },
    { key: 'codespaces', label: 'GitHub Codespaces', icon: <Globe size={14} /> },
    { key: 'custom', label: 'Custom URL', icon: <Link2 size={14} /> },
  ];

  const sessionTypeLabel: Record<TerminalSession['type'], string> = {
    localhost: 'Localhost',
    codespaces: 'Codespaces',
    custom: 'Custom',
  };

  const formatSessionUrl = (url: string): string => {
    try {
      const u = new URL(url);
      const path = u.pathname && u.pathname !== '/' ? u.pathname : '';
      return `${u.host}${path}`;
    } catch {
      return url;
    }
  };

  /* ---- Render ---- */
  const cd = isOpen ? computedDims() : { top: 0, left: 0, width: 0, height: 0 };

  return (
    <>
      {/* Drawer */}
      {isOpen && (
        <div
          ref={drawerRef}
          className={`${styles.drawer} ${isResizing ? styles.drawerResizing : ''}`}
          style={{
            top: cd.top,
            left: cd.left,
            width: cd.width,
            height: cd.height,
            ['--tds-terminal-alpha' as any]: opacity,
          } as React.CSSProperties}
        >
          {/* Resize handles */}
          {(dockMode === 'floating' || dockMode === 'bottom') && (
            <div
              className={`${styles.resizeHandle} ${styles.resizeTop}`}
              onMouseDown={(e) => startResize(e, 'top')}
              onTouchStart={(e) => startResize(e, 'top')}
            />
          )}
          {dockMode === 'floating' && (
            <div
              className={`${styles.resizeHandle} ${styles.resizeBottom}`}
              onMouseDown={(e) => startResize(e, 'bottom')}
              onTouchStart={(e) => startResize(e, 'bottom')}
            />
          )}
          {(dockMode === 'floating' || dockMode === 'right') && (
            <div
              className={`${styles.resizeHandle} ${styles.resizeLeft}`}
              onMouseDown={(e) => startResize(e, 'left')}
              onTouchStart={(e) => startResize(e, 'left')}
            />
          )}
          {dockMode === 'floating' && (
            <div
              className={`${styles.resizeHandle} ${styles.resizeRight}`}
              onMouseDown={(e) => startResize(e, 'right')}
              onTouchStart={(e) => startResize(e, 'right')}
            />
          )}

          {dockMode === 'floating' && (
            <>
              <div
                className={`${styles.resizeHandle} ${styles.resizeCornerBL}`}
                onMouseDown={(e) => startResize(e, 'bottom-left')}
                onTouchStart={(e) => startResize(e, 'bottom-left')}
              />
              <div
                className={`${styles.resizeHandle} ${styles.resizeCornerBR}`}
                onMouseDown={(e) => startResize(e, 'bottom-right')}
                onTouchStart={(e) => startResize(e, 'bottom-right')}
              />
              <div
                className={`${styles.resizeHandle} ${styles.resizeCornerTL}`}
                onMouseDown={(e) => startResize(e, 'top-left')}
                onTouchStart={(e) => startResize(e, 'top-left')}
              />
              <div
                className={`${styles.resizeHandle} ${styles.resizeCornerTR}`}
                onMouseDown={(e) => startResize(e, 'top-right')}
                onTouchStart={(e) => startResize(e, 'top-right')}
              />
            </>
          )}

          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={`${styles.statusDot} ${statusDotClass}`} />
              <span className={styles.headerTitle}>TDS Terminal</span>
              <span className={styles.headerStatus}>{statusLabel}</span>
            </div>
            <div className={styles.headerCenter}>
              <label className={styles.opacityControl}>
                <Sun size={13} className={styles.opacityIcon} />
                <input
                  type="range"
                  min="0.3"
                  max="1"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className={styles.opacitySlider}
                  aria-label="Terminal opacity"
                />
                <Moon size={13} className={styles.opacityIcon} />
                <span className={styles.opacityValue}>{Math.round(opacity * 100)}%</span>
              </label>
            </div>
            <div className={styles.headerActions}>
              <div className={styles.dockToggle} role="group" aria-label="Dock position">
                <button
                  type="button"
                  className={`${styles.dockBtn} ${dockMode === 'bottom' ? styles.dockBtnActive : ''}`}
                  onClick={() => setDockMode('bottom')}
                  title="Dock bottom"
                >
                  Bottom
                </button>
                <button
                  type="button"
                  className={`${styles.dockBtn} ${dockMode === 'right' ? styles.dockBtnActive : ''}`}
                  onClick={() => setDockMode('right')}
                  title="Dock right"
                >
                  Right
                </button>
                <button
                  type="button"
                  className={`${styles.dockBtn} ${dockMode === 'floating' ? styles.dockBtnActive : ''}`}
                  onClick={() => setDockMode('floating')}
                  title="Floating"
                >
                  Float
                </button>
              </div>

              {status === 'connected' && (
                <>
                  <button className={styles.iconBtn} onClick={handleRefresh} aria-label="Refresh terminal" title="Refresh">
                    <RotateCcw size={15} />
                  </button>
                  <button className={styles.iconBtn} onClick={handleOpenNewTab} aria-label="Open in new tab" title="Open in new tab">
                    <ExternalLink size={15} />
                  </button>
                </>
              )}
              {status === 'connected' && (
                <button className={styles.disconnectBtn} onClick={handleDisconnect} aria-label="Disconnect">
                  <WifiOff size={13} />
                  Disconnect
                </button>
              )}
              <span className={styles.kbdBadge}>Ctrl+`</span>
              <button className={styles.iconBtn} onClick={() => setIsOpen(false)} aria-label="Close panel" title="Close">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Content */}
          {status === 'connected' || status === 'connecting' ? (
            <div className={styles.iframeWrapper}>
              <iframe
                ref={iframeRef}
                className={styles.iframe}
                src={connectedUrl}
                sandbox={SANDBOX_ATTR}
                allow="clipboard-read; clipboard-write"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title="Code Server Terminal"
              />
              {status === 'connecting' && (
                <div className={styles.connectingOverlay}>
                  <div className={styles.spinner} />
                  <span>Connecting to {connectedUrl}...</span>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.connectPane}>
              <div className={styles.connectCard}>
                {/* Connection type selector */}
                <div className={styles.connectLabel}>Connection Type</div>
                <div className={styles.typeGrid}>
                  {connectionTypes.map((ct) => (
                    <button
                      key={ct.key}
                      className={`${styles.typeBtn} ${connectionType === ct.key ? styles.typeBtnActive : ''}`}
                      onClick={() => setConnectionType(ct.key)}
                    >
                      {ct.icon}
                      <span>{ct.label}</span>
                    </button>
                  ))}
                </div>

                {/* Input fields based on type */}
                <div className={styles.inputSection}>
                  {connectionType === 'localhost' && (
                    <>
                      <div className={styles.fieldLabel}>Port</div>
                      <div className={styles.portRow}>
                        <span className={styles.portPrefix}>http://localhost:</span>
                        <input
                          className={`${styles.connectInput} ${styles.portInput} ${urlError ? styles.inputError : ''}`}
                          type="text"
                          placeholder="8080"
                          value={inputPort}
                          onChange={(e) => {
                            setInputPort(e.target.value.replace(/\D/g, ''));
                            setUrlError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleConnect();
                          }}
                        />
                      </div>
                      <div className={styles.urlPreview}>
                        Preview: <code>{buildLocalhostUrl(inputPort || '8080')}</code>
                      </div>
                    </>
                  )}
                  {connectionType === 'codespaces' && (
                    <>
                      <div className={styles.fieldLabel}>GitHub Codespaces</div>
                      <div className={styles.fieldHint}>
                        Manage/start/stop/delete Codespaces below. To connect to a forwarded port URL (e.g. <code>https://...try.github.dev</code>), use <strong>Custom URL</strong>.
                      </div>
                    </>
                  )}
                  {connectionType === 'custom' && (
                    <>
                      <div className={styles.fieldLabel}>URL</div>
                      <input
                        className={`${styles.connectInput} ${urlError ? styles.inputError : ''}`}
                        type="text"
                        placeholder="https://your-server.example.com"
                        value={inputUrl}
                        onChange={(e) => {
                          setInputUrl(e.target.value);
                          setUrlError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleConnect();
                        }}
                      />
                      <div className={styles.fieldHint}>
                        Enter any URL (http:// or https://) to connect to a remote code server
                      </div>
                    </>
                  )}
                </div>

                {urlError && <div className={styles.connectError}>{urlError}</div>}

                {connectionType !== 'codespaces' && (
                  <button className={styles.connectBtn} onClick={handleConnect}>
                    <Wifi size={15} />
                    Connect
                  </button>
                )}
              </div>

              {connectionType === 'codespaces' && (
                <div className={styles.codespacesCard}>
                  <div className={styles.sessionsHeader}>
                    <div>
                      <div className={styles.sessionsTitle}>Codespaces</div>
                      <div className={styles.sessionsSubtitle}>
                        Manage your GitHub Codespaces from here (no new tabs).
                      </div>
                    </div>
                    <div className={styles.sessionActions}>
                      <button
                        className={styles.sessionConnectBtn}
                        type="button"
                        onClick={() => openUrlInPanel('https://github.com/codespaces')}
                      >
                        <Globe size={14} />
                        Open
                      </button>
                      <button
                        className={styles.sessionConnectBtn}
                        type="button"
                        onClick={() => openUrlInPanel('https://github.com/codespaces/new')}
                      >
                        <Globe size={14} />
                        New
                      </button>
                    </div>
                  </div>

                  <div className={styles.codespacesTokenRow}>
                    <input
                      className={styles.sessionNameInput}
                      type="password"
                      placeholder="GitHub token (for list/start/stop/delete)"
                      value={ghToken}
                      onChange={(e) => {
                        setGhToken(e.target.value);
                        setCodespacesError('');
                      }}
                      aria-label="GitHub token"
                    />
                    <button
                      className={styles.saveBtn}
                      onClick={() => void loadCodespaces()}
                      disabled={codespacesBusy}
                      type="button"
                    >
                      <RotateCcw size={14} />
                      Load
                    </button>
                  </div>

                  {codespacesError && <div className={styles.sessionsError}>{codespacesError}</div>}

                  <div className={styles.sessionsList}>
                    {codespacesBusy ? (
                      <div className={styles.sessionsEmpty}>Loading…</div>
                    ) : codespaces.length === 0 ? (
                      <div className={styles.sessionsEmpty}>No Codespaces loaded yet.</div>
                    ) : (
                      codespaces.map((c) => {
                        const repo = c.repository?.full_name ?? 'Repository';
                        const label = c.display_name ?? c.name;
                        const state = c.state ?? 'unknown';
                        const openUrl = c.web_url ?? `https://github.com/codespaces/${c.name}`;
                        return (
                          <div key={c.name} className={styles.sessionItem}>
                            <div className={styles.sessionMeta}>
                              <div className={styles.sessionName}>{label}</div>
                              <div className={styles.sessionInfo}>
                                {repo} • {state}
                              </div>
                            </div>
                            <div className={styles.sessionActions}>
                              <button
                                className={styles.sessionConnectBtn}
                                type="button"
                                onClick={() => openUrlInPanel(openUrl)}
                              >
                                <Wifi size={14} />
                                Open
                              </button>
                              {state === 'available' ? (
                                <button
                                  className={styles.sessionConnectBtn}
                                  type="button"
                                  onClick={() => void codespaceAction(c.name, 'stop')}
                                >
                                  Stop
                                </button>
                              ) : (
                                <button
                                  className={styles.sessionConnectBtn}
                                  type="button"
                                  onClick={() => void codespaceAction(c.name, 'start')}
                                >
                                  Start
                                </button>
                              )}
                              <button
                                className={styles.iconBtn}
                                onClick={() => void codespaceAction(c.name, 'delete')}
                                aria-label={`Delete ${label}`}
                                title="Delete"
                                type="button"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Saved sessions */}
              <div className={styles.sessionsCard}>
                <div className={styles.sessionsHeader}>
                  <div>
                    <div className={styles.sessionsTitle}>Saved sessions</div>
                    <div className={styles.sessionsSubtitle}>Stored locally in this browser (IndexedDB).</div>
                  </div>
                  <button
                    className={styles.iconBtn}
                    onClick={() => void refreshSessions()}
                    aria-label="Refresh saved sessions"
                    title="Refresh list"
                  >
                    <RotateCcw size={15} />
                  </button>
                </div>

                {connectionType !== 'codespaces' && (
                  <div className={styles.sessionsSaveRow}>
                    <input
                      className={styles.sessionNameInput}
                      type="text"
                      placeholder="Name this connection (e.g. code-server — Localhost)"
                      value={sessionName}
                      onChange={(e) => {
                        setSessionName(e.target.value);
                        setSessionsError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') void handleSaveSession();
                      }}
                      aria-label="Session name"
                    />
                    <button
                      className={styles.saveBtn}
                      onClick={() => void handleSaveSession()}
                      disabled={sessionsBusy}
                      type="button"
                    >
                      <Save size={14} />
                      Save
                    </button>
                  </div>
                )}

                {sessionsError && <div className={styles.sessionsError}>{sessionsError}</div>}

                <div className={styles.sessionsList}>
                  {sessionsBusy ? (
                    <div className={styles.sessionsEmpty}>Loading…</div>
                  ) : sessions.length === 0 ? (
                    <div className={styles.sessionsEmpty}>No saved sessions yet.</div>
                  ) : (
                    sessions.map((s) => (
                      <div key={s.id} className={styles.sessionItem}>
                        <div className={styles.sessionMeta}>
                          <div className={styles.sessionName}>{s.name}</div>
                          <div className={styles.sessionInfo}>
                            {sessionTypeLabel[s.type]} • {formatSessionUrl(s.url)}
                          </div>
                        </div>
                        <div className={styles.sessionActions}>
                          <button
                            className={styles.sessionConnectBtn}
                            onClick={() => void handleConnectSession(s)}
                            type="button"
                          >
                            <Wifi size={14} />
                            Connect
                          </button>
                          <button
                            className={styles.iconBtn}
                            onClick={() => void handleDeleteSession(s.id)}
                            aria-label={`Delete ${s.name}`}
                            title="Delete"
                            type="button"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick connect buttons */}
              <div className={styles.quickConnectRow}>
                <span className={styles.quickLabel}>Quick connect:</span>
                <button
                  className={styles.quickBtn}
                  onClick={() => handleQuickConnect('localhost', 'http://localhost:8080', '8080')}
                >
                  <Monitor size={13} />
                  Localhost :8080
                </button>
                <button
                  className={styles.quickBtn}
                  onClick={() => handleQuickConnect('localhost', 'http://localhost:3000', '3000')}
                >
                  <Monitor size={13} />
                  Localhost :3000
                </button>
                <button
                  className={styles.quickBtn}
                  onClick={() => {
                    setConnectionType('codespaces');
                    setInputUrl('');
                    setInputPort('8080');
                  }}
                >
                  <Globe size={13} />
                  Codespaces
                </button>
              </div>

              {/* Tunnel setup guide */}
              <div className={styles.guideSection}>
                <button
                  className={styles.guideToggle}
                  onClick={() => setShowGuide((prev) => !prev)}
                >
                  {showGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  Setup guide for code-server (Linux)
                </button>
                {showGuide && (
                  <div className={styles.guideSteps}>
                    <strong>Step 1</strong> — Install code-server (one time only)
                    <code className={styles.guideCode}>curl -fsSL https://code-server.dev/install.sh | sh</code>
                    <strong>Step 2</strong> — Start code-server
                    <code className={styles.guideCode}>code-server --auth none --bind-addr 127.0.0.1:8080</code>
                    <strong>Step 3</strong> — Connect from this docs site
                    <code className={styles.guideCode}>Terminal → Localhost → Port 8080 → Connect</code>
                    <strong>Tip</strong>
                    <div className={styles.fieldHint}>
                      If you’re on Codespaces, forward the port and paste the HTTPS URL under “GitHub Codespaces”.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

/* ---------- Export ---------- */

export default function CodePanel() {
  return (
    <BrowserOnly fallback={null}>
      {() => <CodePanelInner />}
    </BrowserOnly>
  );
}
