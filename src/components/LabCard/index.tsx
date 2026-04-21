import React from 'react';
import Link from '@docusaurus/Link';
import { ArrowRight, Clock } from 'lucide-react';
import styles from './LabCard.module.css';

interface LabCardProps {
  labNumber: number;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  href: string;
}

const difficultyColors = {
  Beginner: { bg: 'rgba(29,158,117,0.1)', color: '#1d9e75', border: '#1d9e75' },
  Intermediate: { bg: 'rgba(242,153,0,0.12)', color: '#f29900', border: '#f29900' },
  Advanced: { bg: 'rgba(217,48,37,0.1)', color: '#d93025', border: '#d93025' },
};

export default function LabCard({ labNumber, title, description, duration, difficulty, tags, href }: LabCardProps) {
  const diffStyle = difficultyColors[difficulty];

  return (
    <Link
      to={href}
      className={styles.card}
      style={{
        ['--lab-accent' as any]: diffStyle.border,
        ['--lab-accent-soft' as any]: diffStyle.bg,
        ['--lab-accent-ink' as any]: diffStyle.color,
      } as React.CSSProperties}
    >
      <div className={styles.cardInner}>
        <div className={styles.topBar} />

        <div className={styles.headerRow}>
          <span className={styles.numberChip}>#{labNumber}</span>
          <span className={styles.difficultyChip}>{difficulty}</span>
        </div>

        <div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </div>

        <div className={styles.tagRow}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>

        <div className={styles.footerRow}>
          <span className={styles.duration}>
            <Clock size={12} /> {duration}
          </span>
          <span className={styles.cta}>
            Start Lab <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
