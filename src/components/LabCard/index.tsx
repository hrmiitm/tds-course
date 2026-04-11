import React from 'react';
import Link from '@docusaurus/Link';
import { Clock, ArrowRight } from 'lucide-react';
const colors: Record<string, string> = { Beginner: 'var(--tds-success)', Intermediate: 'var(--tds-warning)', Advanced: 'var(--tds-error)' };

export default function LabCard({ labNumber, title, description, duration, difficulty, tags, href }: { labNumber: number; title: string; description: string; duration: string; difficulty: string; tags: string[]; href: string }): React.ReactElement {
  const c = colors[difficulty] || '#666';
  return (
    <div className="tds-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ height: 4, background: c }} />
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ width: 32, height: 32, borderRadius: 8, background: `${c}15`, color: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>{labNumber}</span>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--tds-text-primary)', margin: 0 }}>{title}</h3>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--tds-text-secondary)', margin: '0 0 16px' }}>{description}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {tags.map(t => <span key={t} style={{ padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500, background: 'rgba(26,115,232,0.08)', color: 'var(--ifm-color-primary)' }}>{t}</span>)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--tds-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--tds-text-tertiary)' }}><Clock size={13} /> {duration}</span>
            <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: `${c}15`, color: c }}>{difficulty}</span>
          </div>
          <Link to={href} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500, color: 'var(--ifm-color-primary)' }}>Start Lab <ArrowRight size={14} /></Link>
        </div>
      </div>
    </div>
  );
}
