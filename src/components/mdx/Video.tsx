import React from 'react';

type VideoProps = {
  src: string;
  title?: string;
  poster?: string;
  className?: string;
  controls?: boolean;
};

export default function Video({ src, title = 'Video', poster, className, controls = true }: VideoProps) {
  return (
    <div className={`tds-embed tds-embed--video ${className ?? ''}`.trim()}>
      <video
        src={src}
        title={title}
        poster={poster}
        controls={controls}
        playsInline
        preload="metadata"
        style={{ width: '100%', height: '100%', borderRadius: 12 }}
      />
    </div>
  );
}
