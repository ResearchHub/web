'use client';

import { FC, useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Play,
  Link as LinkIcon,
  Linkedin,
} from 'lucide-react';

export type EmbedKind = 'youtube' | 'tiktok' | 'x' | 'linkedin' | 'webpage';

export interface DetectedEmbed {
  kind: EmbedKind;
  url: string;
  videoId?: string;
  linkedinUrn?: string;
  tweetId?: string;
}

const URL_REGEX = /https?:\/\/[^\s<>"'`)]+/gi;

export function extractFirstEmbed(text: string): DetectedEmbed | null {
  if (!text) return null;
  const matches = text.match(URL_REGEX);
  if (!matches) return null;
  for (const raw of matches) {
    const url = raw.replace(/[.,;:!?)\]]+$/, '');
    const detected = classifyUrl(url);
    if (detected) return detected;
  }
  return null;
}

function classifyUrl(url: string): DetectedEmbed | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, '');

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const v = u.searchParams.get('v');
    if (v) return { kind: 'youtube', url, videoId: v };
    const shorts = u.pathname.match(/^\/shorts\/([\w-]+)/);
    if (shorts) return { kind: 'youtube', url, videoId: shorts[1] };
  }
  if (host === 'youtu.be') {
    const id = u.pathname.slice(1);
    if (id) return { kind: 'youtube', url, videoId: id };
  }
  if (host.endsWith('tiktok.com')) {
    const m = u.pathname.match(/\/video\/(\d+)/);
    if (m) return { kind: 'tiktok', url, videoId: m[1] };
    return { kind: 'tiktok', url };
  }
  if (host === 'x.com' || host === 'twitter.com' || host === 'mobile.twitter.com') {
    const m = u.pathname.match(/\/status\/(\d+)/);
    return { kind: 'x', url, tweetId: m ? m[1] : undefined };
  }
  if (host === 'linkedin.com' || host.endsWith('.linkedin.com')) {
    const activityMatch = url.match(/activity[-:](\d{15,25})/);
    return {
      kind: 'linkedin',
      url,
      linkedinUrn: activityMatch ? activityMatch[1] : undefined,
    };
  }
  return { kind: 'webpage', url };
}

interface PreviewData {
  url: string;
  siteName?: string;
  title?: string;
  description?: string;
  image?: string;
  html?: string;
}

function useLinkPreview(url: string, enabled = true) {
  const [data, setData] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setIsLoading(true);
    fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        if (d && !d.error) setData(d);
      })
      .catch(() => {})
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [url, enabled]);

  return { data, isLoading };
}

const PROVIDER_LABEL: Record<EmbedKind, string> = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  x: 'X',
  linkedin: 'LinkedIn',
  webpage: '',
};

interface CardProps {
  embed: DetectedEmbed;
  preview: PreviewData | null;
  isLoading: boolean;
  thumbnailUrl?: string;
  expandable: boolean;
  expanded: boolean;
  onToggle: () => void;
  expandedContent?: React.ReactNode;
  isVideo?: boolean;
}

const XGlyph: FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2H21.5l-7.5 8.57L22.75 22h-6.86l-5.37-6.99L4.4 22H1.14l8.03-9.18L1 2h7l4.86 6.43L18.244 2Zm-1.2 18h1.9L7.04 4H5.05l11.994 16Z" />
  </svg>
);

