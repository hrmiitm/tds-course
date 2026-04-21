import React, { useState, useEffect, useCallback, useMemo, useRef, useId } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import mermaid from 'mermaid';
import { jsPDF } from 'jspdf';
import {
  X,
  Send,
  Download,
  ChevronDown,
  Sun,
  Moon,
  Trash2,
  Bot,
  Save,
  MessageCircle,
} from 'lucide-react';
import styles from './ChatPanel.module.css';

/* ===== Types ===== */
type MessageRole = 'user' | 'assistant';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  model?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  sentPagePaths: string[];
}

interface ChatProvider {
  id: string;
  baseUrl: string;
  apiKey: string;
  models: string[];
  activeModel: string;
}

interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string;
  providers: ChatProvider[];
  activeProviderId: string;
}

interface Dimensions {
  width: number;
  height: number;
  top: number;
  left: number;
}

type ResizeDirection =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

type OpenRouterRole = 'system' | 'user' | 'assistant';

interface OpenRouterMessage {
  role: OpenRouterRole;
  content?: string | null;
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: OpenRouterMessage;
  }>;
  error?: {
    message?: string;
  } | string;
}

interface MarkdownCodeProps extends React.ComponentPropsWithoutRef<'code'> {
  inline?: boolean;
  className?: string;
  node?: unknown;
}

/* ===== Constants ===== */
const CHAT_STATE_KEY = 'tds_chat_state_v2';
const CHAT_DIMENSIONS_KEY = 'tds_chat_dimensions';
const CHAT_OPACITY_KEY = 'tds_chat_opacity';
const MAX_HISTORY = 180;
const MAX_SENT_PAGES = 50;
const MIN_WIDTH = 340;
const MIN_HEIGHT = 300;

const SUGGESTIONS = [
  { label: 'What does Week 5 cover?', icon: '📚' },
  { label: 'How to setup code-server quickly?', icon: '🛠️' },
  { label: 'Summarize this page in 5 bullets', icon: '🔍' },
  { label: 'Show me all labs by difficulty', icon: '🧪' },
];

const SYSTEM_PROMPT = `You are the TDS Course Assistant embedded in a static website.

You will receive, on every user message:
- The current page content (as markdown-like text)
- The docs sidebar navigation outline

Rules:
- Use the provided context + conversation history. If something is not present, say so.
- Answer with practical, step-by-step help.
- When the user asks for code, return executable code blocks.
- Be concise but complete.`;

/* ===== Helpers ===== */
function now(): number {
  return Date.now();
}

