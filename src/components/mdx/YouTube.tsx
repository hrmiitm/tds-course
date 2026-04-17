import React from 'react';

type YouTubeProps = {
  id?: string;
  url?: string;
  title?: string;
  start?: number;
  className?: string;
};

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '').trim();
      return id || null;
    }
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtube-nocookie.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
      const m = u.pathname.match(/\/embed\/([^/]+)/);
      if (m?.[1]) return m[1];
    }
  } catch {
    // ignore
  }
  return null;
}

export default function YouTube({ id, url, title = 'YouTube video', start, className }: YouTubeProps) {
  const videoId = id ?? (url ? extractYouTubeId(url) : null);
  if (!videoId) {
    return (
      <div className={className}>
        <strong>Invalid YouTube embed</strong>
        <div>Provide an <code>id</code> or a valid <code>url</code>.</div>
      </div>
    );
  }

  const params = new URLSearchParams();
  params.set('rel', '0');
  if (typeof start === 'number' && start > 0) params.set('start', String(start));

  const src = `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;

  return (
    <div className={`tds-embed tds-embed--video ${className ?? ''}`.trim()}>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
