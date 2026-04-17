import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import OriginalCodeBlock from '@theme-original/CodeBlock';
import styles from './styles.module.css';

type Props = React.ComponentProps<typeof OriginalCodeBlock>;

const STORAGE_KEY_WRAP = 'tds_codeblock_wrap';
const COLLAPSE_AFTER_LINES = 8;

function getCodeText(children: Props['children']): string {
  if (typeof children === 'string') return children;
  // MDX sometimes passes an array with a single string
  if (Array.isArray(children) && children.length === 1 && typeof children[0] === 'string') {
    return children[0];
  }
  return '';
}

export default function CodeBlock(props: Props): React.JSX.Element {
  const code = useMemo(() => getCodeText(props.children).replace(/\n+$/g, ''), [props.children]);
  const lineCount = useMemo(() => (code ? code.split('\n').length : 0), [code]);
  const canCollapse = lineCount > COLLAPSE_AFTER_LINES;

  const [expanded, setExpanded] = useState(() => !canCollapse);
  const [wrap, setWrap] = useState(false);

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

  return (
    <div
      className={clsx(
        styles.window,
        wrap && styles.wrap,
        canCollapse && !expanded && styles.collapsed
      )}
    >
      <div className={styles.header}>
        <div className={styles.dots} aria-hidden="true">
          <span className={clsx(styles.dot, styles.dotRed)} />
          <span className={clsx(styles.dot, styles.dotYellow)} />
          <span className={clsx(styles.dot, styles.dotGreen)} />
        </div>

        <div className={styles.headerTitle}>
          {props.title ? String(props.title) : props.className?.replace('language-', '') || 'code'}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.actionBtn} onClick={toggleWrap}>
            {wrap ? 'No wrap' : 'Wrap'}
          </button>
          {canCollapse && (
            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? 'Collapse' : `Show all (${lineCount} lines)`}
            </button>
          )}
        </div>
      </div>

      <div className={styles.body}>
        <OriginalCodeBlock {...props} />
        {canCollapse && !expanded && <div className={styles.fade} aria-hidden="true" />}
      </div>
    </div>
  );
}