function makeId(prefix: string): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c?.randomUUID) return `${prefix}_${c.randomUUID()}`;
  return `${prefix}_${now()}_${Math.random().toString(16).slice(2)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripMarkdown(input: string): string {
  return input
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, ''))
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)')
    .replace(/[*_~>#-]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function parseModelList(raw: string): string[] {
  const parsed = raw
    .split(/[\n,]+/g)
    .map((m) => m.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : ['google/gemma-3-27b-it'];
}

function normalizeBaseUrlForCompare(url: string): string {
  return (url || '').trim().replace(/\/+$/g, '').toLowerCase();
}

function createDefaultProvider(): ChatProvider {
  const model = 'google/gemma-3-27b-it';
  return {
    id: makeId('provider'),
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: '',
    models: [model],
    activeModel: model,
  };
}

function createAIPipeOpenRouterProvider(): ChatProvider {
  const models = [
    'openai/gpt-5.4-nano',
    'openai/gpt-5.4-mini',
    'openai/gpt-5.4-pro',
    'openai/gpt-5.3-codex',
    'anthropic/claude-sonnet-4.6',
    'anthropic/claude-opus-4.7',
    'moonshotai/kimi-k2.6',
    'openai/o4-mini-deep-research',
    'perplexity/sonar-deep-research',
  ];
  return {
    id: makeId('provider'),
    baseUrl: 'https://aipipe.org/openrouter/v1',
    apiKey: '',
    models,
    activeModel: models[0],
  };
}

function createSession(title = 'New Session'): ChatSession {
  const t = now();
  return {
    id: makeId('session'),
    title,
    messages: [],
    sentPagePaths: [],
    createdAt: t,
    updatedAt: t,
  };
}

function ensureValidProvider(provider: ChatProvider): ChatProvider {
  const models = provider.models.length > 0 ? provider.models : ['google/gemma-3-27b-it'];
  const activeModel = models.includes(provider.activeModel) ? provider.activeModel : models[0];
  return { ...provider, models, activeModel };
}

function normalizeProvider(raw: unknown): ChatProvider | null {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id : makeId('provider');
  const baseUrl = typeof raw.baseUrl === 'string' && raw.baseUrl.trim()
    ? raw.baseUrl.trim()
    : 'https://openrouter.ai/api/v1';
  const apiKey = typeof raw.apiKey === 'string' ? raw.apiKey : '';
  const models = Array.isArray(raw.models)
    ? raw.models.filter((m): m is string => typeof m === 'string' && m.trim().length > 0)
    : [];
  const activeModel = typeof raw.activeModel === 'string' ? raw.activeModel : (models[0] ?? 'google/gemma-3-27b-it');
  return ensureValidProvider({ id, baseUrl, apiKey, models, activeModel });
}

function normalizeMessage(raw: unknown): Message | null {
  if (!isRecord(raw)) return null;
  const role = raw.role === 'assistant' ? 'assistant' : raw.role === 'user' ? 'user' : null;
  if (!role) return null;
  const content = typeof raw.content === 'string' ? raw.content : '';
  if (!content.trim()) return null;
  return {
    id: typeof raw.id === 'string' && raw.id.trim() ? raw.id : makeId('msg'),
    role,
    content,
    timestamp: typeof raw.timestamp === 'number' ? raw.timestamp : now(),
    model: typeof raw.model === 'string' ? raw.model : undefined,
  };
}

function normalizeSession(raw: unknown): ChatSession | null {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id : makeId('session');
  const title = typeof raw.title === 'string' && raw.title.trim() ? raw.title : 'Session';
  const messagesRaw = Array.isArray(raw.messages) ? raw.messages : [];
  const messages = messagesRaw.map(normalizeMessage).filter((m): m is Message => Boolean(m)).slice(-MAX_HISTORY);
  const sentPagePaths = Array.isArray(raw.sentPagePaths)
    ? raw.sentPagePaths
        .filter((p): p is string => typeof p === 'string')
        .map((p) => p.trim())
        .filter(Boolean)
        .slice(-MAX_SENT_PAGES)
    : [];
  const createdAt = typeof raw.createdAt === 'number' ? raw.createdAt : now();
  const updatedAt = typeof raw.updatedAt === 'number' ? raw.updatedAt : now();
  return { id, title, messages, sentPagePaths, createdAt, updatedAt };
}

function loadChatState(): ChatState {
  const fallbackProviders = [createDefaultProvider(), createAIPipeOpenRouterProvider()];
  const fallbackSession = createSession();
  const fallback: ChatState = {
    sessions: [fallbackSession],
    activeSessionId: fallbackSession.id,
    providers: fallbackProviders,
    activeProviderId: fallbackProviders[0].id,
  };
  const raw = loadFromStorage<unknown>(CHAT_STATE_KEY, null);
  if (!isRecord(raw)) return fallback;

  const providers = Array.isArray(raw.providers)
    ? raw.providers.map(normalizeProvider).filter((p): p is ChatProvider => Boolean(p))
    : [];
  const safeProvidersBase = providers.length > 0 ? providers : fallbackProviders;
  const shouldAddAIPipe = !safeProvidersBase.some(
    (p) => normalizeBaseUrlForCompare(p.baseUrl) === normalizeBaseUrlForCompare('https://aipipe.org/openrouter/v1'),
  );
  const safeProviders = shouldAddAIPipe ? [...safeProvidersBase, createAIPipeOpenRouterProvider()] : safeProvidersBase;

  const sessions = Array.isArray(raw.sessions)
    ? raw.sessions.map(normalizeSession).filter((s): s is ChatSession => Boolean(s))
    : [];
  const safeSessions = sessions.length > 0 ? sessions : [fallbackSession];

  const activeProviderId = typeof raw.activeProviderId === 'string' ? raw.activeProviderId : safeProviders[0].id;
  const activeSessionId = typeof raw.activeSessionId === 'string' ? raw.activeSessionId : safeSessions[0].id;

  return {
    providers: safeProviders,
    activeProviderId: safeProviders.some((p) => p.id === activeProviderId) ? activeProviderId : safeProviders[0].id,
    sessions: safeSessions.sort((a, b) => b.updatedAt - a.updatedAt),
    activeSessionId: safeSessions.some((s) => s.id === activeSessionId) ? activeSessionId : safeSessions[0].id,
  };
}

function buildSessionTitle(input: string): string {
  const compact = input.replace(/\s+/g, ' ').trim();
  if (!compact) return 'New Session';
  return compact.length > 42 ? `${compact.slice(0, 42)}…` : compact;
}
function normalizeText(input: string): string {
  return (input || '')
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function clampText(input: string, maxChars: number): { text: string; truncated: boolean } {
  if (input.length <= maxChars) return { text: input, truncated: false };
  return { text: input.slice(0, Math.max(0, maxChars)).trimEnd(), truncated: true };
}

function canonicalizePathname(pathname: string): string {
  const p = (pathname || '/').trim() || '/';
  if (p === '/') return '/';
  return p.replace(/\/+$/g, '');
}

function extractSidebarMarkdown(maxChars = 16000): string {
  const sidebarRoot =
    (document.querySelector('.theme-doc-sidebar-container') as HTMLElement | null) ??
    (document.querySelector('.navbar-sidebar__items') as HTMLElement | null) ??
    (document.querySelector('.navbar') as HTMLElement | null);

  if (!sidebarRoot) return '(No navigation found on this page.)';

  const menuRoot =
    (sidebarRoot.querySelector('ul.menu__list') as HTMLElement | null) ??
    (sidebarRoot.querySelector('nav ul') as HTMLElement | null);

  if (menuRoot) {
    const lines: string[] = [];
    const walk = (ul: Element, depth: number) => {
      const items = Array.from(ul.children).filter((c) => c.tagName.toLowerCase() === 'li');
      for (const li of items) {
        const labelEl = Array.from(li.children).find((c) => {
          const tag = c.tagName.toLowerCase();
          return tag === 'a' || tag === 'button';
        }) as HTMLElement | undefined;

        const text = (labelEl?.textContent ?? '').replace(/\s+/g, ' ').trim();
        const isLink = labelEl?.tagName.toLowerCase() === 'a';
        const href = isLink ? ((labelEl as HTMLAnchorElement).getAttribute('href') ?? '') : '';
        const safeHref = href && !href.startsWith('#') && !/^javascript:/i.test(href) ? href : '';

        if (text) {
          const bullet = safeHref ? `- [${text}](${safeHref})` : `- ${text}`;
          lines.push(`${'  '.repeat(depth)}${bullet}`);
        }

        const childUl = Array.from(li.children).find((c) => c.tagName.toLowerCase() === 'ul');
        if (childUl) walk(childUl, depth + 1);
      }
    };

    walk(menuRoot, 0);
    const md = normalizeText(lines.join('\n'));
    const clamped = clampText(md, maxChars);
    return clamped.truncated ? `${clamped.text}\n\n...(sidebar truncated)` : (clamped.text || '(Sidebar empty.)');
  }

  const links = Array.from(sidebarRoot.querySelectorAll('a'))
    .map((a) => {
      const href = a.getAttribute('href') ?? '';
      const text = (a.textContent ?? '').replace(/\s+/g, ' ').trim();
      if (!href || !text) return null;
      if (href.startsWith('#')) return null;
      if (/^javascript:/i.test(href)) return null;
      return { href, text };
    })
    .filter((x): x is { href: string; text: string } => Boolean(x));

  const deduped: Array<{ href: string; text: string }> = [];
  const seen = new Set<string>();
  for (const l of links) {
    const key = `${l.text}|${l.href}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(l);
  }

  const md = normalizeText(deduped.map((l) => `- [${l.text}](${l.href})`).join('\n'));
  const clamped = clampText(md, maxChars);
  return clamped.truncated ? `${clamped.text}\n\n...(sidebar truncated)` : (clamped.text || '(Sidebar empty.)');
}