const BRAND_THUMB: Partial<Record<EmbedKind, { bg: string; node: React.ReactNode }>> = {
  x: {
    bg: 'bg-black',
    node: <XGlyph className="w-10 h-10 text-white" />,
  },
  linkedin: {
    bg: 'bg-[#0A66C2]',
    node: <Linkedin className="w-10 h-10 text-white fill-white" />,
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

const EmbedCard: FC<CardProps> = ({
  embed,
  preview,
  isLoading,
  thumbnailUrl,
  expandable,
  expanded,
  onToggle,
  expandedContent,
  isVideo,
}) => {
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
    <div className="relative w-32 h-24 shrink-0 bg-gray-100">
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
              <div className="w-9 h-9 rounded-full bg-black/70 flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              </div>
            </div>
          )}
        </>
      ) : brand ? (
        <div className={`w-full h-full flex items-center justify-center ${brand.bg}`}>
          {brand.node}
        </div>
      ) : favicon ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={favicon} alt="" className="w-8 h-8" loading="lazy" />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <LinkIcon className="w-6 h-6 text-gray-300" />
        </div>
      )}
    </div>
  );

  const textNode = (
    <div className="flex-1 min-w-0 p-3 text-left">
      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1 uppercase tracking-wide">
        <span className="font-semibold text-gray-700">{siteName}</span>
        {providerLabel && host && (
          <>
            <span className="text-gray-300">·</span>
            <span className="truncate normal-case tracking-normal text-gray-400">{host}</span>
          </>
        )}
      </div>
      <div className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
        {isLoading && !title ? <span className="text-gray-400">Loading…</span> : title}
      </div>
      {description && (
        <div className="text-xs text-gray-500 line-clamp-2 mt-1 leading-snug">{description}</div>
      )}
    </div>
  );

  const clickable = expandable ? (
    <button
      type="button"
      onClick={onToggle}
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
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white max-w-xl">
      <div className="flex w-full items-stretch">
        {clickable}
        <div className="flex items-start gap-1 p-2 shrink-0">
          {expandable && (
            <a
              href={embed.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              aria-label="Open link in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {expandable ? (
            <button
              type="button"
              onClick={onToggle}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          ) : (
            <span className="p-1.5 text-gray-400">
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>
      {expandable && expanded && expandedContent && (
        <div className="border-t border-gray-100 bg-gray-50">{expandedContent}</div>
      )}
    </div>
  );
};

const XEmbedIframe: FC<{ tweetId: string }> = ({ tweetId }) => {
  const [height, setHeight] = useState(200);
  const frameId = `x-embed-${tweetId}`;

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (typeof e.origin !== 'string' || !e.origin.includes('twitter.com')) return;
      const data = e.data;
      if (!data || typeof data !== 'object') return;
      // Twitter posts { method: 'twttr.private.resize', params: [{ width, height }] }
      // and for newer widgets { 'twttr.embed': { method: 'twttr.private.resize', params: [...] } }
      const payload =
        (data['twttr.embed'] as { method?: string; params?: Array<{ height?: number }> }) ||
        (data as { method?: string; params?: Array<{ height?: number }> });
      if (payload?.method === 'twttr.private.resize' && Array.isArray(payload.params)) {
        const h = payload.params[0]?.height;
        if (typeof h === 'number' && h > 0) setHeight(h);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [tweetId]);

  return (
    <iframe
      id={frameId}
      src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=light&dnt=true`}
      title="X post"
      allowFullScreen
      className="w-full bg-white transition-[height] duration-200"
      style={{ height }}
    />
  );
};

export const ActivityEmbed: FC<{ embed: DetectedEmbed }> = ({ embed }) => {
  const [expanded, setExpanded] = useState(false);
  const { data: preview, isLoading } = useLinkPreview(embed.url, true);

  if (embed.kind === 'youtube' && embed.videoId) {
    const thumb = `https://img.youtube.com/vi/${embed.videoId}/hqdefault.jpg`;
    return (
      <EmbedCard
        embed={embed}
        preview={preview}
        isLoading={isLoading}
        thumbnailUrl={thumb}
        expandable
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        isVideo
        expandedContent={
          <div className="relative w-full bg-black" style={{ aspectRatio: '16 / 9' }}>
            <iframe
              src={`https://www.youtube.com/embed/${embed.videoId}?autoplay=1`}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        }
      />
    );
  }

  if (embed.kind === 'tiktok' && embed.videoId) {
    return (
      <EmbedCard
        embed={embed}
        preview={preview}
        isLoading={isLoading}
        expandable
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        isVideo
        expandedContent={
          <div className="bg-black flex justify-center">
            <iframe
              src={`https://www.tiktok.com/embed/v2/${embed.videoId}`}
              title="TikTok video"
              allow="encrypted-media;"
              allowFullScreen
              style={{ width: 325, height: 575, maxWidth: '100%' }}
            />
          </div>
        }
      />
    );
  }

  if (embed.kind === 'x') {
    const expandable = !!embed.tweetId;
    return (
      <EmbedCard
        embed={embed}
        preview={preview}
        isLoading={isLoading}
        expandable={expandable}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        expandedContent={embed.tweetId ? <XEmbedIframe tweetId={embed.tweetId} /> : null}
      />
    );
  }

  if (embed.kind === 'linkedin') {
    const expandable = !!embed.linkedinUrn;
    return (
      <EmbedCard
        embed={embed}
        preview={preview}
        isLoading={isLoading}
        expandable={expandable}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        expandedContent={
          embed.linkedinUrn ? (
            <iframe
              src={`https://www.linkedin.com/embed/feed/update/urn:li:activity:${embed.linkedinUrn}`}
              title="LinkedIn post"
              allowFullScreen
              className="w-full bg-white"
              style={{ height: 580 }}
            />
          ) : null
        }
      />
    );
  }

  return (
    <EmbedCard
      embed={embed}
      preview={preview}
      isLoading={isLoading}
      expandable={false}
      expanded={false}
      onToggle={() => {}}
    />
  );
};
