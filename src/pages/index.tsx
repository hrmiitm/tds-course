import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { ArrowRight, BookOpenCheck, TerminalSquare, Code } from 'lucide-react';
import HomepageHero from '@site/src/components/HomepageHero';
import FeatureCard from '@site/src/components/FeatureCard';
import CourseProgress from '@site/src/components/CourseProgress';
import LabCard from '@site/src/components/LabCard';

const FEATURES = [
  { icon: 'BookOpen', title: 'Structured Curriculum', description: 'Three chapters covering MLOps foundations, DevOps tooling, and cloud platforms.' },
  { icon: 'TerminalSquare', title: 'Live Coding Environment', description: 'Connect your local code-server in one step and code without leaving the docs.' },
  { icon: 'FlaskConical', title: 'Hands-On Labs', description: 'Three graded labs on real cloud infrastructure within the GCP free tier.' },
  { icon: 'GitBranch', title: 'Modern Toolchain', description: 'Git, Docker, Kubernetes, Cloud Run, BigQuery ML — the tools companies use.' },
  { icon: 'Search', title: 'Full-Text Search', description: 'Find any concept, command, or code snippet instantly across all pages.' },
  { icon: 'Moon', title: 'Dark Mode', description: 'Comfortable late-night reading with a fully polished dark theme.' },
];
const STATS = [{ label: 'Chapters', value: '3' }, { label: 'Lab exercises', value: '3' }, { label: 'Tools covered', value: '12+' }, { label: 'Students enrolled', value: '2,400+' }];

export default function HomePage(): React.ReactElement {
  return (
    <Layout title="TDS Course" description="Tools in Data Science — IIT Madras">
      <HomepageHero />
      <section style={{ padding: '48px 24px', background: 'var(--tds-surface)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {STATS.map(s => <div key={s.label} style={{ textAlign: 'center', padding: '20px 12px' }}><div style={{ fontSize: 32, fontWeight: 700, color: 'var(--ifm-color-primary)', marginBottom: 6 }}>{s.value}</div><div style={{ fontSize: 13, color: 'var(--tds-text-secondary)', fontWeight: 500 }}>{s.label}</div></div>)}
        </div>
      </section>
      <section style={{ padding: '64px 24px', background: 'var(--tds-surface-secondary)' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}><h2 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 10px' }}>Everything you need to learn</h2><p style={{ fontSize: 16, color: 'var(--tds-text-secondary)', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>From data science fundamentals to production cloud deployments.</p></div>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>{FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}</div>
      </section>
      <section style={{ padding: '64px 24px', background: 'var(--tds-surface)' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}><h2 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 10px' }}>How it works</h2></div>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[{ n: 1, Icon: BookOpenCheck, t: 'Read the docs', d: 'Follow structured chapters at your own pace.' }, { n: 2, Icon: TerminalSquare, t: 'Open the terminal', d: 'Connect your local code-server with one URL paste.' }, { n: 3, Icon: Code, t: 'Build and deploy', d: 'Complete labs on real cloud infrastructure.' }].map(s => (
            <div key={s.n} style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ifm-color-primary)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, marginBottom: 16 }}>{s.n}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 12, background: 'rgba(26,115,232,0.08)', color: 'var(--ifm-color-primary)', marginBottom: 12 }}><s.Icon size={24} /></div>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 6px' }}>{s.t}</h3>
              <p style={{ fontSize: 14, color: 'var(--tds-text-secondary)', margin: 0, lineHeight: 1.5 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding: '48px 24px', background: 'var(--tds-surface-secondary)' }}><div style={{ maxWidth: 960, margin: '0 auto' }}><CourseProgress /></div></section>
      <section style={{ padding: '64px 24px', background: 'var(--tds-surface)' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}><h2 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 10px' }}>Hands-on Labs</h2></div>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          <LabCard labNumber={1} title="Build a Data Pipeline" description="Design a reproducible data pipeline using Python, pandas, and GCS." duration="~2 hours" difficulty="Beginner" tags={["Python", "GCS", "pandas"]} href="/labs/lab-01-data-pipeline" />
          <LabCard labNumber={2} title="Containerise and Serve" description="Package as FastAPI in Docker and deploy to Cloud Run." duration="~3 hours" difficulty="Intermediate" tags={["Docker", "FastAPI", "Cloud Run"]} href="/labs/lab-02-containerisation" />
          <LabCard labNumber={3} title="End-to-End Cloud Deploy" description="Cloud Function → BigQuery ML → Cloud Run → Monitoring." duration="~4 hours" difficulty="Advanced" tags={["BigQuery ML", "Cloud Functions"]} href="/labs/lab-03-cloud-deploy" />
        </div>
      </section>
      <section style={{ padding: '64px 24px', background: 'var(--tds-hero-gradient)', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>Ready to start?</h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', maxWidth: 400, margin: '0 auto 24px', lineHeight: 1.6 }}>Begin your journey through MLOps, DevOps, and Cloud Platforms.</p>
        <Link to="/intro" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#fff', color: '#114d99', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>Get Started <ArrowRight size={18} /></Link>
      </section>
    </Layout>
  );
}
