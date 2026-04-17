import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import { TerminalSquare, BookOpen, ArrowRight, Code2, GitBranch, FlaskConical, Moon, Cloud, Brain, Bot, Shield } from 'lucide-react';
import styles from './index.module.css';

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Structured Curriculum',
    description: '10 weeks covering development tools, LLMs, RAG, agentic AI, vision, finetuning, and MLOps — designed for working engineers.',
  },
  {
    icon: TerminalSquare,
    title: 'Live Coding Environment',
    description: 'Connect your local code-server in one step and write, run, and debug real code without leaving the docs.',
  },
  {
    icon: FlaskConical,
    title: 'Hands-On Labs',
    description: '8 graded labs on real cloud infrastructure within the GCP free tier — no credit card surprises.',
  },
  {
    icon: GitBranch,
    title: 'Modern Toolchain',
    description: 'Git, Docker, FastAPI, Cloud Run, BigQuery ML, Pydantic AI, MCP — the tools companies actually use.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Learning',
    description: 'Built-in AI chatbot to answer questions, explain concepts, and guide you through exercises in real-time.',
  },
  {
    icon: Moon,
    title: 'Dark Mode',
    description: 'Comfortable late-night reading with a fully polished dark theme that extends into the coding terminal.',
  },
];

const STATS = [
  { label: 'Weeks', value: '10' },
  { label: 'Lab exercises', value: '8' },
  { label: 'Tools covered', value: '50+' },
  { label: 'Students enrolled', value: '2,400+' },
];

const FLOATING_ICONS = [
  { icon: Code2, top: '12%', left: '8%', size: 48, animation: 'float1', delay: '0s' },
  { icon: Cloud, top: '18%', right: '10%', size: 40, animation: 'float2', delay: '1s' },
  { icon: GitBranch, bottom: '22%', left: '12%', size: 36, animation: 'float3', delay: '2s' },
  { icon: Bot, bottom: '15%', right: '8%', size: 44, animation: 'float1', delay: '0.5s' },
  { icon: Brain, top: '35%', left: '5%', size: 32, animation: 'float2', delay: '1.5s' },
  { icon: Shield, top: '30%', right: '5%', size: 36, animation: 'float3', delay: '2.5s' },
];

function HomepageHero() {
  return (
    <section className={styles.heroSection}>
      {FLOATING_ICONS.map((item, idx) => {
        const Icon = item.icon;
        const style: Record<string, string> = {
          position: 'absolute',
          opacity: '0.08',
          color: '#ffffff',
          animation: `${item.animation} 4s ease-in-out infinite`,
          animationDelay: item.delay,
          ...('top' in item && { top: item.top }),
          ...('bottom' in item && { bottom: item.bottom }),
          ...('left' in item && { left: item.left }),
          ...('right' in item && { right: item.right }),
        };
        return <Icon key={idx} size={item.size} style={style} />;
      })}
      <h1 className={styles.heroHeadline}>
        Master the Tools of<br />Modern Data Science
      </h1>
      <p className={styles.heroSubheadline}>
        A hands-on course from IIT Madras covering development tools, LLMs, RAG, agentic AI,
        computer vision, finetuning, and cloud deployment — with a live coding environment built right in.
      </p>
      <div className={styles.heroButtons}>
        <Link className={styles.heroBtnPrimary} to="/intro">
          Start Learning <ArrowRight size={18} />
        </Link>
        <button
          className={styles.heroBtnOutline}
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('tds:toggle-terminal'));
            }
          }}
        >
          <TerminalSquare size={18} /> Open Terminal
        </button>
      </div>
    </section>
  );
}

function StatsStrip() {
  return (
    <section className={styles.statsSection}>
      <div className={styles.statsGrid}>
        {STATS.map((stat, idx) => (
          <div key={idx} className={styles.statCard}>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ComponentType<{ size?: number }>; title: string; description: string }) {
  return (
    <div className="tds-card" style={{ padding: '28px' }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        background: 'rgba(26,115,232,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        color: 'var(--ifm-color-primary)',
      }}>
        <Icon size={22} />
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8, color: 'var(--tds-text-primary)' }}>
        {title}
      </h3>
      <p style={{ fontSize: 14, color: 'var(--tds-text-secondary)', lineHeight: 1.6, margin: 0 }}>
        {description}
      </p>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section className={styles.featuresSection}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: 'var(--tds-text-primary)' }}>
          Everything you need to learn
        </h2>
        <p style={{ fontSize: 16, color: 'var(--tds-text-secondary)', maxWidth: 500, margin: '0 auto' }}>
          From data science fundamentals to cutting-edge agentic systems
        </p>
      </div>
      <div className={styles.featuresGrid}>
        {FEATURES.map((feature, idx) => (
          <FeatureCard key={idx} {...feature} />
        ))}
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { number: 1, title: 'Read the docs', description: 'Follow structured chapters at your own pace — from dev tools to MLOps.' },
    { number: 2, title: 'Open the terminal', description: 'Connect your local code-server with one URL paste. Code alongside the docs.' },
    { number: 3, title: 'Build and deploy', description: 'Complete labs on real cloud infrastructure. Ship to production on GCP.' },
  ];

  return (
    <section className={styles.howItWorksSection}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: 'var(--tds-text-primary)' }}>
          How it works
        </h2>
        <p style={{ fontSize: 16, color: 'var(--tds-text-secondary)' }}>
          Three steps to go from zero to production
        </p>
      </div>
      <div className={styles.stepsGrid}>
        {steps.map((step) => (
          <div key={step.number} className={styles.stepCard}>
            <div className={styles.stepNumber}>{step.number}</div>
            <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8, color: 'var(--tds-text-primary)' }}>
              {step.title}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--tds-text-secondary)', lineHeight: 1.6 }}>
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className={styles.ctaSection}>
      <h2 className={styles.ctaHeadline}>Ready to start?</h2>
      <p className={styles.ctaSubtext}>
        Join thousands of students mastering the tools of modern data science.
      </p>
      <Link className={styles.heroBtnPrimary} to="/intro">
        Get Started <ArrowRight size={18} />
      </Link>
    </section>
  );
}

export default function Home(): React.JSX.Element {
  return (
    <Layout
      title="TDS Course — Tools in Data Science"
      description="Learn modern data science tools: from development environments to LLMs, RAG, agentic AI, and cloud deployment. A hands-on course from IIT Madras."
    >
      <HomepageHero />
      <StatsStrip />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
    </Layout>
  );
}
