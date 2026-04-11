import React, { useState, useCallback, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { TerminalSquare, X, RotateCcw, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './CodePanel.module.css';

type Status = 'idle' | 'connecting' | 'connected' | 'error';
const STORAGE_KEY = 'tds_tunnel_url';
const LAYOUT_KEY = 'tds_terminal_layout';
const SIDE_WIDTH_KEY = 'tds_terminal_side_width';
const OPACITY_KEY = 'tds_terminal_opacity';
const DEFAULT_HEIGHT = 60;
const DEFAULT_SIDE_WIDTH = 56;
const DEFAULT_OPACITY = 92;

function CodePanelInner(): React.ReactElement | null {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [url, setUrl] = useState('');
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [sideWidth, setSideWidth] = useState(DEFAULT_SIDE_WIDTH);
  const [panelOpacity, setPanelOpacity] = useState(DEFAULT_OPACITY);
  const [iframeKey, setIframeKey] = useState(0);
  const [inputUrl, setInputUrl] = useState('');
  const [error, setError] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [layout, setLayout] = useState<'up' | 'side'>('up');

  useEffect(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); if (s) setUrl(s); } catch {}
    try { const savedLayout = localStorage.getItem(LAYOUT_KEY); if (savedLayout === 'up' || savedLayout === 'side') setLayout(savedLayout); } catch {}
    try {
      const savedSideWidth = localStorage.getItem(SIDE_WIDTH_KEY);
      const parsed = savedSideWidth ? Number(savedSideWidth) : NaN;
      if (!Number.isNaN(parsed)) setSideWidth(Math.min(85, Math.max(28, parsed)));
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
    try { localStorage.setItem(SIDE_WIDTH_KEY, String(sideWidth)); } catch {}
  }, [sideWidth]);

  useEffect(() => {
    try { localStorage.setItem(OPACITY_KEY, String(panelOpacity)); } catch {}
  }, [panelOpacity]);

  const togglePanel = useCallback(() => setIsOpen(p => !p), []);

  const handleConnect = useCallback((newUrl: string) => {
    setStatus('connecting'); setUrl(newUrl);
    try { localStorage.setItem(STORAGE_KEY, newUrl); } catch {}
  }, []);

  const handleDisconnect = useCallback(() => {
    setStatus('idle'); setUrl(''); setIframeKey(k => k + 1);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.ctrlKey && e.key === '`') { e.preventDefault(); togglePanel(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [togglePanel]);

  const connectUrl = () => {
    const t = inputUrl.trim();
    if (!t) { setError('Please enter a URL'); return; }
    if (!t.startsWith('https://')) { setError('URL must start with https://'); return; }
    setError(''); handleConnect(t);
  };

  const dragMode = React.useRef<'none' | 'up' | 'side'>('none');
  const startY = React.useRef(0);
  const startH = React.useRef(0);
  const startX = React.useRef(0);
  const startW = React.useRef(0);
  const onResizeHeight = useCallback((nh: number) => setHeight(nh), []);
  const onResizeWidth = useCallback((nw: number) => setSideWidth(nw), []);
  useEffect(() => {
    const mm = (e: MouseEvent) => {
      if (dragMode.current === 'none') return;
      if (dragMode.current === 'up') {
        const d = startY.current - e.clientY;
        const n = (startH.current * window.innerHeight + d) / window.innerHeight * 100;
        onResizeHeight(Math.min(85, Math.max(25, n)));
        return;
      }
      const d = startX.current - e.clientX;
      const n = (startW.current * window.innerWidth + d) / window.innerWidth * 100;
      onResizeWidth(Math.min(85, Math.max(28, n)));
    };
    const mu = () => { dragMode.current = 'none'; document.body.style.cursor = ''; document.body.style.userSelect = ''; };
    document.addEventListener('mousemove', mm);
    document.addEventListener('mouseup', mu);
    return () => { document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
  }, [onResizeHeight, onResizeWidth]);

  return (
    <>
      <button className={styles.fab} onClick={togglePanel} aria-label={isOpen ? 'Close terminal' : 'Open terminal'}>
        {isOpen ? <X size={22} /> : <TerminalSquare size={22} />}
      </button>
      {isOpen && (
        <div
          className={`${styles.drawer} ${layout === 'side' ? styles.drawerSide : styles.drawerUp}`}
          style={{
            ...(layout === 'up' ? { height: `${height}vh` } : { width: `${sideWidth}vw` }),
            ['--tds-panel-opacity' as string]: String(panelOpacity / 100),
          } as React.CSSProperties}
        >
          {layout === 'up' && (
            <div className={styles.resizeHandle} onMouseDown={(e) => { dragMode.current = 'up'; startY.current = e.clientY; startH.current = height / 100; document.body.style.cursor = 'ns-resize'; document.body.style.userSelect = 'none'; e.preventDefault(); }} />
          )}
          {layout === 'side' && (
            <div className={styles.sideResizeHandle} onMouseDown={(e) => { dragMode.current = 'side'; startX.current = e.clientX; startW.current = sideWidth / 100; document.body.style.cursor = 'ew-resize'; document.body.style.userSelect = 'none'; e.preventDefault(); }} />
          )}
          <div className={styles.header}>
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
              {status === 'connected' && (<>
                <button className={styles.iconBtn} onClick={() => setIframeKey(k => k + 1)} aria-label="Refresh"><RotateCcw size={16} /></button>
                <button className={styles.iconBtn} onClick={() => url && window.open(url, '_blank')} aria-label="New tab"><ExternalLink size={16} /></button>
              </>)}
              <span className={styles.kbdBadge}>Ctrl+`</span>
              <button className={styles.iconBtn} onClick={togglePanel} aria-label="Close"><X size={16} /></button>
            </div>
          </div>
          {(status === 'connecting' || status === 'connected') && url ? (
            <iframe key={iframeKey} className={styles.iframe} src={url} sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals" allow="clipboard-read; clipboard-write" onLoad={() => setStatus('connected')} onError={() => setStatus('error')} title="Code Server" />
          ) : status === 'error' ? (
            <div className={styles.errorOverlay}><X size={18} /> Failed to connect. Check your tunnel URL.</div>
          ) : (
            <div className={styles.connectPane}>
              <div className={styles.connectCard}>
                <div className={styles.connectLabel}>Your code-server tunnel URL</div>
                <div className={styles.connectHelper}>Run: cloudflared tunnel --url http://localhost:8080 then paste the HTTPS URL</div>
                <input className={styles.connectInput} placeholder="https://abc123.trycloudflare.com" value={inputUrl} onChange={e => { setInputUrl(e.target.value); if (error) setError(''); }} onKeyDown={e => e.key === 'Enter' && connectUrl()} />
                {error && <div className={styles.connectError}>{error}</div>}
                <button className={styles.connectBtn} onClick={connectUrl}>Connect</button>
              </div>
              <div className={styles.tunnelGuide}>
                <button className={styles.tunnelGuideToggle} onClick={() => setShowGuide(!showGuide)}>
                  {showGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />} How to get a tunnel URL
                </button>
                {showGuide && (
                  <div className={styles.tunnelGuideSteps}>
                    <strong>Step 1</strong> — Install cloudflared<br /><code className={styles.tunnelCode}>brew install cloudflared</code>
                    <strong>Step 2</strong> — Start code-server<br /><code className={styles.tunnelCode}>code-server --auth none --bind-addr 127.0.0.1:8080</code>
                    <strong>Step 3</strong> — Open tunnel<br /><code className={styles.tunnelCode}>cloudflared tunnel --url http://localhost:8080</code>
                    <strong>Step 4</strong> — Copy the HTTPS URL and paste it above
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
export default function CodePanel(): React.ReactElement {
  return <BrowserOnly>{() => <CodePanelInner />}</BrowserOnly>;
}