function extractCurrentPageMarkdown(maxChars = 32000): string {
  const contentRoot =
    (document.querySelector('article .theme-doc-markdown') as HTMLElement | null) ??
    (document.querySelector('.theme-doc-markdown') as HTMLElement | null) ??
    (document.querySelector('main') as HTMLElement | null);

  if (!contentRoot) return '(No page content found.)';

  const title = (document.querySelector('main h1')?.textContent ?? document.title ?? '').trim();
  const raw = contentRoot.innerText || contentRoot.textContent || '';
  const normalized = normalizeText(raw);
  const clamped = clampText(normalized, maxChars);

  const header = [
    title ? `# ${title}` : '# Page',
    `Path: ${canonicalizePathname(window.location.pathname)}`,
  ].join('\n');

  const suffix = clamped.truncated ? '\n\n...(page content truncated)' : '';
  return `${header}\n\n${clamped.text}${suffix}`.trim();
}

function buildInjectedContext(session: ChatSession): {
  injectedContext: string;
  pagePath: string;
  includedFullPage: boolean;
} {
  const pagePath = canonicalizePathname(window.location.pathname);
  const sidebar = extractSidebarMarkdown();

  const hasPageAlready = session.sentPagePaths.includes(pagePath);
  const includedFullPage = !hasPageAlready;

  const page = includedFullPage
    ? extractCurrentPageMarkdown()
    : normalizeText([
        (document.querySelector('main h1')?.textContent ?? document.title ?? '').trim() || '# Page',
        `Path: ${pagePath}`,
        '(Page content already provided earlier in this session; not repeating it.)',
      ].join('\n'));

  return {
    injectedContext: `Context for this turn (use as reference):\n\n## Sidebar Navigation\n${sidebar}\n\n## Current Page\n${page}`,
    pagePath,
    includedFullPage,
  };
}

