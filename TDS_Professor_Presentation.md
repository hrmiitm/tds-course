# Tools in Data Science — Revised Syllabus 2026
**IIT Madras · BS Data Science Programme · May Term**

| | |
|---|---|
| **Duration** | 8 Weeks |
| **Format** | Lecture + Lab |

---

- This proposal revises TDS for the **2026 May Term**, reflecting the current AI engineering stack.
- Each week progresses from tooling fundamentals through full production MLOps, with hands-on labs every week. 
- Two TAs deliver sessions on **weekly topics**; two TAs complete the **hands-on labs**. 
- **Three project milestones** occur after every three weeks. 
- Students additionally publish Discourse blogs (non-graded, indexed on the course portal) and sit a **ROE exam**.

---

## Week 01 — Development Environment & Tooling

**Topics:**

01. **VS Code** — extensions, remote dev, Jupyter
02. **UV** — package manager, virtualenvs, pyproject.toml
03. **Bash Scripting** — pipes, cron, jq, sed, awk
04. **Git & GitHub** — branching, PRs, hooks, GitHub CLI
05. **SQLite** — WAL, FTS5, sqlite-utils, datasette
06. **HTTP Clients** — curl, wget, Postman, httpie
07. **Requestly** — API mocking, request interception
08. **Data Formats** — Unicode, JSON, TOML, YAML, Base64, Markdown
09. **GitHub Pages** — static deployment, custom domains
10. **LaTeX** — reports, BibTeX, Overleaf, pandoc

**Labs:**
- Lab: Publish a Python library to PyPI using UV with automated versioning
- Lab: Publish UV CLI tool + generate LaTeX documentation PDF
- Lab: Bash automation script — daily project summary committed to GitHub

---

## Week 02 — Deployment & API Engineering

**Topics:**

01. **FastAPI** — routing, request/response, Swagger/ReDoc
02. **CORS & Middleware** — rate limiting, validation
03. **Google OAuth 2.0** — OAuth flow, JWT, refresh tokens
04. **FastAPI Advanced** — WebSockets, background tasks, DI
05. **Config Management** — pydantic-settings, .env, 12-factor
06. **Docker & Compose** — multi-stage builds, Buildkit, volumes
07. **Deployment Platforms** — HuggingFace, Vercel, Render, Railway
08. **Logging & Testing** — structlog, pytest, httpx, coverage
09. **Observability** — Prometheus, OpenTelemetry, Grafana
10. **CloudFlare Tunnels** — cloudflared HTTPS tunnels
11. **Local LLMs** — LM Studio, llama.cpp, Ollama, GGUF
12. **Redis Caching** — response cache, sessions, rate counters

**Labs:**
- Lab: Publish Gemma model API on HuggingFace Spaces with Google Auth
- Lab: Add full observability to a FastAPI service; build Grafana dashboard

---

## Week 03 — LLM Engineering

**Topics:**

01. **Prompt Engineering** — zero/few-shot, CoT, ToT, Self-Consistency
02. **Context Engineering** — AGENTS.md, CLAUDE.md, memory strategies
03. **LLM CLI Tools** — Simon Willison's llm, aichat, shell pipelines
04. **AI Coding Assistants** — Claude Code, Gemini CLI, Cursor, Copilot
05. **Pydantic & Structured Output** — instructor, JSON mode, schemas
06. **Multimodal Inputs** — image, PDF, audio in API payloads
07. **Vector Embeddings** — BGE-M3, text-embedding-3-small, Cohere
08. **Similarity Search** — HNSW, IVF, PQ; faiss vs hnswlib
09. **Prompt Caching** — Anthropic/OpenAI cache prefixes, cost savings
10. **LangSmith & LiteLLM** — tracing, cost tracking, AI gateway
11. **LLM Architecture Survey** — Transformer, MoE, CLIP, BLIP, SoTA

**Labs:**
- Lab: YouTube → Subtitles → Topics → answer timestamps + JSON summary pipeline
- Lab: Cost-tracking dashboard; compare prompt strategies by token spend via LangSmith

---

> ### 🔖 Project 1 · After Week 3
> **End-of-Block Project** — covers Weeks 1–3. Specification will be decided later.

---

## Week 04 — RAG & Hybrid RAG

**Topics:**

