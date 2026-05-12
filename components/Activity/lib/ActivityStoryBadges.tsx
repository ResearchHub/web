'use client';

import { FC, ReactNode } from 'react';
import { Star, Bell, ExternalLink, Linkedin, Play } from 'lucide-react';
import type { DetectedUrl, UrlKind } from '@/utils/url';
import { faviconFor, type StoryDetails, type StoryKind } from '../types';
import { cn } from '@/utils/styles';

export const XGlyph: FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2H21.5l-7.5 8.57L22.75 22h-6.86l-5.37-6.99L4.4 22H1.14l8.03-9.18L1 2h7l4.86 6.43L18.244 2Zm-1.2 18h1.9L7.04 4H5.05l11.994 16Z" />
  </svg>
);

export const PLATFORM_LABEL: Record<UrlKind, string> = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  x: 'X',
  linkedin: 'LinkedIn',
  webpage: 'Link',
};

/** Branded background tile used for X/LinkedIn cards when no preview image exists. */
export const BRAND: Record<'x' | 'linkedin', { bg: string; glyph: ReactNode }> = {
  x: {
    bg: 'bg-black',
    glyph: <XGlyph className="w-32 h-32 text-white/15" />,
  },
  linkedin: {
    bg: 'bg-[#0A66C2]',
    glyph: <Linkedin className="w-32 h-32 text-white/20 fill-white/20" />,
  },
};

export const PlatformChip: FC<{ embed: DetectedUrl }> = ({ embed }) => {
  if (embed.kind === 'webpage') {
    let host = '';
    try {
      host = new URL(embed.url).hostname.replace(/^www\./, '');
    } catch {
      host = embed.url;
    }
    const favicon = faviconFor(embed.url);
    return (
      <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold max-w-[180px]">
        {favicon ? (
          <img src={favicon} alt="" className="w-3 h-3 rounded-sm shrink-0" />
        ) : (
          <ExternalLink className="w-3 h-3 shrink-0" />
        )}
        <span className="truncate">{host}</span>
        {favicon && <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />}
      </div>
    );
  }

  const Icon = embed.kind === 'linkedin' ? Linkedin : embed.kind === 'x' ? XGlyph : Play; // youtube / tiktok
  return (
    <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold">
      <Icon className="w-3 h-3" />
      <span>{PLATFORM_LABEL[embed.kind]}</span>
    </div>
  );
};

/**
 * Top-right corner indicator:
 *  - Peer review → "Peer Review" badge.
 *  - Update with embed → platform chip.
 *  - Otherwise nothing.
 */
export const TopBadge: FC<{ details: StoryDetails; dark?: boolean }> = ({ details, dark }) => {
  if (details.kind === 'review') {
    return (
      <div
        className={cn(
          'absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold backdrop-blur-sm',
          dark
            ? 'bg-amber-400/95 text-amber-950 border border-amber-300/70'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        )}
      >
        <Star size={10} className="fill-current" />
        Peer Review
      </div>
    );
  }
  if (details.embed) return <PlatformChip embed={details.embed} />;
  return null;
};

export const ReviewScoreRow: FC<{ score: number; dark?: boolean }> = ({ score, dark }) => (
  <div className={cn('flex items-center gap-0.5', dark && 'drop-shadow-md')}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={11}
        className={cn(
          i <= Math.round(score)
            ? 'fill-amber-400 text-amber-400'
            : dark
              ? 'fill-white/30 text-white/30'
              : 'fill-gray-200 text-gray-200'
        )}
      />
    ))}
    <span className={cn('ml-1 text-[11px] font-semibold', dark ? 'text-white' : 'text-amber-700')}>
      {score.toFixed(1)}
    </span>
  </div>
);

export const ActionIcon: FC<{ kind: StoryKind; dark?: boolean }> = ({ kind, dark }) => {
  const size = 12;
  if (kind === 'review') {
    return (
      <Star
        size={size}
        className={cn('shrink-0 fill-amber-400', dark ? 'text-amber-300' : 'text-amber-400')}
      />
    );
  }
  return <Bell size={size} className={cn('shrink-0', dark ? 'text-white' : 'text-primary-500')} />;
};
