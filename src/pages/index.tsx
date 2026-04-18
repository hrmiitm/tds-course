import React, { useEffect, useMemo, useState } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  MessageCircle,
  Moon,
  Play,
  Search,
  TerminalSquare,
  Timer,
} from 'lucide-react';
import styles from './index.module.css';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

type Lab = {
  number: number;
  title: string;
  difficulty: Difficulty;
  duration: string;
  href: string;
};

type PhaseId = 'foundations' | 'ai-core' | 'advanced' | 'production';

type Week = {
  id: number;
  title: string;
  description: string;
  href: string;
  hours: number;
  topicsCount: number;
  topics: string[];
  phase: PhaseId;
};

const STORAGE_COMPLETED_WEEKS = 'tds_completed_weeks_v1';

const TOPIC_CHIPS = ['Python', 'Docker', 'LLMs', 'RAG', 'Agents', 'GCP', 'FastAPI'];

const WEEKS: Week[] = [
  {
    id: 1,
    title: 'Dev Env',
    description: 'Set up VS Code, uv, Bash automation, Git workflows, SQLite and GitHub Pages.',
    href: '/week-1',
    hours: 8,
    topicsCount: 6,
    topics: ['VS Code setup', 'uv Python', 'Bash scripting', 'Git & GitHub', 'SQLite', 'GitHub Pages'],
    phase: 'foundations',
  },
  {
    id: 2,
    title: 'Deploy & APIs',
    description: 'FastAPI, Docker, deployments, CORS/REST, auth and shipping real services.',
    href: '/week-2',
    hours: 9,
    topicsCount: 6,
    topics: ['FastAPI', 'Docker', 'Vercel/Render', 'HuggingFace', 'CORS & REST', 'Google Auth'],
    phase: 'foundations',
  },
  {
    id: 3,
    title: 'LLMs',
    description: 'Prompting, structured output, extraction, function calling, embeddings and caching.',
    href: '/week-3',
    hours: 10,
    topicsCount: 8,
    topics: ['Prompt engineering', 'Structured output', 'LLM extraction', 'Function calling', 'LLM CLI', 'Embeddings', 'Prompt caching', 'Instructor'],
    phase: 'ai-core',
  },
  {
    id: 4,
    title: 'RAG',
    description: 'Chunking, vector DBs, hybrid search, reranking, evaluation and multimodal retrieval.',
    href: '/week-4',
    hours: 10,
    topicsCount: 8,
    topics: ['Chunking', 'Vector DBs', 'Hybrid search', 'Reranking', 'RAG evaluation', 'Multimodal embeddings', 'Contextual retrieval', 'GraphRAG'],
    phase: 'ai-core',
  },
  {
    id: 5,
    title: 'Agents',
    description: 'Agent loops, Pydantic AI, MCP protocol/servers and stateful workflows.',
    href: '/week-5',
    hours: 10,
    topicsCount: 6,
    topics: ['LLM agents', 'Pydantic AI', 'MCP protocol', 'MCP server', 'Multimodal agents', 'LangGraph'],
    phase: 'ai-core',
  },
  {
    id: 6,
    title: 'Vision',
    description: 'Vision models, image processing, detection pipelines, audio processing and generation.',
    href: '/week-6',
    hours: 9,
    topicsCount: 9,
    topics: ['Vision models', 'Image processing', 'Grounding DINO', 'Audio processing', 'Image generation', 'Grounding DINO Tiny', 'ColPali', 'Polars', 'DuckDB + Parquet'],
    phase: 'advanced',
  },
  {
    id: 7,
    title: 'Finetune',
    description: 'Finetuning strategy, Gemma adapters, HF ecosystem, packaging and publishing.',
    href: '/week-7',
    hours: 9,
    topicsCount: 7,
    topics: ['Finetuning strategy', 'Gemma finetuning', 'HF ecosystem', 'Python packaging', 'PyPI publishing', 'DPO finetuning', 'uv tools'],
    phase: 'advanced',
  },
  {
    id: 8,
    title: 'CI/CD',
    description: 'GitHub Actions, advanced Docker, guardrails and LLM security best practices.',
    href: '/week-8',
    hours: 8,
    topicsCount: 6,
    topics: ['GitHub Actions', 'Advanced Docker', 'LLM security', 'NeMo Guardrails', 'Security best practices', 'OpenClaw red-teaming'],
    phase: 'advanced',
  },
  {
    id: 9,
    title: 'MLOps I',
    description: 'Train + evaluate on GCP: MLflow, Vertex AI, pipelines, BigQuery ML and DVC.',
    href: '/week-9',
    hours: 9,
    topicsCount: 5,
    topics: ['MLflow', 'Vertex AI', 'Pipelines', 'BigQuery ML', 'Data versioning'],
    phase: 'production',
  },
  {
    id: 10,
    title: 'MLOps II',
    description: 'Deploy + monitor: Cloud Run, drift detection, Pub/Sub retraining and cost control.',
    href: '/week-10',
    hours: 8,
    topicsCount: 5,
    topics: ['Cloud Run', 'Monitoring', 'Pub/Sub functions', 'Artifact Registry', 'Cost optimization'],
    phase: 'production',
  },
];

