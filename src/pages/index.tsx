import React, { useMemo, useState } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import {
  ArrowRight,
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
  usedIn?: string;
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


const TOPIC_CHIPS = ['UV', 'FastAPI', 'Docker', 'LLMs', 'RAG', 'Agents', 'MLOps'];

const WEEKS: Week[] = [
  {
    id: 1,
    title: 'Tooling',
    description:
      'VS Code, UV, Bash automation, Git, SQLite, HTTP clients, data formats, and publishing workflows.',
    href: '/week-1',
    hours: 8,
    topicsCount: 10,
    topics: [
      'VS Code',
      'UV',
      'Bash scripting',
      'Git & GitHub',
      'SQLite',
      'HTTP clients',
      'Requestly',
      'Data formats',
      'GitHub Pages',
      'LaTeX',
    ],
    phase: 'foundations',
  },
  {
    id: 2,
    title: 'APIs',
    description: 'FastAPI, Docker, auth, observability, caching, and deploying real services.',
    href: '/week-2',
    hours: 9,
    topicsCount: 12,
    topics: [
      'FastAPI',
      'CORS & middleware',
      'Google OAuth 2.0',
      'FastAPI advanced',
      'Config management',
      'Docker & Compose',
      'Deployment platforms',
      'Logging & testing',
      'Observability',
      'Cloudflare tunnels',
      'Local LLMs',
      'Redis caching',
    ],
    phase: 'foundations',
  },
  {
    id: 3,
    title: 'LLMs',
    description:
      'Prompt & context engineering, structured output, embeddings, similarity search, caching, and tracing.',
    href: '/week-3',
    hours: 10,
    topicsCount: 11,
    topics: [
      'Prompt engineering',
      'Context engineering',
      'LLM CLI tools',
      'AI coding assistants',
      'Structured output',
      'Multimodal inputs',
      'Vector embeddings',
      'Similarity search',
      'Prompt caching',
      'LangSmith & LiteLLM',
      'LLM architecture survey',
    ],
    phase: 'ai-core',
  },
  {
    id: 4,
    title: 'RAG',
    description: 'Chunking, vector DBs, hybrid search, reranking, grounding, evaluation, and semantic caching.',
    href: '/week-4',
    hours: 10,
    topicsCount: 12,
    topics: [
      'Chunking strategies',
      'Vector databases',
      'Hybrid search',
      'Query augmentation',
      'Reranking',
      'RAGAS evaluation',
      'Multimodal embeddings',
      'LLM grounding',
      'Late chunking',
      'GraphRAG',
      'Contextual retrieval',
      'Semantic caching',
    ],
    phase: 'ai-core',
  },
  {
    id: 5,
    title: 'Agents',
    description: 'Agent loops, tool calling, async execution, LangGraph, MCP, memory, and evaluation.',
    href: '/week-5',
    hours: 10,
    topicsCount: 11,
    topics: [
      'Agent fundamentals',
      'Function / tool calling',
      'Async & parallelism',
      'LangGraph',
      'MCP',
      'Custom MCP servers',
      'Specialized agents',
      'Multi-agent systems',
      'Agent memory systems',
      'Sandboxing',
      'Agent evaluation',
    ],
    phase: 'advanced',
  },
  {
    id: 6,
    title: 'Scraping',
    description: 'Web scraping, document parsing, DuckDB/Parquet analytics, and multimodal data pipelines.',
    href: '/week-6',
    hours: 9,
    topicsCount: 14,
    topics: [
      'Playwright & Selenium',
      'Crawl4AI',
      'Firecrawl & Apify',
      'Scrapy',
      'Anti-bot patterns',
      'Scheduled scraping',
      'Document parsing',
      'DuckDB + Parquet',
      'Firestore',
      'Vision models for scraping',
      'Image processing pipeline',
      'Speech AI',
      'Video understanding',
      'LLM architecture',
    ],
    phase: 'advanced',
  },
  {
    id: 7,
    title: 'CI/CD',
    description: 'GitHub Actions, container security, red-teaming + guardrails, cloud infra basics, and IaC.',
    href: '/week-7',
    hours: 9,
    topicsCount: 10,
    topics: [
      'GitHub Actions advanced',
      'Advanced Docker',
      'LLM security (offensive)',
      'LLM safety (defensive)',
      'OWASP LLM Top 10',
      'VMs & SSH',
      'Serverless functions',
      'Terraform (IaC)',
      'Cost alerting',
      'Pub/Sub & event-driven',
    ],
    phase: 'production',
  },
  {
    id: 8,
    title: 'MLOps',
    description:
      'MLflow, BigQuery ML, fine-tuning, quantization, Vertex AI pipelines, and publishing models responsibly.',
    href: '/week-8',
    hours: 8,
    topicsCount: 10,
    topics: [
      'Cloud storage for ML',
      'BigQuery ML',
      'MLflow',
      'Fine-tuning strategy',
      'HuggingFace ecosystem',
      'Fine-tuning techniques',
      'Quantization',
      'Gemma 4 fine-tuning',
      'GCP ML pipeline',
      'Model publishing',
    ],
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
  { id: 'ai-core', title: 'LLM + RAG', subtitle: 'Weeks 3 & 4', accent: 'orange', weeks: [3, 4] },
  { id: 'advanced', title: 'Agents + Data', subtitle: 'Weeks 5 & 6', accent: 'red', weeks: [5, 6] },
  { id: 'production', title: 'Production', subtitle: 'Weeks 7 & 8', accent: 'teal', weeks: [7, 8] },
];

const LABS: Lab[] = [
  {
    number: 1,
    title: 'Publish a Python library to PyPI (UV)',
    difficulty: 'Medium',
    duration: '3h',
    href: '/labs/week-1/publish-python-library-pypi-uv',
  },
  {
    number: 2,
    title: 'UV CLI tool + LaTeX documentation PDF',
    difficulty: 'Medium',
    duration: '3h',
    href: '/labs/week-1/uv-cli-tool-latex-docs',
  },
  {
    number: 3,
    title: 'Bash automation: daily project summary',
    difficulty: 'Easy',
    duration: '2h',
    href: '/labs/week-1/bash-daily-project-summary',
  },
  {
    number: 4,
    title: 'Gemma API on HuggingFace Spaces (Google Auth)',
    difficulty: 'Hard',
    duration: '4h',
    href: '/labs/week-2/gemma-api-hf-spaces-google-auth',
  },
  {
    number: 5,
    title: 'FastAPI observability + Grafana dashboard',
    difficulty: 'Hard',
    duration: '4h',
    href: '/labs/week-2/fastapi-observability-grafana',
  },
  {
    number: 6,
    title: 'YouTube → subtitles → topics → timestamps + JSON',
    difficulty: 'Medium',
    duration: '4h',
    href: '/labs/week-3/youtube-subtitles-topics-json-pipeline',
  },
  {
    number: 7,
    title: 'Cost-tracking dashboard (LangSmith)',
    difficulty: 'Medium',
    duration: '3h',
    href: '/labs/week-3/cost-tracking-dashboard-langsmith',
  },
  {
    number: 8,
    title: 'CAPSTONE: BS Degree Chatbot (Hybrid RAG)',
    difficulty: 'Hard',
    duration: '6h',
    href: '/labs/week-4/capstone-bs-degree-chatbot',
    usedIn: 'BS Website (BS Office)',
  },
  {
    number: 9,
    title: 'CAPSTONE: Policy Chatbot (Guardrails)',
    difficulty: 'Hard',
    duration: '6h',
    href: '/labs/week-4/capstone-policy-chatbot',
    usedIn: 'Nirmaan (Sujal)',
  },
  {
    number: 10,
    title: 'RAGAS evaluation dashboard (Naive vs Hybrid vs Contextual)',
    difficulty: 'Medium',
    duration: '4h',
    href: '/labs/week-4/ragas-evaluation-dashboard',
  },
  {
    number: 11,
    title: 'CAPSTONE: Autonomous Research Agent (LangGraph)',
    difficulty: 'Hard',
    duration: '6h',
    href: '/labs/week-5/capstone-autonomous-research-agent',
  },
  {
    number: 12,
    title: 'CAPSTONE: VivaAgent — AI Oral Examiner',
    difficulty: 'Hard',
    duration: '6h',
    href: '/labs/week-5/capstone-vivaagent-oral-examiner',
    usedIn: 'Professor Anand (TDS)',
  },
  {
    number: 13,
    title: 'Context-based extraction tool (PDF/Web/Video)',
    difficulty: 'Medium',
    duration: '4h',
    href: '/labs/week-5/context-based-extraction-tool',
  },
  {
    number: 14,
    title: 'CAPSTONE: Job posting scraper & tracker',
    difficulty: 'Hard',
    duration: '6h',
    href: '/labs/week-6/capstone-job-posting-scraper-tracker',
    usedIn: 'IIC',
  },
  {
    number: 15,
    title: 'CAPSTONE: AI signature detection & cropper',
    difficulty: 'Hard',
    duration: '6h',
    href: '/labs/week-6/capstone-ai-signature-detection-cropper',
    usedIn: 'NPTEL',
  },
  {
    number: 16,
    title: 'CAPSTONE: Live multilingual travel translator',
    difficulty: 'Hard',
    duration: '6h',
    href: '/labs/week-6/capstone-live-multilingual-travel-translator',
    usedIn: 'Suggested by Priyanshu (Cystar Intern)',
  },
  {
    number: 17,
    title: 'Scheduled scraper (GitHub Actions cron → DuckDB/Parquet)',
    difficulty: 'Medium',
    duration: '4h',
    href: '/labs/week-6/scheduled-scraper-github-actions-cron',
  },
  {
    number: 18,
    title: 'Red-team your API + add NeMo Guardrails',
    difficulty: 'Hard',
    duration: '4h',
    href: '/labs/week-7/red-team-your-api-guardrails',
  },
  {
    number: 19,
    title: 'Full CI/CD to Cloud Run (Artifact Registry)',
    difficulty: 'Hard',
    duration: '5h',
    href: '/labs/week-7/full-cicd-cloud-run',
  },
  {
    number: 20,
    title: 'CAPSTONE: Production fine-tuned model + full MLOps',
    difficulty: 'Hard',
    duration: '6h',
    href: '/labs/week-8/capstone-production-finetuned-model-mlops',
  },
  {
    number: 21,
    title: 'Full GCP pipeline (GCS → BigQuery ML → Vertex AI → Cloud Run)',
    difficulty: 'Hard',
    duration: '5h',
    href: '/labs/week-8/full-gcp-pipeline-bqml-vertex-cloud-run',
  },
];

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
            8 Weeks
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaDot} data-accent="orange" />
            21 Hands-on
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaDot} data-accent="teal" />
            Light + Dark
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
                  Week 5 covers Agentic AI: agent fundamentals, tool calling, async execution, LangGraph, MCP, memory, and evaluation.
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
  const [open, setOpen] = useState<PhaseId | null>(null);
  const [openTopics, setOpenTopics] = useState<Record<number, boolean>>({});

  const weeksById = useMemo(() => new Map(WEEKS.map((w) => [w.id, w])), []);

  return (
    <section className={styles.section} id="design">
      <div className={styles.container}>
        <SectionHeader
          title={
            <>
              <span className={styles.wordGreen}>Zero</span> to <span className={styles.wordWarm}>Production</span>.
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
                  onClick={() => setOpen((p) => (p === phase.id ? null : phase.id))}
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
              <div className={styles.labIndex} aria-hidden="true">
                <div className={styles.labIndexLabel}>Hands-on</div>
                <div className={styles.labIndexValue}>{lab.number}</div>
              </div>

              <div className={styles.labContent}>
                <div className={styles.labTitle}>{lab.title}</div>
                <div className={styles.labMeta}>
                  <span className={`${styles.labBadge} ${badgeClass(lab.difficulty)}`}>{lab.difficulty}</span>
                  <span className={styles.labTime}>{lab.duration}</span>
                </div>
                {lab.usedIn && <div className={styles.labUsedIn}>Used in: {lab.usedIn}</div>}
              </div>

              <ArrowRight size={18} className={styles.labArrow} aria-hidden="true" />
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
      description="Learn modern data science tools: development environments, deployment, LLMs, RAG, agents, security, and MLOps — with hands-on labs and a clean, focused learning UI."
    >
      <main className={styles.page}>
        <Hero />
        <Features />
        <PhaseAccordion />
        <LabsSection />
        <BottomCTA />
      </main>
    </Layout>
  );
}
