'use client';

import { FC, useState } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useLinkPreview, type DetectedEmbed } from '@/components/Activity/ActivityEmbed';
import { formatTimeAgo } from '@/utils/date';
import { ACCENT, faviconFor, resolveEmbedThumb, type StoryDetails } from './types';
import { BRAND, PlatformChip } from './lib/ActivityStoryBadges';
import { EmbedActionButton, PlayingIframe } from './lib/ActivityStoryButtons';
import { cn } from '@/utils/styles';

interface ActivityStoryPlayableCardProps {
  details: StoryDetails;
  embed: DetectedEmbed;
  timestamp: string;
}

/**
 * Card variant for author updates with an embeddable link
 * (YouTube / TikTok / X / LinkedIn / external webpage).
 *
 * Default state: thumbnail (or brand) bg with overlaid author header + center
 * action button. On click: iframe fills the card; close (X) returns to default.
 */
export const ActivityStoryPlayableCard: FC<ActivityStoryPlayableCardProps> = ({
  details,
  embed,
  timestamp,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const enablePreview =
    !isPlaying && embed.kind !== 'youtube' && embed.kind !== 'x' && embed.kind !== 'linkedin';
  const { data: preview } = useLinkPreview(embed.url, enablePreview);
  const thumb = resolveEmbedThumb(embed, preview);
  const brand = embed.kind === 'x' || embed.kind === 'linkedin' ? BRAND[embed.kind] : null;
  const favicon = embed.kind === 'webpage' ? faviconFor(embed.url) : undefined;

  return (
    <div
      className={cn(
        'snap-start shrink-0 relative w-[280px] h-[360px] rounded-xl overflow-hidden',
        'border border-gray-200 shadow-sm group hover:shadow-lg transition-all'
      )}
    >
      {/* Background layer (thumbnail / brand / favicon watermark) */}
      {thumb ? (
        <img
          src={thumb}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : brand ? (
        <div className={cn('absolute inset-0 flex items-center justify-center', brand.bg)}>
          {brand.glyph}
        </div>
      ) : embed.kind === 'webpage' ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
          {favicon ? (
            <img src={favicon} alt="" className="w-28 h-28 opacity-30" loading="lazy" />
          ) : (
            <ExternalLink className="w-28 h-28 text-white/15" />
          )}
        </div>
      ) : (
        <div className="absolute inset-0 bg-gray-900" />
      )}

      {isPlaying ? (
        <>
          <PlayingIframe embed={embed} />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsPlaying(false);
            }}
            aria-label="Close player"
            className="absolute top-2 right-2 z-40 w-7 h-7 rounded-full bg-black/65 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center transition-colors"
          >
            <X size={14} />
          </button>
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />
          <div className={cn('absolute top-0 inset-x-0 h-1 z-10', ACCENT[details.kind])} />
          {/* Webpage uses favicon as bg watermark, not a top chip. */}
          {embed.kind !== 'webpage' && <PlatformChip embed={embed} />}

          {/* Overlay content (pointer-events-none so the action button takes clicks) */}
          <div className="absolute inset-0 flex flex-col p-4 text-white pointer-events-none">
            <div className="flex items-center gap-2.5">
              <Avatar
                src={details.author.profileImage}
                alt={details.author.fullName || 'User'}
                size={36}
                authorId={details.author.id}
                disableTooltip
                className="ring-2 ring-white/70"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white truncate leading-tight drop-shadow-md [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]">
                  {details.author.fullName || 'Unknown'}
                </div>
              </div>
            </div>

            <div className="flex-1" />

            <div className="pt-2.5 border-t border-white/15">
              {details.workTitle && (
                <div className="text-xs font-medium text-white/95 line-clamp-1 mb-0.5 drop-shadow">
                  {details.workTitle}
                </div>
              )}
              <div className="text-[11px] text-white/65">{formatTimeAgo(timestamp)}</div>
            </div>
          </div>

          <EmbedActionButton embed={embed} favicon={favicon} onPlay={() => setIsPlaying(true)} />
        </>
      )}
    </div>
  );
};