const PHASES: Array<{
  id: PhaseId;
  title: string;
  subtitle: string;
  accent: 'green' | 'orange' | 'red' | 'teal';
  weeks: number[];
}> = [
  { id: 'foundations', title: 'Foundations', subtitle: 'Weeks 1 & 2', accent: 'green', weeks: [1, 2] },
  { id: 'ai-core', title: 'AI Core', subtitle: 'Weeks 3, 4 & 5', accent: 'orange', weeks: [3, 4, 5] },
  { id: 'advanced', title: 'Advanced AI', subtitle: 'Weeks 6, 7 & 8', accent: 'red', weeks: [6, 7, 8] },
  { id: 'production', title: 'Production', subtitle: 'Weeks 9 & 10', accent: 'teal', weeks: [9, 10] },
];

const LABS: Lab[] = [
  { number: 1, title: 'ChatBot with FastAPI', difficulty: 'Easy', duration: '3h', href: '/labs/lab-01-chatbot' },
  { number: 2, title: 'RAG ChatBot', difficulty: 'Medium', duration: '4h', href: '/labs/lab-02-rag-chatbot' },
  { number: 3, title: 'Gemma4 Finetuning', difficulty: 'Hard', duration: '5h', href: '/labs/lab-03-finetuning' },
  { number: 4, title: 'Hybrid RAG ChatBot', difficulty: 'Medium', duration: '4h', href: '/labs/lab-04-hybrid-rag' },
  { number: 5, title: 'Signature Detection & Cropper', difficulty: 'Medium', duration: '3h', href: '/labs/lab-05-signature-detection' },
  { number: 6, title: 'AI Agent + MCP', difficulty: 'Hard', duration: '5h', href: '/labs/lab-06-ai-agent-mcp' },
  { number: 7, title: 'CI/CD Pipeline', difficulty: 'Medium', duration: '3h', href: '/labs/lab-07-cicd' },
  { number: 8, title: 'Full MLOps on GCP', difficulty: 'Hard', duration: '6h', href: '/labs/lab-08-mlops-gcp' },
  { number: 9, title: 'LLM Red-Teaming', difficulty: 'Hard', duration: '4h', href: '/labs/lab-09-llm-red-teaming' },
  { number: 10, title: 'Instructor Extraction Loops', difficulty: 'Medium', duration: '3h', href: '/labs/lab-10-instructor-extraction' },
  { number: 11, title: 'Prompt Caching & Cost Benchmarks', difficulty: 'Medium', duration: '2h', href: '/labs/lab-11-prompt-caching' },
  { number: 12, title: 'Contextual Retrieval Upgrade', difficulty: 'Medium', duration: '4h', href: '/labs/lab-12-contextual-retrieval' },
  { number: 13, title: 'GraphRAG Mini', difficulty: 'Hard', duration: '5h', href: '/labs/lab-13-graphrag' },
  { number: 14, title: 'LangGraph Agent Workflow', difficulty: 'Hard', duration: '5h', href: '/labs/lab-14-langgraph' },
  { number: 15, title: 'Polars + DuckDB Local Warehouse', difficulty: 'Medium', duration: '4h', href: '/labs/lab-15-polars-duckdb' },
  { number: 16, title: 'Guardrails + Red-Team Regression', difficulty: 'Hard', duration: '5h', href: '/labs/lab-16-guardrails-redteam' },
  { number: 17, title: 'System Design Review', difficulty: 'Hard', duration: '5h', href: '/labs/lab-17-system-design-review' },
];