01. **Chunking Strategies** — fixed, semantic, header-based, parent-child
02. **Vector Databases** — FAISS, ChromaDB, PGVector, Qdrant
03. **Hybrid Search** — Dense + Sparse (BM25, SPLADE), RRF fusion
04. **Query Augmentation** — HyDE, query rewriting, step-back prompting
05. **Reranking** — Cross-encoders, Cohere Rerank, ColBERT, FlashRank
06. **RAGAS Evaluation** — faithfulness, relevance, precision/recall
07. **Multimodal Embeddings** — ColPali, CLIP, multi-vector retrieval
08. **LLM Grounding** — source attribution, citation generation, self-verification
09. **Late Chunking** — Jina AI token-level embeddings with pooling
10. **GraphRAG** — entity extraction, community summaries, graph-based retrieval
11. **Contextual Retrieval** — Anthropic's chunk-level context injection
12. **Semantic Caching** — GPTCache, Redis + cosine threshold

**Labs & Capstone Projects:**
- `CAPSTONE` **BS Degree Chatbot** — Hybrid RAG chatbot for IIT Madras BS Degree portal, RAGAS evaluation
- `CAPSTONE` **Policy Chatbot(Sujal Nirmaan)** — RAG chatbot with NeMo Guardrails for policy documents
- Lab: RAGAS evaluation dashboard — compare Naive RAG vs Hybrid vs Contextual Retrieval

---

## Week 05 — Agentic AI

**Topics:**

01. **Agent Fundamentals** — ReAct, Plan-and-Execute, Reflexion, LATS
02. **Function / Tool Calling** — schema design, chaining, parallel calls
03. **Async & Parallelism** — asyncio, threading, rate-limit-aware concurrency
04. **LangGraph** — stateful graphs, checkpointers, human-in-loop
05. **MCP (Model Context Protocol)** — spec, clients, servers
06. **Custom MCP Servers** — FastMCP, tool exposure, MCP Inspector
07. **Specialized Agents** — code execution, browser (Playwright), image analysis
08. **Multi-Agent Systems** — supervisor, swarm, A2A protocol
09. **Agent Memory Systems** — short-term, long-term, episodic, semantic
10. **LXD Sandboxing** — secure code execution environments
11. **Agent Evaluation** — AgentBench, GAIA benchmark, failure analysis

**Labs & Capstone Projects:**
- `CAPSTONE` **Autonomous Research Agent** — LangGraph multi-agent: Planner → Researcher → Summariser → Critic (Files, Code Execution, Web Browser)
- Lab: Context-based extraction tool — PyMuPDF for PDF, BeautifulSoup/Playwright for web, **yt-dlp** for video

---

## Week 06 — Web Scraping & Data Processing

**Topics:**

01. **Playwright & Selenium** — JS-rendered pages, browser automation, selectors
02. **Crawl4AI** — AI-powered web crawling, structured extraction
03. **Firecrawl & Apify** — LLM-ready site scraping, actor-based pipelines
04. **Scrapy** — spider framework, item pipelines, middlewares
05. **Anti-bot Patterns** — rotating proxies, user-agent spoofing, rate limiting, CAPTCHA
06. **Scheduled Scraping** — GitHub Actions cron, incremental updates, deduplication
07. **Document Parsing** — Unstructured.io, LlamaParse, Surya OCR, pdfplumber, HTML→Markdown
08. **DuckDB + Parquet** — in-process analytics, S3/GCS querying, Arrow interop
09. **Firestore Database** — NoSQL, real-time listeners, security rules
10. **Vision Models for Scraping** — Gemma4V, MoonDream, LLaVA for visual extraction
11. **Image Processing Pipeline** — OpenCV, annotation, bounding boxes, crop/mask
12. **Speech AI — TTS & STT** — Whisper, ElevenLabs, OpenAI TTS, Parakeet
13. **Video Understanding** — ffmpeg frame extraction, video LLMs, temporal reasoning
14. **LLM Architecture** — GPT, BERT, BART, T5 encoder/decoder, attention mechanics

**Labs & Capstone Projects:**
- `CAPSTONE` **Job Posting Scraper & Tracker (IIC Used)** — Crawl4AI → structured JSON → Firestore → analytics dashboard
- `CAPSTONE` **AI Signature Detection & Cropper (Nptel Used)** — 8L documents, Grounding DINO + Ollama cascade
- `CAPSTONE` **Live Multilingual Travel Translator** — Whisper STT → LLM → ElevenLabs TTS → FastAPI
- Lab: Scheduled scraper with GitHub Actions cron — scrape, deduplicate, store in DuckDB + Parquet

