import React, { useState, useCallback, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { TerminalSquare, X, RotateCcw, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './CodePanel.module.css';

type Status = 'idle' | 'connecting' | 'connected' | 'error';
const STORAGE_KEY = 'tds_tunnel_url';
const DEFAULT_HEIGHT = 60;

function CodePanelInner(): React.ReactElement | null {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [url, setUrl] = useState('');
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [iframeKey, setIframeKey] = useState(0);
  const [inputUrl, setInputUrl] = useState('');
  const [error, setError] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); if (s) setUrl(s); } catch {}
  }, []);

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

  const isDragging = React.useRef(false);
  const startY = React.useRef(0);
  const startH = React.useRef(0);
  const onResize = useCallback((nh: number) => setHeight(nh), []);
  useEffect(() => {
    const mm = (e: MouseEvent) => { if (!isDragging.current) return; const d = startY.current - e.clientY; const n = (startH.current * window.innerHeight + d) / window.innerHeight * 100; onResize(Math.min(85, Math.max(25, n))); };
    const mu = () => { isDragging.current = false; document.body.style.cursor = ''; document.body.style.userSelect = ''; };
    document.addEventListener('mousemove', mm);
    document.addEventListener('mouseup', mu);
    return () => { document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
  }, [onResize]);

  return (
    <>
      <button className={styles.fab} onClick={togglePanel} aria-label={isOpen ? 'Close terminal' : 'Open terminal'}>
        {isOpen ? <X size={22} /> : <TerminalSquare size={22} />}
      </button>
      {isOpen && (
        <div className={styles.drawer} style={{ height: `${height}vh` }}>
          <div className={styles.resizeHandle} onMouseDown={(e) => { isDragging.current = true; startY.current = e.clientY; startH.current = height / 100; document.body.style.cursor = 'ns-resize'; document.body.style.userSelect = 'none'; e.preventDefault(); }} />
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={`tds-status-dot tds-status-dot--${status}`} />
              <span className={styles.headerTitle}>TDS Terminal</span>
              <span className={styles.headerStatus}>{status === 'connected' && url ? `Connected to ${url}` : status === 'connecting' ? 'Connecting…' : status === 'error' ? 'Error' : 'Not connected'}</span>
            </div>
            <div className={styles.headerActions}>
              {status === 'connected' && (<>
                <button className={styles.iconBtn} onClick={() => setIframeKey(k => k + 1)} aria-label="Refresh"><RotateCcw size={16} /></button>
                <button className={styles.iconBtn} onClick={() => url && window.open(url, '_blank')} aria-label="New tab"><ExternalLink size={16} /></button>
              </>)}
              <span className={styles.kbdBadge}>Ctrl+`</span>
              <button className={styles.iconBtn} onClick={togglePanel} aria-label="Close"><X size={16} /></button>
            </div>
          </div>
          {status === 'connected' && url ? (
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
