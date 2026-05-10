'use client';

import { FC } from 'react';
import { Play, Link as LinkIcon, Linkedin } from 'lucide-react';
import type { DetectedUrl, UrlKind } from '@/utils/url';
import { BaseModal } from '@/components/ui/BaseModal';
import type { EmbedSize, PreviewData } from './types';

/**
 * Internal card UI for `<Embed>`. Owns the visual surface (thumbnail +
 * site/title/description text + expand-into-modal behavior). Not exported
 * from the module barrel — consumers should use `<Embed>` instead.
 *
 * Responsibilities split out from `<Embed>` so this file can hold *all* the
 * presentational concerns (size tokens, brand thumbs, favicon fallback)
 * without bloating the public wrapper.
 */

const PROVIDER_LABEL: Record<UrlKind, string> = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  x: 'X',
  linkedin: 'LinkedIn',
  webpage: '',
};

interface SizeTokens {
  cardHeight: string;
  thumbWidth: string;
  textPadding: string;
  siteText: string;
  siteMb: string;
  titleText: string;
  descText: string;
  brandIcon: string;
  favicon: string;
  linkIcon: string;
  playButton: string;
  playIcon: string;
  cardMaxWidth: string;
}

const SIZE_TOKENS: Record<EmbedSize, SizeTokens> = {
  sm: {
    cardHeight: 'h-24',
    thumbWidth: 'w-24',
    textPadding: 'p-2',
    siteText: 'text-[10px]',
    siteMb: 'mb-0.5',
    titleText: 'text-[12px]',
    descText: 'text-[10px]',
    brandIcon: 'w-7 h-7',
    favicon: 'w-6 h-6',
    linkIcon: 'w-5 h-5',
    playButton: 'w-7 h-7',
    playIcon: 'w-3 h-3',
    cardMaxWidth: 'max-w-md',
  },
  md: {
    cardHeight: 'h-32',
    thumbWidth: 'w-32',
    textPadding: 'p-3',
    siteText: 'text-[11px]',
    siteMb: 'mb-1',
    titleText: 'text-sm',
    descText: 'text-xs',
    brandIcon: 'w-10 h-10',
    favicon: 'w-8 h-8',
    linkIcon: 'w-6 h-6',
    playButton: 'w-9 h-9',
    playIcon: 'w-4 h-4',
    cardMaxWidth: 'max-w-xl',
  },
  lg: {
    cardHeight: 'h-40',
    thumbWidth: 'w-40',
    textPadding: 'p-4',
    siteText: 'text-xs',
    siteMb: 'mb-1.5',
    titleText: 'text-base',
    descText: 'text-sm',
    brandIcon: 'w-12 h-12',
    favicon: 'w-10 h-10',
    linkIcon: 'w-7 h-7',
    playButton: 'w-11 h-11',
    playIcon: 'w-5 h-5',
    cardMaxWidth: 'max-w-2xl',
  },
};

const XGlyph: FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2H21.5l-7.5 8.57L22.75 22h-6.86l-5.37-6.99L4.4 22H1.14l8.03-9.18L1 2h7l4.86 6.43L18.244 2Zm-1.2 18h1.9L7.04 4H5.05l11.994 16Z" />
  </svg>
);

const BRAND_THUMB: Partial<
  Record<UrlKind, { bg: string; render: (iconClass: string) => React.ReactNode }>
> = {
  x: {
    bg: 'bg-black',
    render: (iconClass) => <XGlyph className={`${iconClass} text-white`} />,
  },
  linkedin: {
    bg: 'bg-[#0A66C2]',
    render: (iconClass) => <Linkedin className={`${iconClass} text-white fill-white`} />,
  },
};

function faviconFor(url: string): string | undefined {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
  } catch {
    return undefined;
  }
}

export interface EmbedCardProps {
  embed: DetectedUrl;
  preview: PreviewData | null;
  isLoading: boolean;
  thumbnailUrl?: string;
  expandable: boolean;
  expanded: boolean;
  onToggle: () => void;
  expandedContent?: React.ReactNode;
  isVideo?: boolean;
  size: EmbedSize;
  /**
   * When provided, clicking the card calls this instead of toggling the
   * card's internal expand state, AND the card's internal `BaseModal` is
   * suppressed. Use this when a parent component (e.g. an inline rich-link
   * popover) needs to render the modal at a higher point in the React tree
   * so the modal survives lifecycle events that would unmount this card.
   */
  onActivate?: () => void;
}

