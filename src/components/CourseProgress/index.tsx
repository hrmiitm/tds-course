import React, { useState, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
const STORAGE_KEY = 'tds_progress';
const TOTAL = 8;

function Inner({ compact }: { compact?: boolean }): React.ReactElement {
  const [done, setDone] = useState(0);
  useEffect(() => {
    const update = () => { try { const s = localStorage.getItem(STORAGE_KEY); setDone(s ? JSON.parse(s).length : 0); } catch {} };
    update();
    const id = setInterval(update, 500);
    return () => clearInterval(id);
  }, []);
  const pct = Math.round((done / TOTAL) * 100);
  return (
    <div style={{ padding: compact ? '12px 16px' : '24px', background: 'var(--tds-surface-secondary)', borderRadius: 'var(--tds-radius-md)', border: '1px solid var(--tds-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600 }}>{compact ? 'Your progress' : '📊 Course Progress'}</span>
        <span style={{ fontSize: '12px', color: 'var(--tds-text-secondary)' }}>{done}/{TOTAL} ({pct}%)</span>
      </div>
      <div className="tds-progress"><div className="tds-progress__fill" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
export default function CourseProgress({ compact }: { compact?: boolean }): React.ReactElement {
  return <BrowserOnly>{() => <Inner compact={compact} />}</BrowserOnly>;
}
