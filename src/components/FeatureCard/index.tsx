import React from 'react';
import { BookOpen, TerminalSquare, FlaskConical, GitBranch, Search, Moon } from 'lucide-react';
const icons: Record<string, React.ElementType> = { BookOpen, TerminalSquare, FlaskConical, GitBranch, Search, Moon };

export default function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }): React.ReactElement {
  const Icon = icons[icon] || BookOpen;
  return (
    <div className="tds-card" style={{ textAlign: 'left' }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(26,115,232,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: 'var(--ifm-color-primary)' }}><Icon size={22} /></div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--tds-text-primary)', margin: '0 0 8px' }}>{title}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--tds-text-secondary)', margin: 0 }}>{description}</p>
    </div>
  );
}
