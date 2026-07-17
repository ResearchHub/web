'use client';

import { FC, useEffect, useState } from 'react';
import type { DetectedUrl } from '@/utils/url';

/**
 * Self-resizing iframe for an embedded X (Twitter) post. Listens for the
 * postMessage protocol that platform.twitter.com uses to advertise its
 * rendered height so the iframe stops being a fixed-size box and instead
 * hugs its content.
 */
export const XEmbedIframe: FC<{ tweetId: string }> = ({ tweetId }) => {
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

/**
 * The full-fidelity embed body (YouTube/TikTok/X/LinkedIn iframe) for a given
 * detected URL. Returns `null` for URLs that have no expandable form
 * (e.g. generic webpages, or social URLs without an extractable id).
 *
 * Exported so parents can render the same content in their own modal when
 * they need it to outlive the lifecycle of the card itself (see
 * `InlineRichLink` for the canonical example).
 */
export const EmbedExpandedContent: FC<{ embed: DetectedUrl }> = ({ embed }) => {
  if (embed.kind === 'youtube' && embed.videoId) {
    return (
      <div className="relative w-full bg-black" style={{ aspectRatio: '16 / 9' }}>
        <iframe
          src={`https://www.youtube.com/embed/${embed.videoId}?autoplay=1`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }
  if (embed.kind === 'tiktok' && embed.videoId) {
    return (
      <div className="bg-black flex justify-center">
        <iframe
          src={`https://www.tiktok.com/embed/v2/${embed.videoId}`}
          title="TikTok video"
          allow="encrypted-media;"
          allowFullScreen
          style={{ width: 325, height: 575, maxWidth: '100%' }}
        />
      </div>
    );
  }
  if (embed.kind === 'x' && embed.tweetId) {
    // X's embed widget renders at its natural width (~550px) and left-aligns
    // inside whatever iframe contains it, leaving empty space on the right
    // when the iframe is wider (e.g. inside our 2xl modal). Constrain and
    // center the iframe so the tweet card sits in the middle of the surface.
    return (
      <div className="bg-white flex justify-center px-4 py-3">
        <div className="w-full max-w-[550px]">
          <XEmbedIframe tweetId={embed.tweetId} />
        </div>
      </div>
    );
  }
  if (embed.kind === 'linkedin' && embed.linkedinUrn) {
    const urnType = embed.linkedinUrnType ?? 'activity';
    return (
      <iframe
        src={`https://www.linkedin.com/embed/feed/update/urn:li:${urnType}:${embed.linkedinUrn}`}
        title="LinkedIn post"
        allowFullScreen
        className="w-full bg-white"
        style={{ height: 580 }}
      />
    );
  }
  return null;
};

/** Whether a given URL has an interactive (modal-worthy) expanded form. */
export function isEmbedExpandable(embed: DetectedUrl): boolean {
  if (embed.kind === 'youtube') return !!embed.videoId;
  if (embed.kind === 'tiktok') return !!embed.videoId;
  if (embed.kind === 'x') return !!embed.tweetId;
  if (embed.kind === 'linkedin') return !!embed.linkedinUrn;
  return false;
}