---

> ### 🔖 Project 2 · After Week 6
> **End-of-Block Project** — covers Weeks 4–6. Specification will be decided later.

---

## Week 07 — CI/CD, Security & Cloud Infrastructure

**Topics:**

01. **GitHub Actions Advanced** — matrix builds, reusable workflows, OIDC, secrets
02. **Advanced Docker** — Buildx, multi-platform, Trivy container scanning
03. **LLM Security — Offensive** — prompt injection, jailbreaks, data exfiltration probes
04. **LLM Safety — Defensive** — NeMo Guardrails, topic filters, PII masking, hallucination detection
05. **OWASP LLM Top 10** — all 10 vulnerabilities with mitigations
06. **VMs & SSH** — GCP Compute Engine, SSH keys, tmux, rsync, port forwarding
07. **Serverless Functions** — Cloud Run, AWS Lambda, Cloudflare Workers
08. **IaC Basics (Terraform)** — providers, resources, state files
09. **Cost Alerting & Budget Caps** — GCP billing alerts, LiteLLM spend limits
10. **Pub/Sub & Event-Driven** — GCP Pub/Sub, Kafka basics, fan-out patterns

**Labs:**
- Lab: Red-team your own API — run prompt injection + jailbreak probes, then add NeMo Guardrails
- Lab: Full CI/CD: lint → test → Docker build → Artifact Registry → deploy to Cloud Run via GitHub Actions

---

## Week 08 — MLOps, Fine-Tuning & Model Publishing

**Topics:**

01. **Cloud Storage for ML** — GCS buckets, versioned checkpoints, datasets
02. **BigQuery ML** — training in SQL, CREATE MODEL, Vertex AI integration
03. **MLflow** — runs, experiments, artifact store, model registry
04. **Fine-Tuning Strategy** — when to fine-tune vs RAG vs prompting; data cleaning
05. **HuggingFace Ecosystem** — datasets, transformers, PEFT, TRL, accelerate
06. **Fine-Tuning Techniques** — LoRA, QLoRA (4-bit), DPO, RLHF/RLAIF concepts
07. **Quantization** — GGUF (llama.cpp), AWQ, GPTQ — speed vs accuracy
08. **Gemma 4 Fine-Tuning** — end-to-end with Unsloth, evaluation, upload
09. **GCP ML Pipeline** — train → evaluate → register → deploy → monitor loop
10. **Model Publishing & Model Cards** — HuggingFace, GGUF, licensing, responsible AI

**Labs & Capstone Projects:**
- `CAPSTONE` **Production Fine-Tuned Model + Full MLOps** — QLoRA on domain data → MLflow → Vertex AI → HuggingFace publish
- Lab: Full GCP pipeline — GCS data → BigQuery ML → Vertex AI → Cloud Run inference API

---

> ### 🔖 Project 3 · End of Course
> **Final Project** — covers Weeks 7–8 (and full-stack integration). Specification will be decided later.

---

## All Capstone Projects

| # | Project | Week | Description | Used In |
|---|---------|------|-------------| ------- |
| C1 | **BS Degree Chatbot** | Week 4 · RAG | Hybrid RAG chatbot for IIT Madras BS Degree portal, with RAGAS evaluation dashboard | BS Website (Priyanshu, Abhimanyu Cystar and BS Office Intern) |
| C2 | **Policy Chatbot** | Week 4 · RAG | RAG chatbot with Google Auth + NeMo Guardrails for policy document Q&A | Nirmaan (Sujal) |
| C3 | **Autonomous Research Agent** | Week 5 · Agents | LangGraph multi-agent: Planner → Researcher → Summariser → Critic with memory | |
| C4 | **VivaAgent — AI Oral Examiner** | Week 5 · Agents | LangGraph, Claude Sonnet, Next.js, FastAPI, WebRTC oral examination system | Professor Anand TDS |
| C5 | **Job Posting Scraper & Tracker** | Week 6 · Web Scraping | Crawl4AI → structured JSON → Firestore → analytics dashboard | IIC (Prakash Mohit IIC Intern) |
| C6 | **AI Signature Detection & Cropper** | Week 6 · Web Scraping | 8-lakh documents, Grounding DINO + local Ollama vision cascade | (Ayush NPTEL Intern) |
| C7 | **Live Multilingual Travel Translator** | Week 6 · Web Scraping | Whisper STT → LLM translation → ElevenLabs TTS → FastAPI real-time API | Suggested by Priyanshu Cystar Intern |
| C8 | **Production Fine-Tuned Model + MLOps** | Week 8 · MLOps | QLoRA fine-tuning → MLflow → Vertex AI → HuggingFace publish with model card | |