async function runContextCompletion(params: {
  provider: ChatProvider;
  history: Message[];
  injectedContext: string;
}): Promise<string> {
  const endpoint = `${params.provider.baseUrl.replace(/\/+$/g, '')}/chat/completions`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${params.provider.apiKey.trim()}`,
  };
  if (params.provider.baseUrl.includes('openrouter')) {
    headers['HTTP-Referer'] = window.location.origin;
    headers['X-Title'] = 'TDS Course Assistant';
  }

  const requestMessages: OpenRouterMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'system', content: params.injectedContext },
    ...params.history.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  const body = {
    model: params.provider.activeModel,
    temperature: 0.2,
    messages: requestMessages,
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Model request failed (${res.status})`);
  }

  const data = (await res.json()) as OpenRouterResponse;
  if (data.error) {
    const msg =
      typeof data.error === 'string'
        ? data.error
        : data.error.message || 'Unknown provider error';
    throw new Error(msg);
  }

  const msg = data.choices?.[0]?.message;
  if (!msg) throw new Error('No response choices returned');

  const content = typeof msg.content === 'string' ? msg.content : '';
  if (!content.trim()) throw new Error('Empty assistant response');
  return content.trim();
}

function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function extForLanguage(lang: string): string {
  const id = (lang || '').toLowerCase();
  const map: Record<string, string> = {
    bash: 'sh',
    sh: 'sh',
    shell: 'sh',
    python: 'py',
    py: 'py',
    javascript: 'js',
    js: 'js',
    typescript: 'ts',
    ts: 'ts',
    tsx: 'tsx',
    json: 'json',
    yaml: 'yml',
    yml: 'yml',
    html: 'html',
    css: 'css',
    sql: 'sql',
    md: 'md',
    markdown: 'md',
  };
  return map[id] ?? 'txt';
}

function extractFilename(meta: string, language: string): string | null {
  const match = meta.match(/(?:filename|file)=("([^"]+)"|([^\s]+))/i);
  if (match) {
    const candidate = (match[2] ?? match[3] ?? '').trim();
    if (candidate) return candidate;
  }
  if (language.startsWith('file:')) {
    const candidate = language.slice('file:'.length).trim();
    if (candidate) return candidate;
  }
  return null;
}

function MermaidBlock({ chart }: { chart: string }): React.JSX.Element {
  const id = useId().replace(/:/g, '_');
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      try {
        const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default';
        mermaid.initialize({
          startOnLoad: false,
          theme,
          securityLevel: 'strict',
        });
        const result = await mermaid.render(`mermaid_${id}_${Date.now()}`, chart);
        if (!cancelled) {
          setSvg(result.svg);
          setError('');
        }
      } catch {
        if (!cancelled) {
          setError('Could not render Mermaid diagram. Showing raw source.');
        }
      }
    };
    void render();
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (error) {
    return (
      <div className={styles.mermaidFallback}>
        <div className={styles.fileMeta}>{error}</div>
        <pre className={styles.codeContent}>{chart}</pre>
      </div>
    );
  }

  return <div className={styles.mermaidBlock} dangerouslySetInnerHTML={{ __html: svg }} />;
}

function MessageCode(props: MarkdownCodeProps): React.JSX.Element {
  const { inline, className, children, node, ...rest } = props;
  const raw = String(children ?? '').replace(/\n$/, '');
  const langRaw = (className ?? '').replace('language-', '').trim();
  const language = langRaw || 'text';
  const meta =
    isRecord(node) &&
    isRecord(node.data) &&
    typeof node.data.meta === 'string'
      ? node.data.meta
      : '';
  const filename = extractFilename(meta, language);
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }, [raw]);

  const onDownload = useCallback(() => {
    const fallback = `snippet.${extForLanguage(language)}`;
    downloadTextFile(filename ?? fallback, raw);
  }, [filename, language, raw]);

  const isInline =
    inline !== undefined
      ? inline
      : !(className && className.includes('language-')) && !String(children).includes('\n');

  if (isInline) {
    return (
      <code className={styles.inlineCode} {...rest}>
        {children}
      </code>
    );
  }

  if (language === 'mermaid') {
    return <MermaidBlock chart={raw} />;
  }

  return (
    <div className={styles.codeFrame}>
      <div className={styles.codeHeader}>
        <span className={styles.fileMeta}>
          {filename ? `${filename} · ${language}` : language}
        </span>
        <div className={styles.codeActions}>
          <button className={styles.codeBtn} type="button" onClick={() => void onCopy()}>
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button className={styles.codeBtn} type="button" onClick={onDownload}>
            Download
          </button>
        </div>
      </div>
      <pre className={styles.codeContent}>
        <code className={className} {...rest}>
          {raw}
        </code>
      </pre>
    </div>
  );
}

