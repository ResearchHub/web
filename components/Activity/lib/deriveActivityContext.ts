import type { ActivityContext, RawApiFeedEntry } from '@/types/feed';

const REVIEW_COMMENT_TYPES = new Set(['PEER_REVIEW', 'REVIEW']);

export function deriveActivityContext(feedEntry: RawApiFeedEntry): ActivityContext | undefined {
  const contentType = feedEntry.content_type?.toUpperCase();
  const obj = feedEntry.content_object;
  if (!contentType || !obj) return undefined;

  switch (contentType) {
    case 'RHCOMMENTMODEL': {
      const commentType = obj.comment_type as string | undefined;
      if (commentType && REVIEW_COMMENT_TYPES.has(commentType)) {
        return 'peer_review_published';
      }
      if (Array.isArray(obj.bounties) && obj.bounties.length > 0) {
        return 'bounty_opened';
      }
      return 'comment_published';
    }
    case 'RESEARCHHUBPOST': {
      if (obj.type === 'GRANT') return 'grant_opened';
      if (obj.type === 'PREREGISTRATION') return 'proposal_submitted';
      return undefined;
    }
    case 'PURCHASE':
    case 'USDFUNDRAISECONTRIBUTION':
      return 'fundraise_contribution';
    case 'FUNDINGACTIVITY': {
      const sourceType = obj.source_type as string | undefined;
      if (sourceType === 'BOUNTY_PAYOUT') return 'bounty_payout';
      if (sourceType === 'TIP_REVIEW') return 'tip_review';
      return undefined;
    }
    case 'BOUNTY':
      return 'bounty_contributed';
    default:
      return undefined;
  }
}
