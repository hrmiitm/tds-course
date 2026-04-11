import React from 'react';
import Link from '@docusaurus/Link';
import { ArrowRight, TerminalSquare } from 'lucide-react';

export default function HomepageHero(): React.ReactElement {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: 'var(--tds-hero-gradient)', padding: '80px 24px 96px', textAlign: 'center', minHeight: 480, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 999, fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 500, marginBottom: 24 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} /> IIT Madras — Online Degree Programme
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.1, color: '#fff', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
          Master the Tools of<br />
          <span style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 40%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Modern Data Science</span>
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: 'rgba(255,255,255,0.85)', maxWidth: 580, margin: '0 auto 32px' }}>
          A hands-on course covering Data Science, MLOps, DevOps, Full-Stack Development, Cloud Deployment, and Agentic Systems — with a live coding environment built right in.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
          <Link to="/intro" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#fff', color: '#114d99', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}>Start Learning <ArrowRight size={18} /></Link>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: 'pointer' }} onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: '`', ctrlKey: true }))}>
            <TerminalSquare size={18} /> Open Terminal
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {['Data Science', 'MLOps', 'Docker', 'Kubernetes', 'Cloud Run', 'BigQuery ML', 'Agentic AI'].map(t => (
            <span key={t} style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 999, fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
