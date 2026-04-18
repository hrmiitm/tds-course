import React, { Children, isValidElement, ReactElement, ReactNode } from 'react';
import styles from './Steps.module.css';

export function Steps({ children, title }: { children: ReactNode; title?: string }): React.JSX.Element {
  const items = Children.toArray(children).filter(Boolean);
  const numbered = items.map((child, idx) => {
    if (!isValidElement(child)) return child;
    // Inject stepNumber only for our Step component
    return React.cloneElement(child as ReactElement<any>, { stepNumber: idx + 1 });
  });

  return (
    <section className={styles.steps}>
      {title && <div className={styles.stepsTitle}>{title}</div>}
      <div className={styles.stepsList}>{numbered}</div>
    </section>
  );
}

export function Step({
  title,
  children,
  defaultOpen,
  stepNumber,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  stepNumber?: number;
}): React.JSX.Element {
  return (
    <details className={styles.step} open={defaultOpen}>
      <summary className={styles.stepSummary}>
        <span className={styles.stepNum}>{stepNumber ?? '•'}</span>
        <span className={styles.stepTitle}>{title}</span>
        <span className={styles.stepChevron} aria-hidden="true">
          ▾
        </span>
      </summary>
      <div className={styles.stepBody}>{children}</div>
    </details>
  );
}
