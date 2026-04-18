import React, { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import OriginalCodeBlock from '@theme-original/CodeBlock';
import styles from './styles.module.css';

type Props = React.ComponentProps<typeof OriginalCodeBlock>;

const STORAGE_KEY_WRAP = 'tds_codeblock_wrap';
const STORAGE_KEY_LINE_NUMBERS = 'tds_codeblock_line_numbers';
const EVT_LINE_NUMBERS = 'tds:codeblock-line-numbers';

const COLLAPSE_AFTER_LINES = 8;

function getCodeText(children: Props['children']): string {
  if (typeof children === 'string') return children;
  // MDX sometimes passes an array with a single string
  if (Array.isArray(children) && children.length === 1 && typeof children[0] === 'string') {
    return children[0];
  }
  return '';
}

function getLanguageId(className?: string): string {
  if (!className) return '';
  const m = className.match(/language-([a-z0-9-]+)/i);
  return m?.[1] ?? '';
}

function extForLanguage(lang: string): string {
  const id = (lang || '').toLowerCase();
  const map: Record<string, string> = {
    bash: 'sh',
    sh: 'sh',
    shell: 'sh',
    zsh: 'sh',
    powershell: 'ps1',
    ps1: 'ps1',
    javascript: 'js',
    js: 'js',
    typescript: 'ts',
    ts: 'ts',
    tsx: 'tsx',
    jsx: 'jsx',
    json: 'json',
    yaml: 'yml',
    yml: 'yml',
    python: 'py',
    py: 'py',
    go: 'go',
    rust: 'rs',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cs: 'cs',
    html: 'html',
    css: 'css',
    sql: 'sql',
    markdown: 'md',
    md: 'md',
    text: 'txt',
    txt: 'txt',
  };
  return map[id] ?? 'txt';
}

export default function CodeBlock(props: Props): React.JSX.Element {
  const code = useMemo(() => getCodeText(props.children).replace(/\n+$/g, ''), [props.children]);
  const lineCount = useMemo(() => (code ? code.split('\n').length : 0), [code]);
  const canCollapse = lineCount > COLLAPSE_AFTER_LINES;
  const langId = useMemo(() => getLanguageId(props.className), [props.className]);
  const headerTitle = useMemo(() => {
    return props.title ? String(props.title) : langId || 'code';
  }, [props.title, langId]);

  const [expanded, setExpanded] = useState(() => !canCollapse);
  const [wrap, setWrap] = useState(false);
  const [lineNumbers, setLineNumbers] = useState<boolean>(() => Boolean((props as any).showLineNumbers));
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!canCollapse) {
      setExpanded(true);
    }
  }, [canCollapse]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_WRAP);
      if (raw === '1') setWrap(true);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LINE_NUMBERS);
      if (raw === '1') setLineNumbers(true);
      if (raw === '0') setLineNumbers(false);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const onLineNumbers = (e: Event) => {
      const next = Boolean((e as CustomEvent<boolean>).detail);
      setLineNumbers(next);
    };
    window.addEventListener(EVT_LINE_NUMBERS, onLineNumbers as EventListener);
    return () => window.removeEventListener(EVT_LINE_NUMBERS, onLineNumbers as EventListener);
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
    };
  }, []);

  const toggleWrap = () => {
    setWrap((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_WRAP, next ? '1' : '0');
      } catch {
        // ignore
      }
      return next;
    });
  };

  const toggleLineNumbers = () => {
    setLineNumbers((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_LINE_NUMBERS, next ? '1' : '0');
      } catch {
        // ignore
      }
      try {
        window.dispatchEvent(new CustomEvent<boolean>(EVT_LINE_NUMBERS, { detail: next }));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const doCopy = async (): Promise<void> => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  const download = (): void => {
    if (!code) return;
    const ext = extForLanguage(langId);
    const filename = `snippet.${ext}`;
    const blob = new Blob([`${code}\n`], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const openTerminal = async (): Promise<void> => {
    await doCopy();
    window.dispatchEvent(new Event('tds:open-terminal'));
  };

  const hasCode = Boolean(code);

  return (
    <div className={clsx(styles.window, wrap && styles.wrap, canCollapse && !expanded && styles.collapsed)}>
      <div className={styles.header}>
        <div className={styles.dots} aria-hidden="true">
          <span className={clsx(styles.dot, styles.dotRed)} />
          <span className={clsx(styles.dot, styles.dotYellow)} />
          <span className={clsx(styles.dot, styles.dotGreen)} />
        </div>

        {canCollapse && (
          <button
            type="button"
            className={clsx(styles.actionBtn, styles.collapseBtn)}
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? 'Collapse code block' : `Expand code block (${lineCount} lines)`}
          >
            {expanded ? 'Collapse' : `Expand (${lineCount})`}
          </button>
        )}

        <div className={styles.headerTitle}>{headerTitle}</div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={doCopy}
            disabled={!hasCode}
            title={hasCode ? 'Copy code to clipboard' : 'No code to copy'}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={download}
            disabled={!hasCode}
            title={hasCode ? 'Download snippet' : 'No code to download'}
          >
            Download
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={openTerminal}
            disabled={!hasCode}
            title={hasCode ? 'Copy + open terminal' : 'No code to send'}
          >
            Terminal
          </button>

          <button type="button" className={styles.actionBtn} onClick={toggleWrap}>
            {wrap ? 'No wrap' : 'Wrap'}
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={toggleLineNumbers}
            disabled={!hasCode}
            title={lineNumbers ? 'Hide line numbers' : 'Show line numbers'}
          >
            {lineNumbers ? 'Hide #' : 'Show #'}
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <OriginalCodeBlock {...props} showLineNumbers={lineNumbers} />
        {canCollapse && !expanded && <div className={styles.fade} aria-hidden="true" />}
      </div>
    </div>
  );
}