---

## All Lab Assignments

**Week 01 — Development Environment & Tooling**
- Publish a Python library to PyPI using UV with automated versioning
- Publish UV CLI tool + generate LaTeX documentation PDF
- Bash automation script — daily project summary committed to GitHub

**Week 02 — Deployment & API Engineering**
- Publish Gemma model API on HuggingFace Spaces with Google Auth
- Add full observability to a FastAPI service; build Grafana dashboard

**Week 03 — LLM Engineering**
- YouTube → Subtitles → Topics → answer timestamps + JSON summary pipeline
- Cost-tracking dashboard; compare prompt strategies by token spend via LangSmith

**Week 04 — RAG & Hybrid RAG**
- RAGAS evaluation dashboard — compare Naive RAG vs Hybrid vs Contextual Retrieval

**Week 05 — Agentic AI**
- Context-based extraction tool — PyMuPDF for PDF, BeautifulSoup/Playwright for web, yt-dlp for video

**Week 06 — Web Scraping & Data Processing**
- Scheduled scraper with GitHub Actions cron — scrape, deduplicate, store in DuckDB + Parquet

**Week 07 — CI/CD, Security & Cloud Infrastructure**
- Red-team your own API — run prompt injection + jailbreak probes, then add NeMo Guardrails
- Full CI/CD: lint → test → Docker build → Artifact Registry → deploy to Cloud Run via GitHub Actions

**Week 08 — MLOps, Fine-Tuning & Model Publishing**
- Full GCP pipeline — GCS data → BigQuery ML → Vertex AI → Cloud Run inference API

---

## Course Structure & Assessment

### Grading

| Component | Details |
|-----------|---------|
| **Graded Assignments (GA)** | Per-week topic questions on the ROE exam portal. Standard graded assignment format, covers all 8 weeks. |
| **3 Projects** | Project 1 after Week 3, Project 2 after Week 6, Project 3 at end. Specifications to be decided later. |
| **ROE Exam** | Remote Online Examination covering the full course. Held at end of term. |
| **Discourse Blog Posts** *(Non-Graded)* | Students write and publish weekly blogs on course topics. Selected posts indexed on the TDS course portal. |
| **Hands On Lab** *(Non-Graded)* | Students are supposed to complete and learn and upgrade these hands on. |

---

## Technology Stack

| Domain | Tools & Technologies |
|--------|---------------------|
| **Dev & Deployment** | VS Code · UV · Git · GitHub · FastAPI · Docker · Redis · CloudFlare · Vercel · Render · SQLite |
| **LLMs & Frameworks** | Claude · Gemini · OpenAI · Ollama · LM Studio · LiteLLM · LangChain · LangGraph · LlamaIndex · Instructor |
| **RAG & Search** | FAISS · ChromaDB · Qdrant · PGVector · BM25 · SPLADE · ColBERT · Cohere Rerank · RAGAS · GPTCache |
| **Agents & MCP** | FastMCP · Claude Code · Playwright · LXD Sandbox · LangGraph · A2A Protocol · AgentBench |
| **Web & Data** | Crawl4AI · Firecrawl · Apify · Scrapy · DuckDB · Parquet · Firestore · Unstructured.io · LlamaParse |
| **Vision & Speech** | Grounding DINO · OpenCV · SDXL · FLUX · Whisper · ElevenLabs · Parakeet · CLIP · BLIP · ffmpeg |
| **Cloud & MLOps** | GCP · BigQuery ML · Vertex AI · MLflow · HuggingFace · TRL · PEFT · Unsloth · Terraform · NeMo Guardrails |

---

*TOOLS IN DATA SCIENCE · IIT MADRAS · BS DATA SCIENCE · MAY 2026*
