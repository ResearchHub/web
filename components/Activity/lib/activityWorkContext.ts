import { buildWorkUrl } from '@/utils/url';
import type { ContentType } from '@/types/work';
import type {
  ActivityContext,
  FeedBountyContent,
  FeedCommentContent,
  FeedEntry,
} from '@/types/feed';
import type { Bounty } from '@/types/bounty';
import type { Fundraise } from '@/types/funding';
import type { AuthorProfile } from '@/types/authorProfile';
import type { WorkGrantSummary } from '@/types/work';

export type ActivityBodySlot = 'fundraise' | 'bounty' | 'grant' | 'default';

export interface ActivityWorkContext {
  id: number;
  slug: string;
  title: string;
  href: string;
  imageUrl?: string;
  documentType: ContentType;
  fundraise?: Fundraise;
  grant?: WorkGrantSummary;
  bounty?: Bounty;
  authors?: AuthorProfile[];
  tab?: 'reviews' | 'bounties' | 'conversation';
}

export function getActivityBounty(entry: FeedEntry): Bounty | undefined {
  if (entry.contentType === 'COMMENT') {
    return (entry.content as FeedCommentContent).bounties?.[0];
  }
  if (entry.contentType === 'BOUNTY') {
    return (entry.content as FeedBountyContent).bounty;
  }
  return undefined;
}

function resolveTabFromContext(activityContext?: ActivityContext): ActivityWorkContext['tab'] {
  switch (activityContext) {
    case 'tip_review':
    case 'peer_review_published':
      return 'reviews';
    case 'bounty_opened':
    case 'bounty_contributed':
    case 'bounty_payout':
      return 'bounties';
    case 'comment_published':
      return 'conversation';
    default:
      return undefined;
  }
}

export function resolveActivityBodySlot(
  activityContext?: ActivityContext,
  work?: Pick<ActivityWorkContext, 'fundraise' | 'grant' | 'bounty'>,
  options?: { isReview?: boolean }
): ActivityBodySlot {
  if (activityContext === 'bounty_opened' || activityContext === 'bounty_contributed') {
    return 'bounty';
  }
  if (activityContext === 'grant_opened') {
    return 'grant';
  }
  if (
    activityContext === 'tip_review' ||
    activityContext === 'bounty_payout' ||
    activityContext === 'fundraise_contribution' ||
    activityContext === 'proposal_submitted'
  ) {
    if (work?.fundraise) return 'fundraise';
    return 'default';
  }
  if (activityContext === 'peer_review_published' || options?.isReview) {
    if (work?.fundraise) return 'fundraise';
    return 'default';
  }
  if (activityContext === 'comment_published' && work?.fundraise) {
    return 'fundraise';
  }
  return 'default';
}

export function shouldShowActivityComment(
  slot: ActivityBodySlot,
  commentPreview: { isReview: boolean } | null
): boolean {
  return Boolean(commentPreview) && slot !== 'bounty' && slot !== 'grant';
}

export function getActivityWorkContext(entry: FeedEntry): ActivityWorkContext | null {
  const related = entry.relatedWork;
  if (!related?.title) return null;

  const tab = resolveTabFromContext(entry.activityContext);
  const documentType = related.contentType;
  const href = buildWorkUrl({
    id: related.id,
    slug: related.slug,
    contentType: documentType,
    tab,
  });

  return {
    id: related.id,
    slug: related.slug,
    title: related.title,
    href,
    imageUrl: related.image,
    documentType,
    fundraise: related.fundraise,
    grant: related.grantSummary,
    bounty: getActivityBounty(entry),
    authors: related.authors?.map((authorship) => authorship.authorProfile),
    tab,
  };
}
