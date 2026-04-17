import React, { useState, useEffect, useCallback, useRef } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {
  MessageCircle,
  X,
  Send,
  Download,
  ChevronDown,
  Sun,
  Moon,
  Trash2,
  Bot,
} from 'lucide-react';
import styles from './ChatPanel.module.css';

/* ===== Types ===== */
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Dimensions {
  width: number;
  height: number;
  top: number;
  left: number;
}

/* ===== Constants ===== */
const CHAT_HISTORY_KEY = 'tds_chat_history';
const CHAT_DIMENSIONS_KEY = 'tds_chat_dimensions';
const CHAT_OPACITY_KEY = 'tds_chat_opacity';
const MAX_HISTORY = 100;
const API_URL = '/api/chat?XTransformPort=3000';

const MIN_WIDTH = 340;
const MIN_HEIGHT = 300;

const SUGGESTIONS = [
  { label: 'What does Week 5 cover?', icon: '📚' },
  { label: 'How to set up terminal?', icon: '🛠️' },
  { label: 'Tell me about RAG', icon: '🔍' },
  { label: 'Lab requirements', icon: '📋' },
];

/* ===== Knowledge Base (fallback) ===== */
const KNOWLEDGE_BASE: Array<{ keywords: string[]; response: string }> = [
  {
    keywords: ['week 1', 'development', 'environment', 'setup', 'vscode', 'git'],
    response:
      '**Week 1 — Dev Environment & Version Control** covers:\n\n- **VS Code**: Extensions, settings sync, keybindings, devcontainers\n- **uv**: Creating/managing Python projects, lockfiles\n- **Bash scripting**: Variables, loops, pipes, cron jobs, `jq`\n- **Git & GitHub**: Branching, PRs, merge conflicts\n- **SQLite**: Schema design, queries, indexes\n- **GitHub Pages**: Deploying static sites\n\n👉 [Start Week 1](/week-1)',
  },
  {
    keywords: ['week 2', 'container', 'api', 'deploy', 'fastapi', 'docker'],
    response:
      '**Week 2 — Containers, APIs & Deployment** covers:\n\n- **FastAPI**: Routes, params, middleware, OpenAPI\n- **Docker**: Dockerfile best practices, multi-stage builds, compose\n- **Vercel & Render**: Serverless deployments\n- **HuggingFace Spaces**: Gradio + FastAPI spaces\n- **CORS & REST APIs**: HTTP status codes, API design\n- **Google Auth**: OAuth2 flow, service accounts\n\n👉 [Start Week 2](/week-2)',
  },
  {
    keywords: ['week 3', 'prompt', 'llm', 'engineering', 'embedding'],
    response:
      '**Week 3 — Prompt Engineering & LLM Fundamentals** covers:\n\n- **Prompt engineering**: Zero-shot, few-shot, chain-of-thought\n- **Structured output**: JSON mode, Pydantic + LLM\n- **LLM text extraction**: Named entities, tables from PDFs\n- **Function calling**: Tool use, parallel tools\n- **`llm` CLI tool**: Plugins, templates, cost tracking\n- **Embeddings**: Cosine similarity, embedding models\n\n👉 [Start Week 3](/week-3)',
  },
  {
    keywords: ['week 4', 'rag', 'vector', 'database', 'search', 'retrieval'],
    response:
      '**Week 4 — RAG, Vector DBs & Hybrid Search** covers:\n\n- **Chunking strategies**: Fixed-size, recursive, semantic\n- **Vector databases**: FAISS, Chroma, PGVector, Qdrant\n- **Hybrid search**: Dense + sparse (BM25) combination\n- **Re-ranking**: Cross-encoders, Cohere Rerank\n- **RAG evaluation**: RAGAS framework\n- **Multimodal embeddings**: CLIP, image+text retrieval\n\n👉 [Start Week 4](/week-4)',
  },
  {
    keywords: ['week 5', 'agent', 'mcp', 'agentic', 'pydantic'],
    response:
      '**Week 5 — Agentic AI & MCP** covers:\n\n- **LLM Agents**: ReAct loop, plan-and-execute, reflexion\n- **Pydantic AI**: Defining agents, tool registration\n- **MCP Protocol**: Architecture, client/server model\n- **Building MCP servers**: FastMCP library in Python\n- **Multimodal agents**: Vision + tool use\n\n👉 [Start Week 5](/week-5)',
  },
  {
    keywords: ['week 6', 'vision', 'image', 'media', 'grounding', 'audio'],
    response:
      '**Week 6 — Media Processing & Vision** covers:\n\n- **Vision models**: GPT-4o Vision, Gemini Flash/Pro\n- **Image processing**: Preprocessing, annotation, bounding boxes\n- **Grounding DINO**: Open-vocabulary object detection\n- **Audio processing**: Whisper transcription, speaker diarization\n- **Image generation**: SDXL, FLUX, ControlNet\n\n👉 [Start Week 6](/week-6)',
  },
  {
    keywords: ['week 7', 'finetune', 'gemma', 'huggingface', 'publish'],
    response:
      '**Week 7 — Finetuning & Publishing** covers:\n\n- **Finetuning strategy**: When to finetune vs RAG vs prompting\n- **Gemma4 finetuning**: QLoRA with Unsloth\n- **HuggingFace ecosystem**: Datasets, Transformers, PEFT, TRL\n- **Python packaging**: `pyproject.toml`, src layout\n- **PyPI publishing**: `uv build`, `uv publish`, GitHub Actions\n\n👉 [Start Week 7](/week-7)',
  },
  {
    keywords: ['week 8', 'ci', 'cd', 'security', 'guardrails'],
    response:
      '**Week 8 — CI/CD & Security** covers:\n\n- **GitHub Actions**: Matrix builds, reusable workflows\n- **Advanced Docker**: Multi-stage builds, BuildKit, distroless\n- **LLM security**: Prompt injection, jailbreaks\n- **NeMo Guardrails**: Input/output rails, topic filters\n- **Security best practices**: OWASP LLM Top 10\n\n👉 [Start Week 8](/week-8)',
  },
  {
    keywords: ['week 9', 'week 10', 'mlops', 'gcp', 'cloud', 'mlflow'],
    response:
      '**Bonus Weeks 9-10 — MLOps on GCP** covers:\n\n**Week 9 (Train & Evaluate):**\n- MLflow experiment tracking\n- Vertex AI Workbench & Pipelines\n- BigQuery ML\n- DVC data versioning\n\n**Week 10 (Deploy & Monitor):**\n- Cloud Run for ML\n- Model monitoring & drift detection\n- Pub/Sub event-driven retraining\n- Cost optimization\n\n👉 [Start Week 9](/week-9) | [Week 10](/week-10)',
  },
  {
    keywords: ['lab', 'exercise', 'assignment', 'hands-on'],
    response:
      'We have **8 graded labs** in this course:\n\n1. 🤖 **ChatBot with FastAPI** (Week 2) — ⭐⭐\n2. 🔍 **RAG ChatBot** (Week 4) — ⭐⭐⭐\n3. 🎯 **Gemma4 Finetuning** (Week 7) — ⭐⭐⭐⭐\n4. 🔎 **Hybrid RAG ChatBot** (Week 4) — ⭐⭐⭐\n5. ✍️ **Signature Detection** (Week 6) — ⭐⭐⭐\n6. 🤖 **AI Agent + MCP** (Week 5) — ⭐⭐⭐⭐\n7. 🔄 **CI/CD Pipeline** (Week 8) — ⭐⭐⭐\n8. ☁️ **Full MLOps on GCP** (Bonus) — ⭐⭐⭐⭐⭐\n\n👉 [View Labs](/labs)',
  },
  {
    keywords: ['terminal', 'code-server', 'coding', 'ide', 'vscode'],
    response:
      'The **TDS Terminal** is a built-in coding environment!\n\n1. Press **Ctrl+`** or click the **Terminal** icon in the navbar\n2. (Linux) Install code-server once: `curl -fsSL https://code-server.dev/install.sh | sh`\n3. Start code-server: `code-server --auth none --bind-addr 127.0.0.1:8080`\n4. In the Terminal panel: **Localhost → Port 8080 → Connect**\n\nUsing **GitHub Codespaces**? Forward the port and paste the HTTPS URL under “GitHub Codespaces”.',
  },
  {
    keywords: ['prerequisite', 'require', 'before', 'start', 'begin'],
    response:
      '**Prerequisites for TDS:**\n\n- A laptop running macOS, Linux, or WSL2 on Windows\n- Python 3.11+ installed\n- A Google account (for GCP free tier)\n- Basic familiarity with Python and the command line\n- Working knowledge of HTML, JS, and APIs (helpful but not required)\n\n👉 [Read the Introduction](/intro)',
  },
  {
    keywords: ['gcp', 'google cloud', 'free tier', 'cloud run'],
    response:
      '**GCP Free Tier** — everything we use is free!\n\n| Service | Free Limit |\n|---------|------------|\n| Cloud Run | 2M requests/month |\n| Cloud Storage | 5 GB |\n| BigQuery | 1 TB queries/month |\n| Cloud Functions | 2M invocations/month |\n| Cloud Build | 120 min/day |\n\nNo credit card surprises! 💰',
  },
  {
    keywords: ['hello', 'hi', 'hey', 'help'],
    response:
      "Hello! 👋 I'm the **TDS Course Assistant**. I can help you with:\n\n- 📚 Course content and curriculum\n- 🛠️ Tool questions (Docker, Git, FastAPI, etc.)\n- 📋 Lab information and deadlines\n- 🔧 Terminal setup instructions\n- 💡 Study tips and learning paths\n\nJust ask me anything about the course!",
  },
];

