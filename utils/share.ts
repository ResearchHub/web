import type { ContentType, Work } from '@/types/work';
import { buildWorkUrl } from '@/utils/url';

/** Content types that get an AI-written draft in the share modal. */
const AI_SHARE_CONTENT_TYPES = new Set<ContentType>(['preregistration', 'funding_request']);

type ShareVisibilityWork = Pick<Work, 'isPublic' | 'moderationStatus'>;
type ShareUrlWork = Pick<Work, 'id' | 'contentType' | 'slug'>;

/**
 * Why a work must not be shared on public social networks. Anonymous crawlers
 * (X, LinkedIn, …) cache the first card they see; a 404 / empty OG on a
 * pending or private page poisons that URL for days.
 */
export function getPublicShareBlockReason(work: ShareVisibilityWork): string | null {
  if (work.moderationStatus === 'PENDING' || work.moderationStatus === 'DECLINED') {
    return 'Available to share after approval';
  }
  if (work.isPublic === false) {
    return "Private proposals can't be shared publicly";
  }
  return null;
}

export function isPubliclyShareable(work: ShareVisibilityWork): boolean {
  return getPublicShareBlockReason(work) === null;
}

export function usesAiSharePost(contentType: ContentType): boolean {
  return AI_SHARE_CONTENT_TYPES.has(contentType);
}

/** Canonical path for a public social share. */
export function buildPublicSharePath(work: ShareUrlWork): string {
  return buildWorkUrl({
    id: work.id,
    contentType: work.contentType,
    slug: work.slug,
  });
}
