import React, { useState, useCallback, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { TerminalSquare, X, RotateCcw, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './CodePanel.module.css';

type Status = 'idle' | 'connecting' | 'connected' | 'error';
type PanelRect = { x: number; y: number; w: number; h: number };
type DragKind = 'none' | 'move' | 'resize';
type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
const STORAGE_KEY = 'tds_tunnel_url';
const LAYOUT_KEY = 'tds_terminal_layout';
const OPACITY_KEY = 'tds_terminal_opacity';
const UP_RECT_KEY = 'tds_terminal_up_rect';
const SIDE_RECT_KEY = 'tds_terminal_side_rect';
const DEFAULT_LOCAL_URL = 'http://127.0.0.1:8080';
const DEFAULT_UP_RECT: PanelRect = { x: 2, y: 32, w: 96, h: 66 };
const DEFAULT_SIDE_RECT: PanelRect = { x: 38, y: 8, w: 60, h: 88 };
const DEFAULT_OPACITY = 92;
const MIN_W_PX = 360;
const MIN_H_PX = 260;
const SCREEN_PADDING_PX = 12;

function CodePanelInner(): React.ReactElement | null {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [url, setUrl] = useState('');
  const [upRect, setUpRect] = useState<PanelRect>(DEFAULT_UP_RECT);
  const [sideRect, setSideRect] = useState<PanelRect>(DEFAULT_SIDE_RECT);
  const [panelOpacity, setPanelOpacity] = useState(DEFAULT_OPACITY);
  const [iframeKey, setIframeKey] = useState(0);
  const [inputUrl, setInputUrl] = useState('');
  const [error, setError] = useState('');
  const [showGuide, setShowGuide] = useState(true);
  const [layout, setLayout] = useState<'up' | 'side'>('up');

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      const initialUrl = s || DEFAULT_LOCAL_URL;
      setUrl(initialUrl);
      setInputUrl(initialUrl);
      setStatus('connecting');
      if (!s) localStorage.setItem(STORAGE_KEY, initialUrl);
    } catch {}
    try { const savedLayout = localStorage.getItem(LAYOUT_KEY); if (savedLayout === 'up' || savedLayout === 'side') setLayout(savedLayout); } catch {}
    try {
      const savedUpRect = localStorage.getItem(UP_RECT_KEY);
      if (savedUpRect) {
        const parsed = JSON.parse(savedUpRect) as PanelRect;
        if (parsed && Number.isFinite(parsed.x) && Number.isFinite(parsed.y) && Number.isFinite(parsed.w) && Number.isFinite(parsed.h)) setUpRect(parsed);
      }
    } catch {}
    try {
      const savedSideRect = localStorage.getItem(SIDE_RECT_KEY);
      if (savedSideRect) {
        const parsed = JSON.parse(savedSideRect) as PanelRect;
        if (parsed && Number.isFinite(parsed.x) && Number.isFinite(parsed.y) && Number.isFinite(parsed.w) && Number.isFinite(parsed.h)) setSideRect(parsed);
      }
    } catch {}
    try {
      const savedOpacity = localStorage.getItem(OPACITY_KEY);
      const parsed = savedOpacity ? Number(savedOpacity) : NaN;
      if (!Number.isNaN(parsed)) setPanelOpacity(Math.min(100, Math.max(35, parsed)));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(LAYOUT_KEY, layout); } catch {}
  }, [layout]);

  useEffect(() => {
    try { localStorage.setItem(UP_RECT_KEY, JSON.stringify(upRect)); } catch {}
  }, [upRect]);

  useEffect(() => {
    try { localStorage.setItem(SIDE_RECT_KEY, JSON.stringify(sideRect)); } catch {}
  }, [sideRect]);

  useEffect(() => {
    try { localStorage.setItem(OPACITY_KEY, String(panelOpacity)); } catch {}
  }, [panelOpacity]);

  const togglePanel = useCallback(() => setIsOpen(p => !p), []);

  const handleConnect = useCallback((newUrl: string) => {
    setError('');
    setStatus('connecting'); setUrl(newUrl); setInputUrl(newUrl);
    try { localStorage.setItem(STORAGE_KEY, newUrl); } catch {}
  }, []);

  const handleDisconnect = useCallback(() => {
    setStatus('idle'); setUrl(''); setInputUrl(''); setIframeKey(k => k + 1);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  useEffect(() => {
    if (status !== 'connecting') return;
    const timeoutId = window.setTimeout(() => {
      setStatus((current) => current === 'connecting' ? 'idle' : current);
      setError((current) => current || `Auto-connect timed out after 5 seconds. Check if code-server is running at ${url || DEFAULT_LOCAL_URL}, or connect manually.`);
    }, 5000);
    return () => window.clearTimeout(timeoutId);
  }, [status, url]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.ctrlKey && e.key === '`') { e.preventDefault(); togglePanel(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [togglePanel]);

  const connectUrl = () => {
    const t = inputUrl.trim();
    if (!t) { setError('Please enter a URL'); return; }
    let parsed: URL;
    try {
      parsed = new URL(t);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    const isLocalHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '::1';
    const isHttps = parsed.protocol === 'https:';
    const isLocalHttp = parsed.protocol === 'http:' && isLocalHost;

    if (!isHttps && !isLocalHttp) {
      setError('Use https:// URL, or http://localhost (127.0.0.1 / ::1) for local code-server');
      return;
    }

    if (parsed.protocol === 'http:' && !parsed.port) {
      setError('For localhost, include the port (example: http://127.0.0.1:8080)');
      return;
    }

    setError(''); handleConnect(t);
  };

  const getActiveRect = useCallback(() => (layout === 'up' ? upRect : sideRect), [layout, upRect, sideRect]);
  const setActiveRect = useCallback((next: PanelRect) => {
    if (layout === 'up') setUpRect(next);
    else setSideRect(next);
  }, [layout]);

  const dragKind = React.useRef<DragKind>('none');
  const resizeDir = React.useRef<ResizeDir>('se');
  const startMouse = React.useRef({ x: 0, y: 0 });
  const startRect = React.useRef<PanelRect>(DEFAULT_UP_RECT);

  const clampRect = useCallback((rectPx: { left: number; top: number; width: number; height: number }) => {
    const ww = window.innerWidth;
    const wh = window.innerHeight;
    const pad = SCREEN_PADDING_PX;
    let { left, top, width, height } = rectPx;

    width = Math.max(MIN_W_PX, Math.min(width, ww - 2 * pad));
    height = Math.max(MIN_H_PX, Math.min(height, wh - 2 * pad));

    left = Math.min(Math.max(left, pad), ww - pad - width);
    top = Math.min(Math.max(top, pad), wh - pad - height);

    return {
      x: (left / ww) * 100,
      y: (top / wh) * 100,
      w: (width / ww) * 100,
      h: (height / wh) * 100,
    };
  }, []);

  useEffect(() => {
    const mm = (e: MouseEvent) => {
      if (dragKind.current === 'none') return;

      const ww = window.innerWidth;
      const wh = window.innerHeight;
      const dx = e.clientX - startMouse.current.x;
      const dy = e.clientY - startMouse.current.y;

      const startLeft = (startRect.current.x / 100) * ww;
      const startTop = (startRect.current.y / 100) * wh;
      const startWidth = (startRect.current.w / 100) * ww;
      const startHeight = (startRect.current.h / 100) * wh;

      if (dragKind.current === 'move') {
        setActiveRect(clampRect({
          left: startLeft + dx,
          top: startTop + dy,
          width: startWidth,
          height: startHeight,
        }));
        return;
      }

      let left = startLeft;
      let top = startTop;
      let width = startWidth;
      let height = startHeight;
      const dir = resizeDir.current;

      if (dir.includes('e')) width = startWidth + dx;
      if (dir.includes('s')) height = startHeight + dy;
      if (dir.includes('w')) { left = startLeft + dx; width = startWidth - dx; }
      if (dir.includes('n')) { top = startTop + dy; height = startHeight - dy; }

      setActiveRect(clampRect({ left, top, width, height }));
    };
    const mu = () => { dragKind.current = 'none'; document.body.style.cursor = ''; document.body.style.userSelect = ''; };
    document.addEventListener('mousemove', mm);
    document.addEventListener('mouseup', mu);
    return () => { document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
  }, [clampRect, setActiveRect]);

  const startMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return;
    dragKind.current = 'move';
    startMouse.current = { x: e.clientX, y: e.clientY };
    startRect.current = getActiveRect();
    document.body.style.cursor = 'move';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  }, [getActiveRect]);

  const startResize = useCallback((dir: ResizeDir, e: React.MouseEvent<HTMLDivElement>) => {
    dragKind.current = 'resize';
    resizeDir.current = dir;
    startMouse.current = { x: e.clientX, y: e.clientY };
    startRect.current = getActiveRect();
    document.body.style.cursor = dir === 'n' || dir === 's' ? 'ns-resize' : dir === 'e' || dir === 'w' ? 'ew-resize' : dir === 'ne' || dir === 'sw' ? 'nesw-resize' : 'nwse-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  }, [getActiveRect]);

  const activeRect = layout === 'up' ? upRect : sideRect;

  return (
    <>
      <button className={styles.fab} onClick={togglePanel} aria-label={isOpen ? 'Close terminal' : 'Open terminal'}>
        {isOpen ? <X size={22} /> : <TerminalSquare size={22} />}
      </button>
      <div
        className={`${styles.drawer} ${layout === 'side' ? styles.drawerSide : styles.drawerUp} ${isOpen ? styles.drawerOpen : styles.drawerHidden}`}
        style={{
          left: `${activeRect.x}vw`,
          top: `${activeRect.y}vh`,
          width: `${activeRect.w}vw`,
          height: `${activeRect.h}vh`,
          ['--tds-panel-opacity' as string]: String(panelOpacity / 100),
        } as React.CSSProperties}
      >
          {isOpen && <>
            <div className={`${styles.resizeGrip} ${styles.resizeN}`} onMouseDown={(e) => startResize('n', e)} />
            <div className={`${styles.resizeGrip} ${styles.resizeS}`} onMouseDown={(e) => startResize('s', e)} />
            <div className={`${styles.resizeGrip} ${styles.resizeE}`} onMouseDown={(e) => startResize('e', e)} />
            <div className={`${styles.resizeGrip} ${styles.resizeW}`} onMouseDown={(e) => startResize('w', e)} />
            <div className={`${styles.resizeGrip} ${styles.resizeNE}`} onMouseDown={(e) => startResize('ne', e)} />
            <div className={`${styles.resizeGrip} ${styles.resizeNW}`} onMouseDown={(e) => startResize('nw', e)} />
            <div className={`${styles.resizeGrip} ${styles.resizeSE}`} onMouseDown={(e) => startResize('se', e)} />
            <div className={`${styles.resizeGrip} ${styles.resizeSW}`} onMouseDown={(e) => startResize('sw', e)} />
          </>}
          <div className={styles.header} onMouseDown={isOpen ? startMove : undefined}>
            <div className={styles.headerLeft}>
              <span className={`tds-status-dot tds-status-dot--${status}`} />
              <span className={styles.headerTitle}>TDS Terminal</span>
              <span className={styles.headerStatus}>{status === 'connected' && url ? `Connected to ${url}` : status === 'connecting' ? 'Connecting…' : status === 'error' ? 'Error' : 'Not connected'}</span>
            </div>
            <div className={styles.headerActions}>
              <div className={styles.transparencyWrap}>
                <span className={styles.transparencyLabel}>Opacity</span>
                <input
                  className={styles.transparencySlider}
                  type="range"
                  min={35}
                  max={100}
                  step={1}
                  value={panelOpacity}
                  onChange={(e) => setPanelOpacity(Number(e.target.value))}
                  aria-label="Adjust terminal transparency"
                />
              </div>
              <button className={styles.layoutBtn} onClick={() => setLayout(v => v === 'up' ? 'side' : 'up')} aria-label="Toggle panel layout">{layout === 'up' ? 'Side' : 'Up'}</button>
              {(status === 'connecting' || status === 'connected') && url && (
                <button className={styles.layoutBtn} onClick={handleDisconnect} aria-label="Disconnect terminal session">Disconnect</button>
              )}
              {status === 'connected' && (<>
                <button className={styles.iconBtn} onClick={() => setIframeKey(k => k + 1)} aria-label="Refresh"><RotateCcw size={16} /></button>
                <button className={styles.iconBtn} onClick={() => url && window.open(url, '_blank')} aria-label="New tab"><ExternalLink size={16} /></button>
              </>)}
              <span className={styles.kbdBadge}>Ctrl+`</span>
              <button className={styles.iconBtn} onClick={togglePanel} aria-label="Close"><X size={16} /></button>
            </div>
          </div>
          {(status === 'connecting' || status === 'connected') && url ? (
            <iframe key={iframeKey} className={styles.iframe} src={url} sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals" allow="clipboard-read; clipboard-write" onLoad={() => { setError(''); setStatus('connected'); }} onError={() => { setStatus('idle'); setError('Connection failed. Verify URL and ensure code-server is running.'); }} title="Code Server" />
          ) : status === 'error' ? (
            <div className={styles.errorOverlay}>
              <X size={18} />
              {url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1') || url.startsWith('http://[::1]')
                ? 'Failed to connect to local code-server. Ensure code-server is running on that localhost port.'
                : 'Failed to connect. Check your tunnel URL.'}
              <button className={styles.layoutBtn} onClick={handleDisconnect}>Reset Session</button>
            </div>
          ) : (
            <div className={styles.connectPane}>
              <div className={styles.connectCard}>
                <div className={styles.connectLabel}>Your code-server tunnel URL</div>
                <div className={styles.connectHelper}>Auto-connect default: http://127.0.0.1:8080. You can also use a tunnel URL (https://...trycloudflare.com).</div>
                <input className={styles.connectInput} placeholder="http://127.0.0.1:8080 or https://abc123.trycloudflare.com" value={inputUrl} onChange={e => { setInputUrl(e.target.value); if (error) setError(''); }} onKeyDown={e => e.key === 'Enter' && connectUrl()} />
                {error && <div className={styles.connectError}>{error}</div>}
                <button className={styles.connectBtn} onClick={connectUrl}>Connect</button>
              </div>
              <div className={styles.tunnelGuide}>
                <button className={styles.tunnelGuideToggle} onClick={() => setShowGuide(!showGuide)}>
                  {showGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />} How to get a tunnel URL
                </button>
                {showGuide && (
                  <div className={styles.tunnelGuideSteps}>
                    <div className={styles.osGuideScroller}>
                      <div className={styles.osGuideGrid}>
                        <div className={styles.osGuideCard}>
                          <div className={styles.osGuideTitle}>Windows</div>
                          <span className={styles.guideLabel}>Install code-server</span>
                          <code className={styles.tunnelCode}>winget install --id Coder.code-server -e</code>
                          <span className={styles.guideLabel}>Install cloudflared</span>
                          <code className={styles.tunnelCode}>winget install --id Cloudflare.cloudflared -e</code>
                          <span className={styles.guideLabel}>Auto-start code-server</span>
                          <code className={styles.tunnelCode}>schtasks /Create /SC ONLOGON /TN "code-server" /TR "code-server --auth none --bind-addr 127.0.0.1:8080" /F</code>
                        </div>
                        <div className={styles.osGuideCard}>
                          <div className={styles.osGuideTitle}>macOS</div>
                          <span className={styles.guideLabel}>Install code-server</span>
                          <code className={styles.tunnelCode}>brew install code-server</code>
                          <span className={styles.guideLabel}>Install cloudflared</span>
                          <code className={styles.tunnelCode}>brew install cloudflared</code>
                          <span className={styles.guideLabel}>Auto-start code-server</span>
                          <code className={styles.tunnelCode}>brew services start code-server</code>
                        </div>
                        <div className={styles.osGuideCard}>
                          <div className={styles.osGuideTitle}>Linux</div>
                          <span className={styles.guideLabel}>Install code-server</span>
                          <code className={styles.tunnelCode}>curl -fsSL https://code-server.dev/install.sh | sh</code>
                          <span className={styles.guideLabel}>Install cloudflared</span>
                          <code className={styles.tunnelCode}>sudo apt install cloudflared</code>
                          <span className={styles.guideLabel}>Auto-start code-server</span>
                          <code className={styles.tunnelCode}>systemctl --user enable --now code-server</code>
                        </div>
                      </div>
                    </div>
                    <span className={styles.guideSectionTitle}>Start code-server (local only)</span>
                    <code className={styles.tunnelCode}>code-server --auth none --bind-addr 127.0.0.1:8080</code>
                    <span className={styles.guideSectionTitle}>Connect directly in this panel</span>
                    <code className={styles.tunnelCode}>http://127.0.0.1:8080</code>
                    <span className={styles.guideSectionTitle}>Optional remote tunnel (Cloudflare)</span>
                    <code className={styles.tunnelCode}>cloudflared tunnel --url http://127.0.0.1:8080</code>
                    <span className={styles.guideSectionTitle}>Then connect with</span>
                    <code className={styles.tunnelCode}>https://&lt;random&gt;.trycloudflare.com</code>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
    </>
  );
}
export default function CodePanel(): React.ReactElement {
  return <BrowserOnly>{() => <CodePanelInner />}</BrowserOnly>;
}
