import React from 'react';
import Link from '@docusaurus/Link';
import { ArrowRight, Clock } from 'lucide-react';

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
    <div style={{
      background: 'var(--tds-surface)',
      border: '1px solid var(--tds-border)',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: 'var(--tds-shadow-sm)',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--tds-shadow-md)';
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--tds-shadow-sm)';
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
    }}
    >
      {/* Color bar */}
      <div style={{
        height: 4,
        background: diffStyle.border,
      }} />

      <div style={{ padding: 24 }}>
        {/* Lab number + difficulty */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'var(--ifm-color-primary)',
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 700,
          }}>
            {labNumber}
          </span>
          <span style={{
            padding: '2px 10px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 500,
            background: diffStyle.bg,
            color: diffStyle.color,
          }}>
            {difficulty}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: 17,
          fontWeight: 600,
          marginBottom: 8,
          color: 'var(--tds-text-primary)',
        }}>
          {title}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: 14,
          color: 'var(--tds-text-secondary)',
          lineHeight: 1.6,
          marginBottom: 12,
        }}>
          {description}
        </p>

        {/* Tags */}
        <div style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}>
          {tags.map((tag) => (
            <span key={tag} style={{
              padding: '2px 8px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 500,
              background: 'var(--tds-surface-secondary)',
              color: 'var(--tds-text-secondary)',
              border: '1px solid var(--tds-border)',
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            color: 'var(--tds-text-tertiary)',
          }}>
            <Clock size={12} /> {duration}
          </span>
          <Link
            to={href}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--ifm-color-primary)',
              textDecoration: 'none',
              transition: 'gap 0.15s',
            }}
          >
            Start Lab <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