function safeParseNumberArray(raw: string | null): number[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.map((x) => Number(x)).filter((n) => Number.isFinite(n));
  } catch {
    return [];
  }
}

function useCompletedWeeks(): [number[], (next: number[]) => void] {
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    try {
      setCompleted(safeParseNumberArray(localStorage.getItem(STORAGE_COMPLETED_WEEKS)));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COMPLETED_WEEKS, JSON.stringify(completed));
    } catch {
      // ignore
    }
  }, [completed]);

  return [completed, setCompleted];
}

function SectionHeader({
  badge,
  title,
  subtitle,
  accent,
}: {
  badge?: string;
  title: React.ReactNode;
  subtitle?: string;
  accent?: 'green' | 'orange' | 'red' | 'teal';
}): React.JSX.Element {
  return (
    <header className={styles.sectionHeader}>
      {badge && (
        <div className={styles.sectionBadge} data-accent={accent ?? 'green'}>
          {badge}
        </div>
      )}
      <h2 className={styles.sectionTitle}>{title}</h2>
      {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
    </header>
  );
}

function Hero(): React.JSX.Element {
  return (
    <section className={styles.hero} id="course">
      <div className={styles.heroInner}>
        <div className={styles.heroPill}>TDS Course Platform</div>
        <h1 className={styles.heroTitle}>
          <span className={styles.heroTitleGreen}>Tools</span> <span className={styles.heroTitleMuted}>in</span>{' '}
          <span className={styles.heroTitleWarm}>Data Science</span>
        </h1>
        <div className={styles.heroTagline}>Build. Ship. Scale.</div>
        <p className={styles.heroSubtext}>
          Master the modern data science stack — from development tools and LLMs to production MLOps. Build real projects with hands-on labs and a structured week-by-week path.
        </p>

        <div className={styles.heroActions}>
          <Link className={styles.btnPrimary} to="/intro">
            <Play size={16} /> Start Learning
          </Link>
          <a className={styles.btnSecondary} href="#features">
            Explore Features <ArrowRight size={16} />
          </a>
        </div>

        <div className={styles.heroMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaDot} data-accent="green" />
            10,000+ Students
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaDot} data-accent="orange" />
            4.8/5 Rating
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaDot} data-accent="teal" />
            Certified
          </div>
        </div>

        <div className={styles.heroChips}>
          {TOPIC_CHIPS.map((t) => (
            <span key={t} className={styles.chip}>
              {t}
            </span>
          ))}
        </div>

        <div className={styles.scrollCue} aria-hidden="true">
          <ChevronDown size={18} />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  accent,
  preview,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: 'green' | 'orange' | 'red' | 'teal' | 'purple' | 'blue';
  preview: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className={styles.featureCard} data-accent={accent}>
      <div className={styles.featureTop}>
        <div className={styles.featureIcon}>{icon}</div>
        <div>
          <div className={styles.featureTitle}>{title}</div>
          <div className={styles.featureDesc}>{description}</div>
        </div>
      </div>
      <div className={styles.featurePreview}>{preview}</div>
    </div>
  );
}

