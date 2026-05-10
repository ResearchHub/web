import { buildWorkUrl, extractFirstUrl, type DetectedUrl, type UrlKind } from '@/utils/url';
import type { FeedEntry, FeedCommentContent } from '@/types/feed';

// ─────────────────── Domain types ───────────────────

export type StoryKind = 'review' | 'update';

export interface StoryDetails {
  kind: StoryKind;
  author: { id?: number; fullName?: string; profileImage?: string };
  workTitle?: string;
  workImage?: string;
  href?: string;
  actionLabel: string;
  content?: any;
  contentFormat?: any;
  /** review-only */
  score?: number;
  /** update-only */
  embed?: DetectedUrl | null;
}

export type Background =
  | { type: 'image'; url: string; isVideoPreview?: boolean }
  | { type: 'brand'; kind: 'x' | 'linkedin' };

/** Top accent bar color, keyed by story kind. */
export const ACCENT: Record<StoryKind, string> = {
  review: 'bg-amber-400',
  update: 'bg-primary-500',
};

// ─────────────────── Embed kind helpers ───────────────────

export function isPlayable(embed: DetectedUrl | null | undefined): boolean {
  if (!embed) return false;
  if (embed.kind === 'youtube' && embed.videoId) return true;
  if (embed.kind === 'tiktok' && embed.videoId) return true;
  if (embed.kind === 'x' && embed.tweetId) return true;
  if (embed.kind === 'linkedin' && embed.linkedinUrn) return true;
  if (embed.kind === 'webpage') return true;
  return false;
}

export function isVideoKind(kind: UrlKind): boolean {
  return kind === 'youtube' || kind === 'tiktok';
}

/** "External" = clicking opens a new tab rather than playing inline. */
export function isExternalKind(kind: UrlKind): boolean {
  return kind === 'webpage';
}

export function faviconFor(url: string): string | undefined {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
  } catch {
    return undefined;
  }
}

// ─────────────────── Background / thumbnail resolvers ───────────────────

export function resolveBackground(details: StoryDetails): Background | undefined {
  const embed = details.embed;
  if (embed?.kind === 'youtube' && embed.videoId) {
    return {
      type: 'image',
      url: `https://img.youtube.com/vi/${embed.videoId}/hqdefault.jpg`,
      isVideoPreview: true,
    };
  }
  if (details.workImage) {
    return { type: 'image', url: details.workImage };
  }
  if (embed?.kind === 'x') return { type: 'brand', kind: 'x' };
  if (embed?.kind === 'linkedin') return { type: 'brand', kind: 'linkedin' };
  return undefined;
}

export function resolveEmbedThumb(
  embed: DetectedUrl,
  preview: { image?: string } | null
): string | null {
  if (embed.kind === 'youtube' && embed.videoId) {
    return `https://img.youtube.com/vi/${embed.videoId}/hqdefault.jpg`;
  }
  // LinkedIn previews tend to return generic images — prefer brand bg.
  if (embed.kind === 'linkedin') return null;
  return preview?.image ?? null;
}

// ─────────────────── Transformers ───────────────────

/**
 * Maps a FeedEntry into the view-model used by the story cards.
 * Returns null for entries that aren't peer reviews or author updates.
 */
export function transformStoryDetails(entry: FeedEntry): StoryDetails | null {
  if (entry.contentType !== 'COMMENT') return null;
  const c = entry.content as FeedCommentContent;
  const ct = c.comment?.commentType;
  if (ct !== 'REVIEW' && ct !== 'AUTHOR_UPDATE') return null;

  const author = entry.content.createdBy;
  const work = entry.relatedWork;
  const href = work
    ? buildWorkUrl({
        id: work.id,
        slug: work.slug,
        contentType: work.contentType,
        tab: ct === 'REVIEW' ? 'reviews' : undefined,
      })
    : undefined;

  if (ct === 'REVIEW') {
    return {
      kind: 'review',
      author,
      score: c.review?.score ?? c.comment?.reviewScore,
      content: c.comment?.content,
      contentFormat: c.comment?.contentFormat,
      workTitle: work?.title,
      workImage: work?.image,
      href,
      actionLabel: 'peer reviewed',
    };
  }

  // AUTHOR_UPDATE
  const text =
    typeof c.comment?.content === 'string'
      ? c.comment.content
      : JSON.stringify(c.comment?.content || '');
  return {
    kind: 'update',
    author,
    content: c.comment?.content,
    contentFormat: c.comment?.contentFormat,
    embed: extractFirstUrl(text),
    workTitle: work?.title,
    workImage: work?.image,
    href,
    actionLabel: 'posted an update',
  };
}
