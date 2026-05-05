'use client';

import { FC } from 'react';
import { BookOpen, Eye, ExternalLink, Play } from 'lucide-react';
import { XEmbedIframe, type DetectedEmbed } from '@/components/Activity/ActivityEmbed';
import { isExternalKind, isVideoKind } from '../types';
import { cn } from '@/utils/styles';

export const ReadReviewButton: FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
    aria-label="Read review"
    className={cn(
      'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20',
      'inline-flex items-center gap-1.5 px-4 h-10 rounded-full',
      'bg-black/55 backdrop-blur-sm ring-2 ring-white/30 text-white text-sm font-semibold',
      'transition-transform group-hover:scale-105'
    )}
  >
    <BookOpen size={16} />
    Read review
  </button>
);

export const EmbedActionButton: FC<{
  embed: DetectedEmbed;
  favicon?: string;
  onPlay: () => void;
}> = ({ embed, favicon, onPlay }) => {
  const handleClick: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isExternalKind(embed.kind)) {
      window.open(embed.url, '_blank', 'noopener,noreferrer');
      return;
    }
    onPlay();
  };

  if (isVideoKind(embed.kind)) {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label="Play video"
        className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20',
          'w-14 h-14 rounded-full bg-black/55 backdrop-blur-sm ring-2 ring-white/30',
          'flex items-center justify-center transition-transform group-hover:scale-110'
        )}
      >
        <Play size={22} className="text-white fill-white ml-0.5" />
      </button>
    );
  }

  const isExternal = isExternalKind(embed.kind);
  const label = isExternal ? 'Open link' : 'See post';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className={cn(
        'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20',
        'inline-flex items-center gap-1.5 px-4 h-10 rounded-full',
        'bg-black/55 backdrop-blur-sm ring-2 ring-white/30 text-white text-sm font-semibold',
        'transition-transform group-hover:scale-105'
      )}
    >
      {isExternal && favicon ? (
        <img src={favicon} alt="" className="w-4 h-4 rounded-sm" />
      ) : isExternal ? (
        <ExternalLink size={16} />
      ) : (
        <Eye size={16} />
      )}
      {label}
    </button>
  );
};

/** Renders the actual provider iframe; sized to fill its parent. */
export const PlayingIframe: FC<{ embed: DetectedEmbed }> = ({ embed }) => {
  // Stop the parent <Link> from intercepting iframe interaction.
  const stop: React.MouseEventHandler = (e) => e.stopPropagation();

  if (embed.kind === 'youtube' && embed.videoId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${embed.videoId}?autoplay=1`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full bg-black"
        onClick={stop}
      />
    );
  }
  if (embed.kind === 'tiktok' && embed.videoId) {
    return (
      <iframe
        src={`https://www.tiktok.com/embed/v2/${embed.videoId}`}
        title="TikTok video"
        allow="encrypted-media;"
        allowFullScreen
        className="absolute inset-0 w-full h-full bg-black"
        onClick={stop}
      />
    );
  }
  if (embed.kind === 'x' && embed.tweetId) {
    return (
      <div className="absolute inset-0 overflow-auto bg-white" onClick={stop}>
        <XEmbedIframe tweetId={embed.tweetId} />
      </div>
    );
  }
  if (embed.kind === 'linkedin' && embed.linkedinUrn) {
    return (
      <iframe
        src={`https://www.linkedin.com/embed/feed/update/urn:li:activity:${embed.linkedinUrn}`}
        title="LinkedIn post"
        allowFullScreen
        className="absolute inset-0 w-full h-full bg-white"
        onClick={stop}
      />
    );
  }
  return null;
};