function Features(): React.JSX.Element {
  return (
    <section className={styles.section} id="features">
      <div className={styles.container}>
        <SectionHeader
          title={
            <>
              Everything You Need to <span className={styles.wordWarm}>Succeed</span>
            </>
          }
          subtitle="More than just content — an interactive learning platform with tools designed to accelerate your journey."
        />

        <div className={styles.featuresGrid}>
          <FeatureCard
            accent="green"
            icon={<TerminalSquare size={18} />}
            title="Built-in Terminal"
            description="Connect to code-server (localhost or a custom URL) directly in the browser."
            preview={
              <div className={styles.previewTerminal}>
                <div className={styles.previewDots} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <pre className={styles.previewCode}>{`$ uv pip install fastapi\nResolved 12 packages in 0.8s\n$ python -m uvicorn main:app --reload\nINFO: Uvicorn running on http://localhost:8000\n$`}</pre>
              </div>
            }
          />

          <FeatureCard
            accent="orange"
            icon={<MessageCircle size={18} />}
            title="AI Chat Assistant"
            description="Ask questions about any week, lab, or tool and get instant AI-powered answers."
            preview={
              <div className={styles.previewChat}>
                <div className={styles.chatBubbleUser}>What does Week 5 cover?</div>
                <div className={styles.chatBubbleBot}>
                  Week 5 covers AI Agents: LLM agents, Pydantic AI, MCP Protocol, MCP Server, LangGraph, and multimodal agents.
                </div>
              </div>
            }
          />

          <FeatureCard
            accent="red"
            icon={<Timer size={18} />}
            title="Pomodoro Timer"
            description="Stay focused with a built-in Pomodoro timer for productive study sessions."
            preview={
              <div className={styles.previewTimer}>
                <div className={styles.timerValue}>25:00</div>
                <div className={styles.timerLabel}>Focus Session • 1/4 Pomodoros</div>
                <div className={styles.timerBar} aria-hidden="true">
                  <span style={{ width: '35%' }} />
                </div>
              </div>
            }
          />

          <FeatureCard
            accent="teal"
            icon={<BarChart3 size={18} />}
            title="Progress Tracking"
            description="Track your progress across all 10 weeks and labs with persistent storage."
            preview={
              <div className={styles.previewProgressMini}>
                <div className={styles.miniRow}>
                  <span>Overall Progress</span>
                  <span className={styles.miniPct}>45%</span>
                </div>
                <div className={styles.miniSegments} aria-hidden="true">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span key={i} className={i < 5 ? styles.miniSegOn : styles.miniSegOff} />
                  ))}
                </div>
              </div>
            }
          />

          <FeatureCard
            accent="purple"
            icon={<Moon size={18} />}
            title="Dark Mode"
            description="Easy on the eyes with a beautiful dark theme that matches your preference."
            preview={
              <div className={styles.previewToggle}>
                <span className={styles.toggleLabel}>Light</span>
                <span className={styles.togglePill} aria-hidden="true">
                  <span className={styles.toggleKnob} />
                </span>
                <span className={styles.toggleLabel}>Dark</span>
              </div>
            }
          />

          <FeatureCard
            accent="blue"
            icon={<Search size={18} />}
            title="Local Search"
            description="Search through all course content instantly without leaving the page."
            preview={
              <div className={styles.previewSearch}>
                <div className={styles.searchBox}>
                  <Search size={14} /> <span className={styles.searchHint}>RAG evaluation…</span>
                </div>
                <div className={styles.searchResults}>
                  <div className={styles.searchItem}>RAG Evaluation (RAGAS)</div>
                  <div className={styles.searchItem}>Chunking Strategies</div>
                  <div className={styles.searchItem}>Vector Databases</div>
                </div>
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}