export const EmbedCard: FC<EmbedCardProps> = ({
  embed,
  preview,
  isLoading,
  thumbnailUrl,
  expandable,
  expanded,
  onToggle,
  expandedContent,
  isVideo,
  size,
  onActivate,
}) => {
  const t = SIZE_TOKENS[size];
  const handleActivate = onActivate ?? onToggle;
  const host = (() => {
    try {
      return new URL(embed.url).hostname.replace(/^www\./, '');
    } catch {
      return embed.url;
    }
  })();

  const providerLabel = PROVIDER_LABEL[embed.kind];
  const siteName = providerLabel || preview?.siteName || host;
  const title = preview?.title || host;
  const description = preview?.description;
  const image = thumbnailUrl || preview?.image;

  const brand = BRAND_THUMB[embed.kind];
  // LinkedIn previews usually return a generic/broken image; prefer the brand thumb.
  const effectiveImage = embed.kind === 'linkedin' ? undefined : image;
  const favicon = !effectiveImage && !brand ? faviconFor(embed.url) : undefined;
  const thumbNode = (
    <div className={`relative ${t.thumbWidth} shrink-0 bg-gray-100`}>
      {effectiveImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={effectiveImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/15">
              <div
                className={`${t.playButton} rounded-full bg-black/70 flex items-center justify-center`}
              >
                <Play className={`${t.playIcon} text-white fill-white ml-0.5`} />
              </div>
            </div>
          )}
        </>
      ) : brand ? (
        <div className={`w-full h-full flex items-center justify-center ${brand.bg}`}>
          {brand.render(t.brandIcon)}
        </div>
      ) : favicon ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={favicon} alt="" className={t.favicon} loading="lazy" />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <LinkIcon className={`${t.linkIcon} text-gray-300`} />
        </div>
      )}
    </div>
  );

  const textNode = (
    <div className={`flex-1 min-w-0 ${t.textPadding} text-left`}>
      <div
        className={`flex items-center gap-1.5 ${t.siteText} text-gray-500 ${t.siteMb} uppercase tracking-wide`}
      >
        <span className="font-semibold text-gray-700">{siteName}</span>
        {providerLabel && host && (
          <>
            <span className="text-gray-300">·</span>
            <span className="truncate normal-case tracking-normal text-gray-400">{host}</span>
          </>
        )}
      </div>
      <div className={`${t.titleText} font-medium text-gray-900 line-clamp-2 leading-snug`}>
        {isLoading && !title ? <span className="text-gray-400">Loading…</span> : title}
      </div>
      {description && (
        <div className={`${t.descText} text-gray-500 line-clamp-2 mt-1 leading-snug`}>
          {description}
        </div>
      )}
    </div>
  );

  const clickable = expandable ? (
    <button
      type="button"
      onClick={handleActivate}
      className="flex flex-1 min-w-0 hover:bg-gray-50 transition-colors text-left"
    >
      {thumbNode}
      {textNode}
    </button>
  ) : (
    <a
      href={embed.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-1 min-w-0 hover:bg-gray-50 transition-colors"
    >
      {thumbNode}
      {textNode}
    </a>
  );

  return (
    <>
      <div
        className={`border border-gray-200 rounded-lg overflow-hidden bg-white ${t.cardMaxWidth}`}
      >
        <div className={`flex w-full items-stretch ${t.cardHeight}`}>{clickable}</div>
      </div>
      {/*
        Expanded content is rendered as a modal overlay (instead of inline
        below the card) so it floats above page content and can scroll
        independently of the card's surrounding layout. BaseModal provides
        the backdrop, escape-to-close, click-outside-to-close, and the
        max-h-[85vh] scrollable surface for free.
        When `onActivate` is provided, the parent owns the modal and we
        skip rendering ours — otherwise both would mount and the parent's
        modal can survive lifecycle events that destroy this card (e.g.
        a tooltip portal that contains us closing on click).
      */}
      {!onActivate && expandable && expandedContent && (
        <BaseModal isOpen={expanded} onClose={onToggle} title={title} size="2xl" padding="p-0">
          {expandedContent}
        </BaseModal>
      )}
    </>
  );
};
