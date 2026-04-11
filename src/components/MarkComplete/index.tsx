import React, { useState, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
const K = 'tds_progress';

function Inner({ docId }: { docId: string }): React.ReactElement {
  const [done, setDone] = useState(false);
  useEffect(() => { try { const a = JSON.parse(localStorage.getItem(K) || '[]'); setDone(a.includes(docId)); } catch {} }, [docId]);
  const toggle = () => {
    try {
      const a: string[] = JSON.parse(localStorage.getItem(K) || '[]');
      const n = a.includes(docId) ? a.filter(x => x !== docId) : [...a, docId];
      localStorage.setItem(K, JSON.stringify(n));
      setDone(!done);
      window.dispatchEvent(new StorageEvent('storage', { key: K }));
    } catch {}
  };
  return (
    <div className="tds-mark-complete">
      <button onClick={toggle} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: done ? 'rgba(29,158,117,0.1)' : 'var(--ifm-color-primary)', color: done ? 'var(--tds-success)' : '#fff', border: done ? '1.5px solid var(--tds-success)' : 'none', borderRadius: 'var(--tds-radius-md)', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
        {done ? '✓ Completed' : 'Mark as complete'}
      </button>
    </div>
  );
}
export default function MarkComplete({ docId }: { docId: string }): React.ReactElement {
  return <BrowserOnly>{() => <Inner docId={docId} />}</BrowserOnly>;
}