function MarkdownMessage({ content }: { content: string }): React.JSX.Element {
  return (
    <div className={styles.markdownRoot}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          code: (props) => <MessageCode {...(props as MarkdownCodeProps)} />,
          a: ({ href, children }) => {
            const safeHref = typeof href === 'string' ? href : '#';
            const isExternal = /^(https?:)?\/\//i.test(safeHref);
            const isDataUrl = /^data:/i.test(safeHref);
            return (
              <a
                href={safeHref}
                className={styles.messageLink}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                download={isDataUrl ? 'attachment.txt' : undefined}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/* ===== Resize hook ===== */
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
        if ('touches' in ev && ev.cancelable) ev.preventDefault();

        const cx = 'touches' in ev ? ev.touches[0].clientX : ev.clientX;
        const cy = 'touches' in ev ? ev.touches[0].clientY : ev.clientY;
        const dx = cx - dragging.current.startX;
        const dy = cy - dragging.current.startY;
        const s = dragging.current.startDims;
        const dir = dragging.current.direction;

        let newW = s.width;
        let newH = s.height;
        let newT = s.top;
        let newL = s.left;

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
        document.removeEventListener('touchcancel', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
      document.addEventListener('touchcancel', onUp);
    },
    [dimensions, setDimensions]
  );

  return { startResize };
}

/* ===== Main ===== */
function ChatPanelInner() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [opacity, setOpacity] = useState(1.0);
  const [chatState, setChatState] = useState<ChatState>(() => loadChatState());

  const [dimensions, setDimensions] = useState<Dimensions>(() => {
    const saved = loadFromStorage<Dimensions | null>(CHAT_DIMENSIONS_KEY, null);
    if (saved) return saved;
    const h = Math.round(window.innerHeight * 0.65);
    return {
      width: 460,
      height: h,
      top: window.innerHeight - h,
      left: window.innerWidth - 460 - 16,
    };
  });

  const chatContentRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stateSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dimsSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearConfirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { startResize } = useResize(dimensions, setDimensions);

  const activeSession = useMemo(
    () =>
      chatState.sessions.find((s) => s.id === chatState.activeSessionId) ??
      chatState.sessions[0] ??
      null,
    [chatState.sessions, chatState.activeSessionId]
  );

  const activeProvider = useMemo(
    () =>
      chatState.providers.find((p) => p.id === chatState.activeProviderId) ??
      chatState.providers[0] ??
      null,
    [chatState.providers, chatState.activeProviderId]
  );

  const messages = activeSession?.messages ?? [];

  useEffect(() => {
    const savedOpacity = loadFromStorage<number>(CHAT_OPACITY_KEY, 1.0);
    setOpacity(Math.max(0.5, Math.min(1.0, savedOpacity)));
  }, []);

  useEffect(() => {
    if (stateSaveTimer.current) clearTimeout(stateSaveTimer.current);
    stateSaveTimer.current = setTimeout(() => {
      saveToStorage(CHAT_STATE_KEY, chatState);
    }, 250);
    return () => {
      if (stateSaveTimer.current) clearTimeout(stateSaveTimer.current);
    };
  }, [chatState]);

  useEffect(() => {
    if (dimsSaveTimer.current) clearTimeout(dimsSaveTimer.current);
    dimsSaveTimer.current = setTimeout(() => {
      saveToStorage(CHAT_DIMENSIONS_KEY, dimensions);
    }, 400);
    return () => {
      if (dimsSaveTimer.current) clearTimeout(dimsSaveTimer.current);
    };
  }, [dimensions]);

  useEffect(() => {
    saveToStorage(CHAT_OPACITY_KEY, opacity);
  }, [opacity]);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  useEffect(() => {
    if (isAtBottom) scrollToBottom();
  }, [messages, isAtBottom, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const el = chatContentRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setIsAtBottom(atBottom);
  }, []);

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = () => setIsOpen((prev) => !prev);
    window.addEventListener('tds:toggle-chat', handler);
    return () => window.removeEventListener('tds:toggle-chat', handler);
  }, []);

  const updateProvider = useCallback((providerId: string, updater: (p: ChatProvider) => ChatProvider) => {
    setChatState((prev) => {
      const providers = prev.providers.map((p) => (p.id === providerId ? ensureValidProvider(updater(p)) : p));
      return { ...prev, providers };
    });
  }, []);

  const addProvider = useCallback(() => {
    const provider = createDefaultProvider();
    setChatState((prev) => ({
      ...prev,
      providers: [...prev.providers, provider],
      activeProviderId: provider.id,
    }));
  }, []);

  const removeProvider = useCallback((providerId: string) => {
    setChatState((prev) => {
      if (prev.providers.length <= 1) return prev;
      const providers = prev.providers.filter((p) => p.id !== providerId);
      const nextActive = providers.some((p) => p.id === prev.activeProviderId)
        ? prev.activeProviderId
        : providers[0].id;
      return { ...prev, providers, activeProviderId: nextActive };
    });
  }, []);

  const createNewSession = useCallback(() => {
    const s = createSession();
    setChatState((prev) => ({
      ...prev,
      sessions: [s, ...prev.sessions],
      activeSessionId: s.id,
    }));
    setShowClearConfirm(false);
    setInput('');
  }, []);

  const appendMessage = useCallback((message: Message) => {
    setChatState((prev) => {
      const activeId = prev.activeSessionId;
      const sessions = prev.sessions.map((s) => {
        if (s.id !== activeId) return s;
        const nextMessages = [...s.messages, message].slice(-MAX_HISTORY);
        const nextTitle =
          s.title === 'New Session' && s.messages.length === 0 && message.role === 'user'
            ? buildSessionTitle(message.content)
            : s.title;
        return {
          ...s,
          title: nextTitle,
          messages: nextMessages,
          updatedAt: now(),
        };
      });
      return { ...prev, sessions };
    });
  }, []);

  const markPageContextSent = useCallback((pagePath: string) => {
    const canonical = canonicalizePathname(pagePath);
    setChatState((prev) => {
      const activeId = prev.activeSessionId;
      const sessions = prev.sessions.map((s) => {
        if (s.id !== activeId) return s;
        if (s.sentPagePaths.includes(canonical)) return s;
        return {
          ...s,
          sentPagePaths: [...s.sentPagePaths, canonical].slice(-MAX_SENT_PAGES),
          updatedAt: now(),
        };
      });
      return { ...prev, sessions };
    });
  }, []);

  const clearActiveSession = useCallback(() => {
    if (!showClearConfirm) {
      setShowClearConfirm(true);
      if (clearConfirmTimer.current) clearTimeout(clearConfirmTimer.current);
      clearConfirmTimer.current = setTimeout(() => setShowClearConfirm(false), 2800);
      return;
    }
    setChatState((prev) => {
      const sessions = prev.sessions.map((s) =>
        s.id === prev.activeSessionId
          ? { ...s, messages: [], sentPagePaths: [], title: 'New Session', updatedAt: now() }
          : s
      );
      return { ...prev, sessions };
    });
    setShowClearConfirm(false);
  }, [showClearConfirm]);

  const exportChatHtml = useCallback(() => {
    if (!activeSession || activeSession.messages.length === 0) return;
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>TDS Chat Export</title>
  <style>
    body{font-family:Inter,system-ui,sans-serif;background:#f8f9fa;color:#111;padding:24px}
    .wrap{max-width:820px;margin:0 auto}
    .m{background:#fff;border:1px solid #e8eaed;border-radius:10px;padding:12px 14px;margin:10px 0;white-space:pre-wrap}
    .u{border-left:4px solid #1d9e75}
    .a{border-left:4px solid #1a73e8}
    .meta{font-size:12px;color:#5f6368;margin-bottom:6px}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>TDS Assistant Chat Export</h1>
    <p>Session: ${escapeHtml(activeSession.title)} · ${new Date().toLocaleString()}</p>
    ${activeSession.messages
      .map((m) => `<div class="m ${m.role === 'user' ? 'u' : 'a'}">
      <div class="meta">${m.role.toUpperCase()} · ${new Date(m.timestamp).toLocaleTimeString()}</div>
      ${escapeHtml(m.content)}
    </div>`)
      .join('\n')}
  </div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tds-chat-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [activeSession]);

  const exportChatPdf = useCallback(() => {
    if (!activeSession || activeSession.messages.length === 0) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 40;
    const maxWidth = pageW - margin * 2;
    let y = margin;

    const ensureSpace = (needed: number) => {
      if (y + needed <= pageH - margin) return;
      doc.addPage();
      y = margin;
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.text('TDS Assistant Chat Export', margin, y);
    y += 22;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Session: ${activeSession.title}`, margin, y);
    y += 16;
    doc.text(`Exported: ${new Date().toLocaleString()}`, margin, y);
    y += 18;

    for (const m of activeSession.messages) {
      const header = `${m.role === 'user' ? 'USER' : 'ASSISTANT'} • ${new Date(m.timestamp).toLocaleTimeString()}${m.model ? ` • ${m.model}` : ''}`;
      const body = stripMarkdown(m.content).replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ');
      const lines = doc.splitTextToSize(body || '(empty)', maxWidth) as string[];
      const blockHeight = 18 + lines.length * 14 + 14;
      ensureSpace(blockHeight);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(header, margin, y);
      y += 14;

      doc.setFont('courier', 'normal');
      doc.setFontSize(10);
      for (const line of lines) {
        doc.text(line, margin, y);
        y += 12;
      }
      y += 10;
    }

    doc.save(`tds-chat-${new Date().toISOString().slice(0, 10)}.pdf`);
  }, [activeSession]);

  const handleSend = useCallback(
    async (overrideInput?: string) => {
      const trimmed = (overrideInput ?? input).trim();
      if (!trimmed || isLoading || !activeSession || !activeProvider) return;

      const userMsg: Message = {
        id: makeId('msg'),
        role: 'user',
        content: trimmed,
        timestamp: now(),
      };

      const historyForModel = [...activeSession.messages, userMsg];
      appendMessage(userMsg);
      setInput('');
      setIsLoading(true);
      setIsAtBottom(true);

      try {
        let responseText = '';
        const ctx = buildInjectedContext(activeSession);
        if (!activeProvider.apiKey.trim()) {
          responseText =
            '⚠️ API key is not configured. Open **Config** and add your provider key to enable LLM responses.';
        } else {
          responseText = await runContextCompletion({
            provider: activeProvider,
            history: historyForModel,
            injectedContext: ctx.injectedContext,
          });

          if (ctx.includedFullPage) {
            markPageContextSent(ctx.pagePath);
          }
        }

        const assistantMsg: Message = {
          id: makeId('msg'),
          role: 'assistant',
          content: responseText,
          timestamp: now(),
          model: activeProvider.activeModel,
        };
        appendMessage(assistantMsg);
      } catch {
        const assistantMsg: Message = {
          id: makeId('msg'),
          role: 'assistant',
          content:
            '⚠️ Live model call failed. Please try again (or check your provider settings).',
          timestamp: now(),
        };
        appendMessage(assistantMsg);
      } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    },
    [input, isLoading, activeSession, activeProvider, appendMessage, markPageContextSent]
  );

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
          {resizeHandle('top', styles.resizeTop)}
          {resizeHandle('bottom', styles.resizeBottom)}
          {resizeHandle('left', styles.resizeLeft)}
          {resizeHandle('right', styles.resizeRight)}
          {resizeHandle('top-left', styles.resizeTopLeft)}
          {resizeHandle('top-right', styles.resizeTopRight)}
          {resizeHandle('bottom-left', styles.resizeBottomLeft)}
          {resizeHandle('bottom-right', styles.resizeBottomRight)}

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
              />
              <Moon size={12} />
            </div>

            <div className={styles.headerActions}>
              <button
                className={styles.textBtn}
                onClick={() => setShowSettings(true)}
                aria-label="Open chat config"
                title="Open chat config"
                type="button"
              >
                Config
              </button>
              <button
                className={styles.iconBtn}
                onClick={exportChatHtml}
                aria-label="Export chat as HTML"
                title="Export chat as HTML"
                disabled={messages.length === 0}
                type="button"
              >
                <Download size={15} />
              </button>
              <button
                className={styles.iconBtn}
                onClick={exportChatPdf}
                aria-label="Export chat as PDF"
                title="Export chat as PDF"
                disabled={messages.length === 0}
                type="button"
              >
                <Save size={15} />
              </button>
              <button
                className={`${styles.iconBtn} ${showClearConfirm ? styles.iconBtnDanger : ''}`}
                onClick={clearActiveSession}
                aria-label="Clear active session"
                title={showClearConfirm ? 'Click again to confirm' : 'Clear active session'}
                type="button"
              >
                <Trash2 size={15} />
              </button>
              <button
                className={styles.iconBtn}
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                title="Close"
                type="button"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          <div className={styles.sessionBar}>
            <select
              className={styles.sessionSelect}
              value={chatState.activeSessionId}
              onChange={(e) =>
                setChatState((prev) => ({ ...prev, activeSessionId: e.target.value }))
              }
              aria-label="Choose chat session"
            >
              {chatState.sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
            <button className={styles.newSessionBtn} onClick={createNewSession} type="button">
              New session
            </button>
          </div>

          <div className={styles.chatContent} ref={chatContentRef} onScroll={handleScroll}>
            {messages.length === 0 && !isLoading && (
              <div className={styles.welcomeSection}>
                <div className={styles.welcomeIcon}>
                  <MessageCircle size={28} />
                </div>
                <h4 className={styles.welcomeTitle}>Context-aware course assistant</h4>
                <p className={styles.welcomeDesc}>
                  Configure your model endpoint, then ask anything about the course, labs,
                  setup steps, or code help.
                </p>
                <div className={styles.suggestions}>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      className={styles.suggestionChip}
                      onClick={() => {
                        setInput(s.label);
                        void handleSend(s.label);
                      }}
                      type="button"
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
                    msg.role === 'user' ? styles.messageUser : styles.messageBot
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <>
                      {msg.model && <div className={styles.modelTag}>{msg.model}</div>}
                      <MarkdownMessage content={msg.content} />
                    </>
                  ) : (
                    <div className={styles.userText}>{msg.content}</div>
                  )}
                </div>
              </div>
            ))}

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

          {!isAtBottom && (
            <button
              className={styles.scrollToBottom}
              onClick={() => scrollToBottom()}
              aria-label="Scroll to bottom"
              type="button"
            >
              <ChevronDown size={16} />
            </button>
          )}

          {showClearConfirm && (
            <div className={styles.clearConfirmBanner}>
              Click 🗑️ again to clear this session
            </div>
          )}

          <div className={styles.composerTop}>
            <select
              className={styles.select}
              value={chatState.activeProviderId}
              onChange={(e) =>
                setChatState((prev) => ({ ...prev, activeProviderId: e.target.value }))
              }
              aria-label="Choose provider endpoint"
            >
              {chatState.providers.map((p, i) => (
                <option key={p.id} value={p.id}>
                  Endpoint {i + 1} · {p.baseUrl}
                </option>
              ))}
            </select>
            <select
              className={styles.select}
              value={activeProvider?.activeModel ?? ''}
              onChange={(e) => {
                if (!activeProvider) return;
                updateProvider(activeProvider.id, (p) => ({ ...p, activeModel: e.target.value }));
              }}
              aria-label="Choose model"
            >
              {(activeProvider?.models ?? []).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.chatInput}>
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              disabled={isLoading}
            />
            <button
              className={styles.sendBtn}
              onClick={() => void handleSend()}
              aria-label="Send message"
              disabled={isLoading || !input.trim()}
              type="button"
            >
              <Send size={16} />
            </button>
          </div>

          {showSettings && (
            <div className={styles.settingsOverlay}>
              <div className={styles.settingsModal} role="dialog" aria-modal="true" aria-label="Chat configuration">
                <div className={styles.settingsHeader}>
                  <h4>Chat configuration (local only)</h4>
                  <button className={styles.iconBtn} onClick={() => setShowSettings(false)} type="button">
                    <X size={15} />
                  </button>
                </div>

                <p className={styles.settingsHint}>
                  All values are stored only in this browser local storage. No server-side secret storage.
                </p>

                <div className={styles.settingsList}>
                  {chatState.providers.map((provider, idx) => (
                    <div key={provider.id} className={styles.providerCard}>
                      <div className={styles.providerCardHead}>
                        <strong>Endpoint {idx + 1}</strong>
                        <div className={styles.providerCardActions}>
                          <button
                            className={styles.smallBtn}
                            type="button"
                            onClick={() =>
                              setChatState((prev) => ({ ...prev, activeProviderId: provider.id }))
                            }
                          >
                            Use
                          </button>
                          <button
                            className={`${styles.smallBtn} ${styles.smallBtnDanger}`}
                            type="button"
                            onClick={() => removeProvider(provider.id)}
                            disabled={chatState.providers.length <= 1}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <label className={styles.fieldLabel}>
                        Base URL
                        <input
                          className={styles.configInput}
                          value={provider.baseUrl}
                          onChange={(e) =>
                            updateProvider(provider.id, (p) => ({ ...p, baseUrl: e.target.value }))
                          }
                          placeholder="https://openrouter.ai/api/v1"
                        />
                      </label>

                      <label className={styles.fieldLabel}>
                        API key
                        <input
                          className={styles.configInput}
                          type="password"
                          value={provider.apiKey}
                          onChange={(e) =>
                            updateProvider(provider.id, (p) => ({ ...p, apiKey: e.target.value }))
                          }
                          placeholder="sk-or-v1-..."
                        />
                      </label>

                      <label className={styles.fieldLabel}>
                        Models (one per line or comma-separated)
                        <textarea
                          className={styles.configTextarea}
                          value={provider.models.join('\n')}
                          onChange={(e) => {
                            const models = parseModelList(e.target.value);
                            updateProvider(provider.id, (p) => ({
                              ...p,
                              models,
                              activeModel: models.includes(p.activeModel) ? p.activeModel : models[0],
                            }));
                          }}
                          rows={4}
                        />
                      </label>

                      <label className={styles.fieldLabel}>
                        Active model
                        <select
                          className={styles.configInput}
                          value={provider.activeModel}
                          onChange={(e) =>
                            updateProvider(provider.id, (p) => ({ ...p, activeModel: e.target.value }))
                          }
                        >
                          {provider.models.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  ))}
                </div>

                <div className={styles.settingsFooter}>
                  <button className={styles.smallBtn} onClick={addProvider} type="button">
                    Add endpoint
                  </button>
                  <button className={styles.smallBtn} onClick={() => setShowSettings(false)} type="button">
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
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