function findBestResponse(query: string): string {
  const lowerQuery = query.toLowerCase();
  let bestMatch = { score: 0, response: '' };

  for (const entry of KNOWLEDGE_BASE) {
    const score = entry.keywords.filter((kw) => lowerQuery.includes(kw)).length;
    if (score > bestMatch.score) {
      bestMatch = { score, response: entry.response };
    }
  }

  if (bestMatch.score > 0) {
    return bestMatch.response;
  }

  return "I'm not sure about that specific topic. Try asking about:\n\n- **Week topics** (e.g., 'What does Week 3 cover?')\n- **Labs** (e.g., 'Tell me about the labs')\n- **Tools** (e.g., 'How do I set up the terminal?')\n- **Prerequisites** (e.g., 'What do I need before starting?')\n\nOr browse the [course content](/intro) directly!";
}

/* ===== Markdown Renderer ===== */
function renderMarkdown(text: string): string {
  let html = text;

  // Escape HTML entities (but preserve our own tags later)
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Code blocks: ```lang\n...\n```
  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    (_match, lang, code) => {
      const langClass = lang ? `language-${lang}` : '';
      return `<pre class="${styles.codeBlock}"><code class="${langClass}">${code.trim()}</code></pre>`;
    }
  );

  // Inline code: `...`
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="$inlineCode">`$1`</code>'
  );
  // Fix: remove the backticks we accidentally left
  html = html.replace(
    /<code class="\$inlineCode">`([^`]*)`<\/code>/g,
    '<code class="$inlineCode">$1</code>'
  );

  // Headers: ### ... (must be at start of line)
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold: **...**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic: *...* (but not inside **)
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // Links: [text](url)
  html = html.replace(
    /\[(.+?)\]\((.+?)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="$linkStyle">$1</a>'
  );

  // Unordered lists: lines starting with - or *
  html = html.replace(/^[*\-] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  // Ordered lists: lines starting with 1. 2. etc.
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Tables: simple pipe tables
  const tableRegex = /(\|.+\|[\r\n]+\|[-| :]+\|[\r\n]+((\|.+\|[\r\n]*)+))/g;
  html = html.replace(tableRegex, (match) => {
    const lines = match.trim().split('\n').filter((l: string) => l.trim());
    if (lines.length < 2) return match;

    const headerCells = lines[0]
      .split('|')
      .filter((c: string) => c.trim())
      .map((c: string) => `<th>${c.trim()}</th>`)
      .join('');
    const headerRow = `<tr>${headerCells}</tr>`;

    const bodyRows = lines
      .slice(2)
      .map((line: string) => {
        const cells = line
          .split('|')
          .filter((c: string) => c.trim())
          .map((c: string) => `<td>${c.trim()}</td>`)
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');

    return `<table><thead>${headerRow}</thead><tbody>${bodyRows}</tbody></table>`;
  });

  // Line breaks (but not inside pre/code blocks)
  // Split by pre blocks first, process non-pre parts, then rejoin
  const parts = html.split(/(<pre[\s\S]*?<\/pre>)/g);
  html = parts
    .map((part, i) => {
      if (part.startsWith('<pre')) return part;
      // Convert double newlines to paragraph breaks
      part = part.replace(/\n{2,}/g, '</p><p>');
      // Convert single newlines to <br/>
      part = part.replace(/\n/g, '<br/>');
      return part;
    })
    .join('');

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');
  // Replace CSS module class placeholders
  html = html.replace(/\$inlineCode/g, styles.inlineCode);
  html = html.replace(/\$linkStyle/g, styles.messageLink);

  return html;
}

/* ===== LocalStorage helpers ===== */
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return fallback;
}

function saveToStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

/* ===== Resize Logic ===== */
type ResizeDirection =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

function useResize(
  dimensions: Dimensions,
  setDimensions: (d: Dimensions) => void
) {
  const dragging = useRef<{
    direction: ResizeDirection;
    startX: number;
    startY: number;
    startDims: Dimensions;
  } | null>(null);

  const startResize = useCallback(
    (direction: ResizeDirection, e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      dragging.current = {
        direction,
        startX: clientX,
        startY: clientY,
        startDims: { ...dimensions },
      };

      const onMove = (ev: MouseEvent | TouchEvent) => {
        if (!dragging.current) return;
        const cx = 'touches' in ev ? ev.touches[0].clientX : ev.clientX;
        const cy = 'touches' in ev ? ev.touches[0].clientY : ev.clientY;
        const dx = cx - dragging.current.startX;
        const dy = cy - dragging.current.startY;
        const s = dragging.current.startDims;

        let newW = s.width;
        let newH = s.height;
        let newT = s.top;
        let newL = s.left;

        const dir = dragging.current.direction;

        if (dir.includes('left')) {
          newW = Math.max(MIN_WIDTH, s.width - dx);
          newL = s.left + (s.width - newW);
        }
        if (dir.includes('right')) {
          newW = Math.max(MIN_WIDTH, s.width + dx);
        }
        if (dir.includes('top')) {
          newH = Math.max(MIN_HEIGHT, s.height - dy);
          newT = s.top + (s.height - newH);
        }
        if (dir.includes('bottom')) {
          newH = Math.max(MIN_HEIGHT, s.height + dy);
        }

        // Clamp to viewport
        newT = Math.max(0, Math.min(newT, window.innerHeight - MIN_HEIGHT));
        newL = Math.max(0, Math.min(newL, window.innerWidth - MIN_WIDTH));
        newW = Math.min(newW, window.innerWidth - newL);
        newH = Math.min(newH, window.innerHeight - newT);

        setDimensions({ width: newW, height: newH, top: newT, left: newL });
      };

      const onUp = () => {
        dragging.current = null;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
    },
    [dimensions, setDimensions]
  );

  return { startResize };
}

/* ===== Main Component ===== */
function ChatPanelInner() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [opacity, setOpacity] = useState(1.0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Dimensions
  const [dimensions, setDimensions] = useState<Dimensions>(() => {
    const saved = loadFromStorage<Dimensions | null>(CHAT_DIMENSIONS_KEY, null);
    if (saved) return saved;
    return {
      width: 420,
      height: Math.round(window.innerHeight * 0.65),
      top: window.innerHeight - Math.round(window.innerHeight * 0.65),
      left: window.innerWidth - 420 - 16,
    };
  });

  const chatContentRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { startResize } = useResize(dimensions, setDimensions);

  // Load history & opacity from localStorage
  useEffect(() => {
    const savedMessages = loadFromStorage<Message[]>(CHAT_HISTORY_KEY, []);
    setMessages(savedMessages);
    const savedOpacity = loadFromStorage<number>(CHAT_OPACITY_KEY, 1.0);
    setOpacity(Math.max(0.5, Math.min(1.0, savedOpacity)));
  }, []);

  // Save history to localStorage (debounced)
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveToStorage(CHAT_HISTORY_KEY, messages.slice(-MAX_HISTORY));
    }, 300);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [messages]);

  // Save dimensions to localStorage (debounced)
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveToStorage(CHAT_DIMENSIONS_KEY, dimensions);
    }, 500);
  }, [dimensions]);

  // Save opacity to localStorage
  useEffect(() => {
    saveToStorage(CHAT_OPACITY_KEY, opacity);
  }, [opacity]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom, scrollToBottom]);

  // Detect scroll position
  const handleScroll = useCallback(() => {
    const el = chatContentRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setIsAtBottom(atBottom);
  }, []);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Navbar toggle button (Root.tsx)
  useEffect(() => {
    const handler = () => setIsOpen((prev) => !prev);
    window.addEventListener('tds:toggle-chat', handler);
    return () => window.removeEventListener('tds:toggle-chat', handler);
  }, []);

  // Send message to API
  const handleSend = useCallback(
    async (overrideInput?: string) => {
      const trimmed = (overrideInput ?? input).trim();
      if (!trimmed || isLoading) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsLoading(true);
      setIsAtBottom(true);

      try {
        // Build history for API (last 20 messages)
        const history = messages.slice(-20).map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        }));

        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed, history }),
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data = await res.json();
        const responseText: string = data.response || data.error || '';

        if (!responseText) throw new Error('Empty response');

        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseText,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, botMsg]);
      } catch (err) {
        // Fallback to local knowledge base
        const fallbackResponse = findBestResponse(trimmed);
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            fallbackResponse +
            '\n\n---\n*⚠️ Offline mode — using local knowledge base. The AI service may be temporarily unavailable.*',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    },
    [input, isLoading, messages]
  );

  // Clear history
  const clearHistory = useCallback(() => {
    if (!showClearConfirm) {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
      return;
    }
    setMessages([]);
    setShowClearConfirm(false);
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY);
    } catch {
      // ignore
    }
  }, [showClearConfirm]);

  // Export conversation as HTML
  const exportChat = useCallback(() => {
    if (messages.length === 0) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TDS Chat Export — ${new Date().toLocaleDateString()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; background: #f8f9fa; padding: 24px; color: #1a1a1a; }
    .container { max-width: 700px; margin: 0 auto; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    .subtitle { color: #5f6368; font-size: 14px; margin-bottom: 24px; }
    .message { padding: 12px 16px; border-radius: 12px; margin-bottom: 12px; max-width: 85%; line-height: 1.6; font-size: 14px; word-wrap: break-word; }
    .message.user { background: #1d9e75; color: #fff; margin-left: auto; border-bottom-right-radius: 4px; }
    .message.assistant { background: #e8eaed; color: #1a1a1a; margin-right: auto; border-bottom-left-radius: 4px; }
    .message .time { font-size: 11px; opacity: 0.6; margin-top: 4px; }
    .message pre { background: #2d2d2d; color: #e8eaed; padding: 12px; border-radius: 8px; overflow-x: auto; margin: 8px 0; font-size: 13px; }
    .message code { font-family: 'JetBrains Mono', monospace; font-size: 13px; }
    .message a { color: #1a73e8; }
    .separator { text-align: center; color: #9aa0a6; font-size: 12px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>TDS Course Assistant — Chat Export</h1>
    <p class="subtitle">Exported on ${new Date().toLocaleString()}</p>
    <hr style="border: none; border-top: 1px solid #e8eaed; margin-bottom: 20px;">
    ${messages
      .map(
        (msg) =>
          `<div class="message ${msg.role}">
        ${renderMarkdown(msg.content)}
        <div class="time">${new Date(msg.timestamp).toLocaleTimeString()}</div>
      </div>`
      )
      .join('\n')}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tds-chat-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [messages]);

  // Resize handle factory
  const resizeHandle = useCallback(
    (direction: ResizeDirection, className: string) => (
      <div
        className={className}
        onMouseDown={(e) => startResize(direction, e)}
        onTouchStart={(e) => startResize(direction, e)}
      />
    ),
    [startResize]
  );

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div
          className={styles.panel}
          style={{
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            top: `${dimensions.top}px`,
            left: `${dimensions.left}px`,
            opacity,
          }}
        >
          {/* Resize handles — all 8 directions */}
          {resizeHandle('top', styles.resizeTop)}
          {resizeHandle('bottom', styles.resizeBottom)}
          {resizeHandle('left', styles.resizeLeft)}
          {resizeHandle('right', styles.resizeRight)}
          {resizeHandle('top-left', styles.resizeTopLeft)}
          {resizeHandle('top-right', styles.resizeTopRight)}
          {resizeHandle('bottom-left', styles.resizeBottomLeft)}
          {resizeHandle('bottom-right', styles.resizeBottomRight)}

          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <Bot size={16} className={styles.headerIcon} />
              <span className={styles.headerTitle}>TDS Assistant</span>
              <span className={styles.headerBadge}>AI</span>
            </div>

            <div className={styles.headerCenter}>
              <Sun size={12} />
              <input
                type="range"
                min={0.5}
                max={1.0}
                step={0.05}
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className={styles.opacitySlider}
                aria-label="Panel opacity"
                title="Adjust panel opacity"
              />
              <Moon size={12} />
            </div>

            <div className={styles.headerActions}>
              <button
                className={styles.iconBtn}
                onClick={exportChat}
                aria-label="Export chat"
                title="Export as HTML"
                disabled={messages.length === 0}
              >
                <Download size={15} />
              </button>
              <button
                className={`${styles.iconBtn} ${showClearConfirm ? styles.iconBtnDanger : ''}`}
                onClick={clearHistory}
                aria-label="Clear chat history"
                title={showClearConfirm ? 'Click again to confirm' : 'Clear history'}
              >
                <Trash2 size={15} />
              </button>
              <button
                className={styles.iconBtn}
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                title="Close"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          <div
            className={styles.chatContent}
            ref={chatContentRef}
            onScroll={handleScroll}
          >
            {messages.length === 0 && !isLoading && (
              <div className={styles.welcomeSection}>
                <div className={styles.welcomeIcon}>
                  <MessageCircle size={28} />
                </div>
                <h4 className={styles.welcomeTitle}>TDS Course Assistant</h4>
                <p className={styles.welcomeDesc}>
                  Ask me anything about the course — topics, labs, tools, or
                  setup instructions!
                </p>
                <div className={styles.suggestions}>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      className={styles.suggestionChip}
                      onClick={() => {
                        setInput(s.label);
                        handleSend(s.label);
                      }}
                    >
                      <span className={styles.suggestionIcon}>{s.icon}</span>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.messageRow} ${
                  msg.role === 'user' ? styles.messageRowUser : styles.messageRowBot
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className={styles.avatarBot}>
                    <Bot size={14} />
                  </div>
                )}
                <div
                  className={`${styles.message} ${
                    msg.role === 'user'
                      ? styles.messageUser
                      : styles.messageBot
                  }`}
                  dangerouslySetInnerHTML={{
                    __html:
                      msg.role === 'assistant'
                        ? renderMarkdown(msg.content)
                        : msg.content
                            .replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/\n/g, '<br/>'),
                  }}
                />
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className={`${styles.messageRow} ${styles.messageRowBot}`}>
                <div className={styles.avatarBot}>
                  <Bot size={14} />
                </div>
                <div className={`${styles.message} ${styles.messageBot}`}>
                  <div className={styles.typingIndicator}>
                    <span className={styles.typingDot} />
                    <span className={styles.typingDot} />
                    <span className={styles.typingDot} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to bottom button */}
          {!isAtBottom && (
            <button
              className={styles.scrollToBottom}
              onClick={() => scrollToBottom()}
              aria-label="Scroll to bottom"
            >
              <ChevronDown size={16} />
            </button>
          )}

          {/* Clear confirm banner */}
          {showClearConfirm && (
            <div className={styles.clearConfirmBanner}>
              Click 🗑️ again to confirm clearing all chat history
            </div>
          )}

          {/* Input Area */}
          <div className={styles.chatInput}>
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              placeholder="Ask about the course..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading}
            />
            <button
              className={styles.sendBtn}
              onClick={() => handleSend()}
              aria-label="Send message"
              disabled={isLoading || !input.trim()}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function ChatPanel() {
  return (
    <BrowserOnly fallback={null}>
      {() => <ChatPanelInner />}
    </BrowserOnly>
  );
}
