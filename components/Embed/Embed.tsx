'use client';

import { FC, useState } from 'react';
import type { DetectedUrl } from '@/utils/url';
import { EmbedCard } from './EmbedCard';
import { EmbedExpandedContent, isEmbedExpandable } from './EmbedExpandedContent';
import { useLinkPreview } from './hooks/useLinkPreview';
import type { EmbedSize } from './types';

/**
 * Public embed component. Resolves a `DetectedUrl` into a card with link
 * preview metadata, an optional thumbnail, and a modal-overlay for
 * expandable kinds (YouTube, TikTok, X, LinkedIn).
 *
 * This is the thin public wrapper — see `EmbedCard` for the visual surface
 * and `EmbedExpandedContent` for the expanded iframe body.
 */
export const Embed: FC<{
  embed: DetectedUrl;
  size?: EmbedSize;
  /**
   * If provided, clicking the card calls `onActivate` instead of toggling
   * the card's internal modal — and the card stops rendering its own modal.
   * Use this when a parent needs to host the modal in a more durable spot
   * in the React tree (e.g. so it can survive a tooltip portal closing).
   */
  onActivate?: () => void;
}> = ({ embed, size = 'md', onActivate }) => {
  const [expanded, setExpanded] = useState(false);
  const { data: preview, isLoading } = useLinkPreview(embed.url, true);

  const expandable = isEmbedExpandable(embed);
  const expandedContent = expandable ? <EmbedExpandedContent embed={embed} /> : null;
  const thumb =
    embed.kind === 'youtube' && embed.videoId
      ? `https://img.youtube.com/vi/${embed.videoId}/hqdefault.jpg`
      : undefined;
  const isVideo = embed.kind === 'youtube' || embed.kind === 'tiktok';

  return (
    <EmbedCard
      embed={embed}
      preview={preview}
      isLoading={isLoading}
      thumbnailUrl={thumb}
      expandable={expandable}
      expanded={expanded}
      onToggle={() => setExpanded((v) => !v)}
      isVideo={isVideo}
      size={size}
      onActivate={onActivate}
      expandedContent={expandedContent}
    />
  );
};
