import { createTransformer } from './transformer';
import { transformAuthorProfile } from '@/types/authorProfile';
import { transformApplication } from '@/types/funding';
import { FeedEntry, FeedGrantContent, RawApiFeedEntry } from '@/types/feed';
import type { GrantStatus } from '@/types/grant';
import { transformTopic } from '@/types/topic';
import { stripHtml } from '@/utils/stringUtils';

// Request/Response types for user moderation API
export interface SuspendUserParams {
  authorId: string;
}

export interface ReinstateUserParams {
  author_id: string; // API expects snake_case
}

export interface SuspendUserResponse {
  message: string;
}

// New: Mark user as probable spammer
export interface MarkProbableSpammerParams {
  authorId: string;
}

export interface MarkProbableSpammerResponse {
  message: string;
}

// Raw API response (snake_case from Django backend)
export interface ReinstateUserApiResponse {
  id: number;
  is_active: boolean;
  is_suspended: boolean;
  probable_spammer: boolean;
  suspended_updated_date?: string;
  // Add other relevant user fields as needed
}

// Transformed client model (camelCase)
export interface ReinstateUserResponse {
  id: number;
  isActive: boolean;
  isSuspended: boolean;
  probableSpammer: boolean;
  suspendedUpdatedDate?: Date;
  // Add other relevant user fields as needed
}

// Transformer function
export const transformReinstateUserResponse = createTransformer<
  ReinstateUserApiResponse,
  ReinstateUserResponse
>((raw) => ({
  id: raw.id,
  isActive: raw.is_active,
  isSuspended: raw.is_suspended,
  probableSpammer: raw.probable_spammer,
  suspendedUpdatedDate: raw.suspended_updated_date
    ? new Date(raw.suspended_updated_date)
    : undefined,
}));

export const transformPendingGrantToFeedEntry = (entry: RawApiFeedEntry): FeedEntry => {
  const grant = entry.content_object ?? {};
  const createdBy = transformAuthorProfile(
    grant.created_by?.author_profile || entry.author || grant.created_by
  );
  const authors =
    grant.authors && grant.authors.length > 0
      ? grant.authors.map(transformAuthorProfile)
      : [createdBy];
  const shouldDisplayAsActive =
    grant.status !== 'CLOSED' && grant.status !== 'DECLINED' && !grant.is_expired;

  const content: FeedGrantContent = {
    id: grant.post_id || grant.id,
    unifiedDocumentId: grant.unified_document_id?.toString(),
    contentType: 'GRANT',
    postType: grant.type || 'GRANT',
    createdDate: entry.action_date || grant.created_date || entry.created_date || '',
    textPreview: stripHtml(grant.renderable_text || grant.description || ''),
    slug: grant.slug || '',
    title: stripHtml(grant.title || grant.short_title || ''),
    previewImage: grant.image_url || '',
    authors,
    topics: grant.hub
      ? [
          grant.hub.id
            ? transformTopic(grant.hub)
            : {
                id: 0,
                name: grant.hub.name || '',
                slug: grant.hub.slug || '',
              },
        ]
      : [],
    createdBy,
    category: grant.category ? transformTopic(grant.category) : undefined,
    subcategory: grant.subcategory ? transformTopic(grant.subcategory) : undefined,
    bounties: [],
    reviews: grant.reviews || [],
    grant: {
      id: grant.id,
      amount: {
        usd: grant.amount?.usd || 0,
        rsc: grant.amount?.rsc || 0,
        formatted: grant.amount?.formatted || '',
      },
      organization: grant.organization || '',
      description: grant.description || '',
      status: (grant.status || 'PENDING') as GrantStatus,
      startDate: grant.start_date || '',
      endDate: grant.end_date || '',
      isExpired: grant.is_expired || false,
      isActive: shouldDisplayAsActive,
      currency: grant.currency || 'USD',
      shortTitle: grant.short_title || '',
      createdBy,
      applicants: (grant.applications || []).map(transformApplication),
    },
    organization: grant.organization || '',
    grantAmount: grant.amount || {},
    isExpired: grant.is_expired || false,
  };

  return {
    id: entry.id.toString(),
    recommendationId: entry.recommendation_id,
    timestamp: entry.action_date || grant.created_date || entry.created_date || '',
    action: (entry.action || 'PUBLISH').toLowerCase() as FeedEntry['action'],
    content,
    contentType: 'GRANT',
    riskScore: entry.risk_score,
    hotScoreV2: entry.hot_score_v2,
    hotScoreBreakdown: entry.hot_score_breakdown,
  };
};

// Hook state types
export interface UserModerationState {
  isLoading: boolean;
  error: string | null;
  lastAction: 'suspend' | 'reinstate' | 'flag' | null;
}

// Hook action types
export type SuspendUserAction = (authorId: string) => Promise<void>;
export type ReinstateUserAction = (authorId: string) => Promise<void>;
export type MarkProbableSpammerAction = (authorId: string) => Promise<void>;

export type UserModerationActions = {
  suspendUser: SuspendUserAction;
  reinstateUser: ReinstateUserAction;
  markProbableSpammer: MarkProbableSpammerAction;
};

export type UseUserModerationReturn = [UserModerationState, UserModerationActions];
