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
    }
  } catch (e) {
    return null;
  }
  return null;
}

export const YouTube: React.FC<YouTubeProps> = ({ id, url, title, start, className }) => {
  const videoId = id || (url ? extractYouTubeId(url) : null);

  if (!videoId) {
    return null;
  }

  const startParam = start ? `&start=${start}` : '';
  const src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0${startParam}`;

  return (
    <div className={`youtube-container ${className || ''}`} style={{ marginBottom: '1.5rem' }}>
      <iframe
        width="100%"
        height="450"
        src={src}
        title={title || 'YouTube video'}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ borderRadius: '0.5rem' }}
      />
    </div>
  );
};