function PhaseAccordion(): React.JSX.Element {
  const [open, setOpen] = useState<PhaseId>('ai-core');
  const [openTopics, setOpenTopics] = useState<Record<number, boolean>>({});

  const weeksById = useMemo(() => new Map(WEEKS.map((w) => [w.id, w])), []);

  return (
    <section className={styles.section} id="design">
      <div className={styles.container}>
        <SectionHeader
          title={
            <>
              4 Phases. <span className={styles.wordGreen}>Zero</span> to <span className={styles.wordWarm}>Production</span>.
            </>
          }
          subtitle="A structured journey from development fundamentals to production ML systems. Each phase builds on the last, with hands-on labs every step of the way."
        />

        <div className={styles.phases}>
          {PHASES.map((phase) => {
            const isOpen = open === phase.id;
            return (
              <div key={phase.id} className={styles.phase} data-accent={phase.accent}>
                <button
                  type="button"
                  className={styles.phaseBtn}
                  onClick={() => setOpen((p) => (p === phase.id ? p : phase.id))}
                  aria-expanded={isOpen}
                >
                  <div className={styles.phaseLeft}>
                    <div className={styles.phaseIcon} aria-hidden="true" />
                    <div>
                      <div className={styles.phaseTitle}>{phase.title}</div>
                      <div className={styles.phaseSubtitle}>{phase.subtitle}</div>
                    </div>
                  </div>
                  <ChevronDown size={18} className={isOpen ? styles.chevUp : styles.chevDown} />
                </button>

                {isOpen && (
                  <div className={styles.phaseBody}>
                    <div className={styles.weekGrid}>
                      {phase.weeks.map((id) => {
                        const w = weeksById.get(id)!;
                        const topicsOpen = Boolean(openTopics[w.id]);
                        return (
                          <article key={w.id} className={styles.weekCard}>
                            <div className={styles.weekTop}>
                              <div className={styles.weekPill}>Week {w.id}</div>
                              <div className={styles.weekTitle}>{w.title}</div>
                              <div className={styles.weekDesc}>{w.description}</div>
                            </div>

                            <button
                              type="button"
                              className={styles.weekTopicsBtn}
                              onClick={() => setOpenTopics((prev) => ({ ...prev, [w.id]: !prev[w.id] }))}
                            >
                              {topicsOpen ? 'Hide topics' : 'Show topics'} <ArrowRight size={14} />
                            </button>

                            {topicsOpen && (
                              <ul className={styles.weekTopics}>
                                {w.topics.map((t) => (
                                  <li key={t}>{t}</li>
                                ))}
                              </ul>
                            )}

                            <Link className={styles.weekCta} to={w.href}>
                              <Play size={16} /> Explore Week {w.id}
                            </Link>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProgressTracker(): React.JSX.Element {
  const [completed, setCompleted] = useCompletedWeeks();

  const completedSet = useMemo(() => new Set(completed), [completed]);

  const completedCount = completedSet.size;
  const total = WEEKS.length;
  const pct = Math.round((completedCount / total) * 100);

  const toggleWeek = (id: number) => {
    setCompleted(
      completedSet.has(id)
        ? completed.filter((x) => x !== id)
        : Array.from(new Set([...completed, id])).sort((a, b) => a - b)
    );
  };

  return (
    <section className={styles.section} id="progress">
      <div className={styles.container}>
        <SectionHeader
          badge="Progress Tracker"
          accent="teal"
          title={
            <>
              Track Your <span className={styles.wordTeal}>Journey</span>
            </>
          }
          subtitle="Mark weeks as complete and track your overall progress. Your data persists across sessions."
        />

        <div className={styles.progressGrid}>
          <div className={styles.progressCard}>
            <div className={styles.progressCardTitle}>Overall Progress</div>
            <div className={styles.progressPct}>{pct}%</div>
            <div className={styles.progressSub}>
              {completedCount} of {total} weeks completed
            </div>

            <div className={styles.progressBar} aria-hidden="true">
              <span style={{ width: `${pct}%` }} />
            </div>

            <div className={styles.progressStats}>
              <div className={styles.statBox} data-accent="teal">
                <div className={styles.statNum}>{completedCount}</div>
                <div className={styles.statLabel}>Completed</div>
              </div>
              <div className={styles.statBox} data-accent="orange">
                <div className={styles.statNum}>{total - completedCount}</div>
                <div className={styles.statLabel}>Remaining</div>
              </div>
            </div>

            <div className={styles.segmented} aria-hidden="true">
              {WEEKS.map((w) => (
                <span key={w.id} className={completedSet.has(w.id) ? styles.segOn : styles.segOff} />
              ))}
            </div>
          </div>

          <div className={styles.progressCard}>
            <div className={styles.progressCardTitle}>Week-by-Week Progress</div>
            <div className={styles.weekList}>
              {WEEKS.map((w) => {
                const done = completedSet.has(w.id);
                return (
                  <button key={w.id} type="button" className={styles.weekRow} onClick={() => toggleWeek(w.id)}>
                    <span className={styles.weekNumBadge}>{w.id}</span>
                    <span className={styles.weekRowMain}>
                      <span className={styles.weekRowTitle}>{`Week ${w.id}: ${w.title}`}</span>
                    </span>
                    <span className={done ? styles.weekDone : styles.weekTodo} aria-hidden="true">
                      {done ? <CheckCircle2 size={16} /> : ''}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className={styles.progressHint}>Tip: click a week to mark it complete.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LabsSection(): React.JSX.Element {
  const badgeClass = (d: Difficulty): string => {
    if (d === 'Easy') return styles.labEasy;
    if (d === 'Medium') return styles.labMedium;
    return styles.labHard;
  };

  return (
    <section className={styles.section} id="labs">
      <div className={styles.container}>
        <SectionHeader
          badge="Hands-On Labs"
          accent="red"
          title={
            <>
              {LABS.length} Hands-On Labs — <span className={styles.wordWarm}>Learn</span> by Building
            </>
          }
          subtitle="Every lab is a real-world project. Deploy, build, and ship production-quality systems from week 1. These labs form the core of your learning."
        />

        <div className={styles.labsGrid}>
          {LABS.map((lab) => (
            <Link key={lab.number} to={lab.href} className={styles.labCard}>
              <div className={styles.labTop}>
                <div className={styles.labTitleRow}>
                  <span className={styles.labNum}>#{lab.number}</span>
                  <span className={styles.labName}>{lab.title}</span>
                </div>
                <div className={styles.labMeta}>
                  <span className={`${styles.labBadge} ${badgeClass(lab.difficulty)}`}>{lab.difficulty}</span>
                  <span className={styles.labTime}>{lab.duration}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.labsFooter}>
          <Link className={styles.btnSecondary} to="/labs">
            Browse all labs <ArrowRight size={16} />
          </Link>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('tds:toggle-pomodoro'));
              }
            }}
          >
            <Timer size={16} /> Open Pomodoro
          </button>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('tds:open-terminal'));
              }
            }}
          >
            <TerminalSquare size={16} /> Open Terminal
          </button>
        </div>
      </div>
    </section>
  );
}

function BottomCTA(): React.JSX.Element {
  return (
    <section className={styles.cta} id="community">
      <div className={styles.container}>
        <div className={styles.ctaInner}>
          <div>
            <div className={styles.ctaTitle}>Start building today.</div>
            <div className={styles.ctaSub}>Learn fast by shipping real projects — not just reading.</div>
          </div>
          <div className={styles.ctaActions}>
            <Link className={styles.btnPrimary} to="/intro">
              <Play size={16} /> Start Learning
            </Link>
            <a className={styles.btnSecondary} href="https://github.com/iit-madras/tds-course">
              Community / GitHub <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): React.JSX.Element {
  return (
    <Layout
      title="TDS Course — Tools in Data Science"
      description="Learn modern data science tools: development environments, LLMs, RAG, agents, and deployment — with hands-on labs and a clean, focused learning UI."
    >
      <main className={styles.page}>
        <Hero />
        <Features />
        <PhaseAccordion />
        <ProgressTracker />
        <LabsSection />
        <BottomCTA />
      </main>
    </Layout>
  );
}
