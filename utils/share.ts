import type { ContentType, Work } from '@/types/work';
import { buildRegisteredReportUrl } from '@/utils/registeredReportRoute';
import { buildWorkUrl } from '@/utils/url';

/** Content types that get an AI-written draft in the share modal. */
const AI_SHARE_CONTENT_TYPES = new Set<ContentType>(['preregistration', 'funding_request']);

type ShareVisibilityWork = Pick<Work, 'isPublic' | 'moderationStatus' | 'note' | 'grantSummary'>;
type ShareUrlWork = Pick<Work, 'id' | 'contentType' | 'slug' | 'postType'>;

const AWAITING_APPROVAL = 'Available to share after approval';

function isBlockedModerationStatus(status: string | undefined | null): boolean {
  return status === 'PENDING' || status === 'DECLINED';
}

/**
 * Why a work must not be shared on public social networks. Anonymous crawlers
 * (X, LinkedIn, …) cache the first card they see; a 404 / empty OG on a
 * pending or private page poisons that URL for days.
 *
 * Proposals use `work.moderationStatus`. RFPs keep the post APPROVED and put
 * pending/declined on `grant.status` instead (`work.grantSummary` or
 * `work.note.post.grant`, depending on the payload).
 */
export function getPublicShareBlockReason(work: ShareVisibilityWork): string | null {
  if (isBlockedModerationStatus(work.moderationStatus)) {
    return AWAITING_APPROVAL;
  }

  const grantStatus = work.grantSummary?.status ?? work.note?.post?.grant?.status;
  if (isBlockedModerationStatus(grantStatus)) {
    return AWAITING_APPROVAL;
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
  if (work.postType === 'REGISTERED_REPORT') {
    return buildRegisteredReportUrl(work.id, work.slug);
  }

  return buildWorkUrl({
    id: work.id,
    contentType: work.postType === 'QUESTION' ? 'question' : work.contentType,
    slug: work.slug,
  });
}
