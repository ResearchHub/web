import { AuthorProfile, transformAuthorProfile } from './authorProfile';
import { ContentMetrics } from './metrics';
import { Topic, transformTopic } from './topic';
import { createTransformer, BaseTransformed } from './transformer';
import { Work, transformPaper, transformPost, FundingRequest, ContentType } from './work';
import { Bounty, BountyWithComment, transformBounty } from './bounty';
import { Comment, CommentType, ContentFormat, transformComment } from './comment';
import { Fundraise, transformFundraise } from './funding';
import { Journal } from './journal';
import { UserVoteType } from './reaction';
import { User } from './user';
import { stripHtml } from '@/utils/stringUtils';
import { Tip } from './tip';

export type FeedActionType = 'contribute' | 'open' | 'publish' | 'post';

// Re-export FundingRequest for backward compatibility
export type { FundingRequest };

// Simplified structure for parent comment preview - now recursive
export interface ParentCommentPreview {
  id: number;
  content: any;
  contentFormat?: ContentFormat;
  createdBy: AuthorProfile;
  parentComment?: ParentCommentPreview | undefined; // Add recursive field
}

// Recursive helper function to transform nested parent comments
const transformNestedParentComment = (rawParent: any): ParentCommentPreview | undefined => {
  if (!rawParent) {
    return undefined;
  }

  try {
    const createdBy = rawParent.author
      ? transformAuthorProfile(rawParent.author)
      : {
          id: 0,
          fullName: 'Unknown User',
          firstName: '',
          lastName: '',
          profileImage: '',
          headline: '',
          profileUrl: '/author/0',
          isClaimed: false,
          isVerified: false,
        };

    return {
      id: rawParent.id,
      content: rawParent.comment_content_json,
      contentFormat: rawParent.comment_content_type,
      createdBy: createdBy,
      // Recursively transform the next parent level
      parentComment: transformNestedParentComment(rawParent.parent_comment),
    };
  } catch (error) {
    console.error('Error transforming nested parent comment:', error, rawParent);
    return undefined; // Return undefined on error to prevent breaking the chain
  }
};

// First, let's add a Review interface
export interface Review {
  id: number;
  score: number;
  author: AuthorProfile;
}

// Create a base interface for all feed content types
export interface BaseFeedContent {
  id: number;
  contentType: string;
  createdDate: string;
  createdBy: AuthorProfile;
  bounties?: BountyWithComment[];
  reviews?: Review[];
  unifiedDocumentId?: string;
}

// Update all feed content types to extend the base
export interface FeedPostContent extends BaseFeedContent {
  contentType: 'PREREGISTRATION' | 'POST';
  postType?: string; // The actual type from content_object.type
  fundraise?: Fundraise;
  textPreview: string;
  slug: string;
  title: string;
  previewImage?: string;
  authors: AuthorProfile[];
  topics: Topic[];
  category?: Topic;
  subcategory?: Topic;
  institution?: string;
}

export interface ApplicationDetails {
  authors: AuthorProfile[];
  institution?: string;
  objectiveAlignment: string; // "Why will your proposal address funder's objectives?"
}

export interface FeedApplicationContent extends BaseFeedContent {
  contentType: 'APPLICATION';
  applicationDetails: ApplicationDetails;
  preregistration: FeedPostContent;
}

export interface FeedBountyContent extends BaseFeedContent {
  contentType: 'BOUNTY';
  bounty: Bounty;
  relatedDocumentId?: number;
  relatedDocumentContentType?: ContentType;
  comment: {
    content: any;
    contentFormat: ContentFormat;
    commentType: CommentType;
    id: number;
  };
}

export interface FeedCommentContent extends BaseFeedContent {
  contentType: 'COMMENT';
  updatedDate?: string;
  comment: {
    id: number;
    content: any;
    contentFormat: ContentFormat;
    commentType: CommentType;
    score: number;
    reviewScore?: number;
    thread?: {
      id: number;
      threadType: string;
      objectId: number;
    };
  };
  isRemoved?: boolean;
  relatedDocumentId?: number | string;
  relatedDocumentContentType?: ContentType;
  review?: {
    score: number;
  };
  parentComment?: ParentCommentPreview;
}

export interface FeedPaperContent extends BaseFeedContent {
  contentType: 'PAPER';
  previewImage?: string;
  textPreview: string;
  slug: string;
  title: string;
  authors: AuthorProfile[];
  topics: Topic[];
  journal: Journal;
  category?: Topic;
  subcategory?: Topic;
  workType?: 'paper' | 'preprint' | 'published';
}

export interface FeedGrantContent extends BaseFeedContent {
  contentType: 'GRANT';
  postType?: string; // The actual type from content_object.type
  textPreview: string;
  slug: string;
  title: string;
  previewImage?: string;
  authors: AuthorProfile[];
  topics: Topic[];
  category?: Topic;
  subcategory?: Topic;
  grant: {
    id: number;
    amount: {
      usd: number;
      rsc: number;
      formatted: string;
    };
    organization: string;
    description: string;
    status: 'OPEN' | 'CLOSED';
    startDate: string;
    endDate: string;
    isExpired: boolean;
    isActive: boolean;
    currency: string;
    createdBy: any;
    applicants: AuthorProfile[];
  };
  organization?: string;
  grantAmount?: {
    amount: number;
    currency: string;
    formatted: string;
  };
  isExpired?: boolean;
}

// Update the Content union type to include the base interface
export type Content =
  | FeedPostContent
  | FeedPaperContent
  | FeedBountyContent
  | FeedCommentContent
  | FeedApplicationContent
  | FeedGrantContent;

export type FeedContentType =
  | 'PAPER'
  | 'POST'
  | 'PREREGISTRATION'
  | 'BOUNTY'
  | 'COMMENT'
  | 'APPLICATION'
  | 'GRANT';

export interface ExternalMetrics {
  score: number;
  lastUpdated: string;
  blueskyCount: number;
  twitterCount: number;
  facebookCount: number;
}

export interface HotScoreBreakdown {
  steps: string[];
  signals: {
    [key: string]: {
      raw: number;
      weight: number;
      component: number;
      urgent?: boolean;
      urgency_multiplier?: number;
    };
  };
  equation: string;
  calculation: {
    raw_score: number;
    final_score: number;
    engagement_score: number;
    time_denominator: number;
    adjusted_engagement: number;
  };
  time_factors: {
    gravity: number;
    age_hours: number;
    base_hours: number;
    freshness_multiplier: number;
  };
  config_snapshot: {
    gravity: number;
    base_hours: number;
    signal_weights: {
      [key: string]: number;
    };
  };
}

export interface FeedEntry {
  id: string;
  recommendationId: string | null;
  timestamp: string;
  action: FeedActionType;
  content: Content;
  contentType: FeedContentType; // New field to easily identify the type of content
  metrics?: ContentMetrics;
  relatedWork?: Work;
  tips?: Tip[];
  raw?: RawApiFeedEntry;
  userVote?: UserVoteType;
  awardedBountyAmount?: number;
  hotScoreV2?: number;
  hotScoreBreakdown?: HotScoreBreakdown;
  externalMetrics?: ExternalMetrics;
  searchMetadata?: {
    highlightedTitle?: string;
    highlightedSnippet?: string;
    matchedField?: string;
  };
}

export interface RawApiFeedEntry {
  id: number;
  recommendation_id: string | null;
  content_type: string;
  content_object: any;
  created_date: string;
  action: string;
  action_date: string;
  is_nonprofit?: boolean;
  hot_score_v2?: number;
  hot_score_breakdown?: {
    steps: string[];
    signals: {
      [key: string]: {
        raw: number;
        weight: number;
        component: number;
        urgent?: boolean;
        urgency_multiplier?: number;
      };
    };
    equation: string;
    calculation: {
      raw_score: number;
      final_score: number;
      engagement_score: number;
      time_denominator: number;
      adjusted_engagement: number;
    };
    time_factors: {
      gravity: number;
      age_hours: number;
      base_hours: number;
      freshness_multiplier: number;
    };
    config_snapshot: {
      gravity: number;
      base_hours: number;
      signal_weights: {
        [key: string]: number;
      };
    };
  };
  external_metadata?: {
    metrics: {
      score: number;
      altmetric_id: number;
      last_updated: string;
      bluesky_count: number;
      twitter_count: number;
      facebook_count: number;
    };
  };
  user_vote?: {
    id: number;
    content_type: number;
    created_by: number;
    created_date: string;
    vote_type: number;
    item: number;
  };
  metrics?: {
    votes: number;
    comments?: number;
    replies?: number;
    review_metrics?: {
      avg: number;
      count: number;
    };
  };
  author: {
    id: number;
    first_name: string;
    last_name: string;
    description?: string;
    headline?: string;
    profile_image: string;
    user?: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      is_verified: boolean;
    };
  };
}

export interface FeedApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawApiFeedEntry[];
}

/**
 * Safely extracts the unified document ID from a content object.
 *
 * Tries in this order:
 * 1. content_object.unified_document_id
 * 2. content_object.unified_document.id
 *
 * Returns undefined if neither is available or if any intermediate property is null/undefined.
 *
 * @param content_object - The content object from the API response
 * @returns The unified document ID as a string, or undefined if not available
 */
export function getUnifiedDocumentId(content_object: any): string | undefined {
  // First try: direct unified_document_id property
  if (content_object?.unified_document_id != null) {
    return content_object.unified_document_id.toString();
  }

  // Second try: extract from unified_document.id
  if (content_object?.unified_document?.id != null) {
    return content_object.unified_document.id.toString();
  }

  return undefined;
}

export type TransformedContent = Content & BaseTransformed;
export type TransformedFeedEntry = FeedEntry & BaseTransformed;

// Updated transformFeedEntry function to use the simplified Content type
export const transformFeedEntry = (feedEntry: RawApiFeedEntry): FeedEntry => {
  if (!feedEntry) {
    throw new Error('Feed entry is undefined');
  }

  const {
    id,
    content_type,
    content_object,
    created_date,
    action,
    action_date,
    author,
    hot_score_v2,
    hot_score_breakdown,
    external_metadata,
    recommendation_id,
  } = feedEntry;

  // Base feed entry properties
  const baseFeedEntry: Partial<FeedEntry> = {
    id: id.toString(),
    recommendationId: recommendation_id,
    timestamp: action_date,
    action: action.toLowerCase() as FeedActionType,
  };

  // Pre-process metrics to ensure consistent format
  const processedMetrics = feedEntry.metrics
    ? {
        votes: feedEntry.metrics.votes || 0,
        comments:
          feedEntry.metrics.comments !== undefined
            ? feedEntry.metrics.comments
            : feedEntry.metrics.replies || 0,
        review_metrics: feedEntry.metrics.review_metrics,
      }
    : undefined;

  // Transform the content based on content_type
  let content: Content;
  let relatedWork: Work | undefined;
  let contentType: FeedContentType;

  switch (content_type.toUpperCase()) {
    case 'BOUNTY':
      contentType = 'BOUNTY';
      // For bounties, use the transformBounty function
      try {
        // Check if required fields exist
        if (!content_object) {
          console.error('Bounty content_object is missing');
          throw new Error('Bounty content_object is missing');
        }

        // Transform the bounty using the transformBounty function with proper error handling
        const bounty = transformBounty({
          created_by: author || null,
          ...content_object,
        });

        // If the bounty has a paper, transform it to a Work and set as relatedWork
        const relatedDocumentId = content_object.paper?.id || content_object.post?.id || undefined;
        const relatedDocumentContentType = content_object.paper
          ? 'paper'
          : content_object.post
            ? 'post'
            : undefined;

        if (content_object.paper) {
          try {
            relatedWork = transformPaper(content_object.paper);
          } catch (paperError) {
            console.error('Error transforming paper for bounty:', paperError);
          }
        } else if (content_object.post) {
          try {
            relatedWork = transformPost(content_object.post);
          } catch (postError) {
            console.error('Error transforming post for bounty:', postError);
          }
        }

        // Create a FeedBountyEntry object
        const bountyEntry: FeedBountyContent = {
          id: content_object.id,
          unifiedDocumentId: getUnifiedDocumentId(content_object),
          contentType: 'BOUNTY',
          createdDate: content_object.created_date || created_date,
          bounty: bounty,
          createdBy: transformAuthorProfile(author),
          relatedDocumentId,
          relatedDocumentContentType,
          comment: {
            content: content_object?.comment?.comment_content_json,
            contentFormat: content_object?.comment?.comment_content_type as ContentFormat,
            commentType: content_object?.comment?.comment_type as CommentType,
            id: content_object?.comment?.id,
          },
        };

        content = bountyEntry;
      } catch (error) {
        console.error('Error transforming bounty:', error);
        throw new Error(`Failed to transform bounty: ${error}`);
      }
      break;

    case 'PAPER':
      contentType = 'PAPER';
      // For papers, use the transformPaper function
      try {
        // Create a FeedPaperEntry object directly
        const paperEntry: FeedPaperContent = {
          id: content_object.id,
          unifiedDocumentId: getUnifiedDocumentId(content_object),
          contentType: 'PAPER',
          createdDate: content_object.created_date,
          textPreview: stripHtml(content_object.abstract || ''),
          slug: content_object.slug || '',
          title: stripHtml(content_object.title || ''),
          previewImage: content_object.primary_image,
          authors:
            content_object.authors && content_object.authors.length > 0
              ? content_object.authors.map(transformAuthorProfile)
              : content_object.raw_authors && content_object.raw_authors.length > 0
                ? content_object.raw_authors.map((author: any) => ({
                    id: 0, // We don't have a real ID for raw authors
                    fullName: `${author.first_name || ''} ${author.last_name || ''}`.trim(),
                    profileImage: '',
                    headline: '',
                    profileUrl: '/author/0',
                    isClaimed: false,
                  }))
                : [],
          workType:
            content_object.workType ||
            (content_object.journal?.status === 'preprint' ? 'preprint' : 'published'),
          topics: content_object.hub
            ? [
                content_object.hub.id
                  ? transformTopic(content_object.hub)
                  : {
                      id: 0,
                      name: content_object.hub.name || '',
                      slug: content_object.hub.slug || '',
                    },
              ]
            : [],
          createdBy: content_object.authors?.[0]
            ? transformAuthorProfile(content_object.authors[0])
            : Array.isArray(content_object.raw_authors) && content_object.raw_authors.length > 0
              ? {
                  id: 0,
                  fullName:
                    `${content_object.raw_authors[0].first_name || ''} ${content_object.raw_authors[0].last_name || ''}`.trim(),
                  firstName: content_object.raw_authors[0].first_name || '',
                  lastName: content_object.raw_authors[0].last_name || '',
                  profileImage: '',
                  headline: '',
                  profileUrl: '/author/0',
                  isClaimed: false,
                  isVerified: false,
                }
              : {
                  id: 0,
                  fullName: 'Unknown Author',
                  firstName: '',
                  lastName: '',
                  profileImage: '',
                  headline: '',
                  profileUrl: '/author/0',
                  isClaimed: false,
                  isVerified: false,
                },
          journal: content_object.journal || {
            id: 0,
            name: '',
            slug: '',
            image: null,
            description: '',
          },
          category: content_object.category
            ? content_object.category.id
              ? transformTopic(content_object.category)
              : {
                  id: content_object.category.id || 0,
                  name: content_object.category.name || '',
                  slug: content_object.category.slug || '',
                }
            : undefined,
          subcategory: content_object.subcategory
            ? content_object.subcategory.id
              ? transformTopic(content_object.subcategory)
              : {
                  id: content_object.subcategory.id || 0,
                  name: content_object.subcategory.name || '',
                  slug: content_object.subcategory.slug || '',
                }
            : undefined,
          bounties: Array.isArray(content_object.bounties)
            ? content_object.bounties.map((bounty: any) =>
                transformBounty(bounty, { ignoreBaseAmount: true })
              )
            : [],
          reviews: content_object.reviews
            ? content_object.reviews.map((review: any) => ({
                id: review.id,
                score: review.score,
                author: transformAuthorProfile(review.author),
              }))
            : [],
        };

        content = paperEntry;
      } catch (error) {
        console.error('Error transforming paper:', error);
        throw new Error(`Failed to transform paper: ${error}`);
      }
      break;

    case 'RHCOMMENTMODEL':
      contentType = 'COMMENT';
      // For comments, use the transformComment function
      try {
        // Prepare the comment data for transformation
        const commentData: any = {
          id: content_object.id,
          comment_content_json: content_object.comment_content_json,
          comment_content_type: content_object.comment_content_type,
          comment_type: content_object.comment_type,
          created_date: content_object.created_date || created_date,
          updated_date: content_object.updated_date || created_date,
          created_by: author || content_object.author,
          score: content_object.score || 0,
          children_count: content_object.children_count || 0,
          reply_count: content_object.reply_count || 0,
          children: content_object.children || [],
          replies: content_object.replies || [],
          parent_id: content_object.parent_id,
          thread: content_object.thread_id
            ? {
                id: content_object.thread_id,
                thread_type: content_object.document_type || 'PAPER',
                privacy_type: 'PUBLIC',
                object_id: content_object.object_id || content_object.id,
              }
            : null,
          is_public: true,
          is_removed: false,
          metadata: content_object.metadata || {},
          review: content_object.review || null,
          user_vote: feedEntry.user_vote || null,
          unified_document_id: getUnifiedDocumentId(content_object),
          bounty_amount: content_object.bounty_amount,
        };

        // Check if the comment is associated with a paper or post for related work
        const relatedDocumentId = content_object.paper?.id || content_object.post?.id || undefined;
        const relatedDocumentContentType = content_object.paper
          ? 'paper'
          : content_object.post
            ? 'post'
            : undefined;

        // Transform the comment to get score and other properties
        const transformedComment = transformComment(commentData);

        // Create a FeedCommentContent object
        const commentContent: FeedCommentContent = {
          id: content_object.id,
          unifiedDocumentId: getUnifiedDocumentId(content_object),
          contentType: 'COMMENT',
          createdDate: content_object.created_date || created_date,
          updatedDate: content_object.updated_date || created_date,
          createdBy: transformAuthorProfile(author || content_object.author),
          isRemoved: content_object.is_removed,
          comment: {
            id: content_object.id,
            content: content_object.comment_content_json,
            contentFormat: (content_object.comment_content_type as ContentFormat) || 'QUILL_EDITOR',
            commentType: content_object.comment_type as CommentType,
            score: transformedComment.score || 0,
            reviewScore: transformedComment.reviewScore || 0,
            thread: content_object.thread_id
              ? {
                  id: content_object.thread_id,
                  threadType: content_object.document_type || 'PAPER',
                  objectId: content_object.object_id || content_object.id,
                }
              : undefined,
          },
          relatedDocumentId:
            relatedDocumentId || content_object.object_id || content_object.thread_id,
          relatedDocumentContentType:
            relatedDocumentContentType || (content_object.document_type as ContentType),
        };

        // Add review data if available
        if (content_object.review) {
          commentContent.review = {
            score: content_object.review.score || 0,
          };
        }

        // Transform and add parent comment if it exists, using the recursive helper
        if (content_object.parent_comment) {
          commentContent.parentComment = transformNestedParentComment(
            content_object.parent_comment
          );
        }

        content = commentContent;

        // If the comment is associated with a paper or post, transform it to a Work and set as relatedWork
        if (content_object.paper) {
          try {
            relatedWork = transformPaper(content_object.paper);
          } catch (paperError) {
            console.error('Error transforming paper for comment:', paperError);
          }
        } else if (content_object.post) {
          try {
            relatedWork = transformPost(content_object.post);
          } catch (postError) {
            console.error('Error transforming post for comment:', postError);
          }
        }
      } catch (error) {
        console.error('Error transforming comment:', error);
        throw new Error(`Failed to transform comment: ${error}`);
      }
      break;

    case 'RESEARCHHUBPOST':
      // Check if it's a grant
      if (content_object.type === 'GRANT' && content_object?.grant) {
        // Add this new case for GRANT content
        contentType = 'GRANT';
        try {
          const grantEntry: FeedGrantContent = {
            id: content_object.id,
            unifiedDocumentId: getUnifiedDocumentId(content_object),
            contentType: 'GRANT',
            postType: content_object.type, // Add the actual type from content_object
            createdDate: content_object.created_date,
            textPreview: content_object.renderable_text || '',
            slug: content_object.slug || '',
            title: stripHtml(content_object.title || ''),
            previewImage: content_object.image_url || '',
            authors:
              content_object.authors && content_object.authors.length > 0
                ? content_object.authors.map(transformAuthorProfile)
                : [transformAuthorProfile(author)],
            topics: [Array.isArray(content_object.hub) || content_object.hub].map(transformTopic),
            createdBy: transformAuthorProfile(author),
            category: content_object.category ? transformTopic(content_object.category) : undefined,
            subcategory: content_object.subcategory
              ? transformTopic(content_object.subcategory)
              : undefined,
            bounties: content_object.bounties
              ? content_object.bounties.map((bounty: any) =>
                  transformBounty(bounty, { ignoreBaseAmount: true })
                )
              : [],
            reviews: content_object.reviews || [],
            grant: {
              id: content_object.grant.id,
              amount: content_object.grant.amount,
              organization: content_object.grant.organization,
              description: content_object.grant.description,
              status: content_object.grant.status,
              startDate: content_object.grant.start_date,
              endDate: content_object.grant.end_date,
              isExpired: content_object.grant.is_expired,
              isActive: content_object.grant.is_active,
              currency: content_object.grant.currency,
              createdBy: content_object.grant.created_by,
              applicants: (content_object.grant.applications || [])
                .map((application: any) => application.applicant)
                .map(transformAuthorProfile),
            },
            organization: content_object.grant.organization || '',
            grantAmount: content_object.grant.amount || {},
            isExpired: content_object.grant.is_expired || false,
          };
          content = grantEntry;
        } catch (error) {
          console.error('Error transforming grant content:', error);
          throw error;
        }
      } else {
        // Handle regular RESEARCHHUBPOST content
        contentType = 'POST';
        // For RESEARCHHUBPOST, map directly to FeedPostEntry
        try {
          // Extract the necessary data from content_object
          const isPreregistration = content_object.type === 'PREREGISTRATION';

          if (isPreregistration) {
            contentType = 'PREREGISTRATION';
          }

          // Create a FeedPostEntry object
          const postEntry: FeedPostContent = {
            id: content_object.id,
            unifiedDocumentId: getUnifiedDocumentId(content_object),
            contentType: isPreregistration ? 'PREREGISTRATION' : 'POST',
            postType: content_object.type, // Add the actual type from content_object
            createdDate: content_object.created_date,
            textPreview: content_object.renderable_text || '',
            slug: content_object.slug || '',
            title: stripHtml(content_object.title || ''),
            previewImage: content_object.image_url || '',
            authors:
              content_object.authors && content_object.authors.length > 0
                ? content_object.authors.map(transformAuthorProfile)
                : [transformAuthorProfile(author)],
            institution: content_object.institution, // Populate institution
            topics: content_object.hub
              ? [
                  content_object.hub.id
                    ? transformTopic(content_object.hub)
                    : {
                        id: 0,
                        name: content_object.hub.name || '',
                        slug: content_object.hub.slug || '',
                      },
                ]
              : [],
            createdBy: transformAuthorProfile(author),
            category: content_object.category ? transformTopic(content_object.category) : undefined,
            subcategory: content_object.subcategory
              ? transformTopic(content_object.subcategory)
              : undefined,
            bounties: content_object.bounties
              ? content_object.bounties.map((bounty: any) =>
                  transformBounty(bounty, { ignoreBaseAmount: true })
                )
              : [],
            reviews: content_object.reviews
              ? content_object.reviews.map((review: any) => ({
                  id: review.id,
                  score: review.score,
                  author: transformAuthorProfile(review.author),
                }))
              : [],
          };

          // Add fundraise data if it's a PREREGISTRATION and has fundraise data
          if (isPreregistration && content_object.fundraise) {
            try {
              postEntry.fundraise = transformFundraise(content_object.fundraise);
            } catch (fundraiseError) {
              console.error('Error transforming fundraise for proposal:', fundraiseError);
            }
          }

          content = postEntry;
        } catch (error) {
          console.error('Error transforming RESEARCHHUBPOST:', error);
          throw new Error(`Failed to transform RESEARCHHUBPOST: ${error}`);
        }
      }
      break;

    default:
      // For unsupported types, try to transform to a Work
      console.warn(
        `Unsupported content type: ${content_type}, attempting to transform as generic work`
      );
      contentType = 'POST'; // Default to POST for unknown types
      try {
        // Create a FeedPostEntry object
        const postEntry: FeedPostContent = {
          id: content_object.id || id,
          unifiedDocumentId: getUnifiedDocumentId(content_object),
          contentType: 'POST',
          createdDate: created_date,
          textPreview: content_object.renderable_text || '',
          slug: content_object.slug || `${content_type.toLowerCase()}/${content_object.id || id}`,
          title: stripHtml(content_object.title || `${content_type} #${content_object.id || id}`),
          authors:
            content_object.authors && content_object.authors.length > 0
              ? content_object.authors.map(transformAuthorProfile)
              : [transformAuthorProfile(author)],
          institution: content_object.institution, // Populate institution
          topics: content_object.hub
            ? [
                content_object.hub.id
                  ? transformTopic(content_object.hub)
                  : {
                      id: 0,
                      name: content_object.hub.name || '',
                      slug: content_object.hub.slug || '',
                    },
              ]
            : [],
          createdBy: transformAuthorProfile(author),
        };
        content = postEntry;
      } catch (error) {
        console.error(`Error transforming ${content_type}:`, error);
        throw new Error(`Failed to transform ${content_type}: ${error}`);
      }
  }

  // Complete the feed entry
  return {
    ...baseFeedEntry,
    content,
    relatedWork,
    contentType,
    hotScoreV2: hot_score_v2,
    hotScoreBreakdown: hot_score_breakdown,
    externalMetrics: external_metadata?.metrics
      ? {
          score: external_metadata.metrics.score,
          lastUpdated: external_metadata.metrics.last_updated,
          blueskyCount: external_metadata.metrics.bluesky_count,
          twitterCount: external_metadata.metrics.twitter_count,
          facebookCount: external_metadata.metrics.facebook_count,
        }
      : undefined,
    metrics: processedMetrics
      ? {
          votes: processedMetrics.votes || 0,
          comments: processedMetrics.comments || 0,
          saves: 0, // Default value for saves
          reviewScore: getReviewScore(processedMetrics, contentType, content),
        }
      : undefined,
    raw: feedEntry,
    userVote:
      feedEntry.user_vote?.vote_type === 1
        ? 'UPVOTE'
        : feedEntry.user_vote?.vote_type === 0
          ? 'NEUTRAL'
          : undefined,
    tips: [], // Default empty tips
    awardedBountyAmount: (content as any)?.awardedBountyAmount,
  } as FeedEntry;
};

/**
 * Helper function to get review score from various sources
 */
function getReviewScore(
  metrics: RawApiFeedEntry['metrics'] | undefined,
  contentType: FeedContentType,
  content: Content
): number {
  // First check if we have review_metrics from the API
  if (metrics?.review_metrics?.avg) {
    return metrics.review_metrics.avg;
  }

  // For REVIEW comments, use the review score if available
  const commentContent = content as FeedCommentContent;
  if (
    contentType === 'COMMENT' &&
    commentContent?.comment?.commentType === 'REVIEW' &&
    commentContent?.review?.score !== undefined
  ) {
    return commentContent.review.score;
  }

  // Default to 0 if no review score is found
  return 0;
}

/**
 * Transforms a Comment object into a FeedEntry that can be used with FeedItemComment component
 * @param comment The Comment object to transform
 * @param contentType The content type of the related document (paper, post, etc.)
 * @param relatedDocument Optional related work (paper or post) to include with the comment
 * @returns A FeedEntry object with the comment as content
 */
export const transformCommentToFeedItem = (
  comment: Comment,
  contentType: ContentType,
  relatedDocument?: Work
): FeedEntry => {
  // The structure of the createdBy property needs to include user as a sub-property and authorProfile on higher level to
  // be compatible with the rest of the feed items.
  const createdByAuthorProfile = {
    ...comment.createdBy.authorProfile,
    user: { ...comment.createdBy },
  };

  // Create a FeedCommentContent object from the comment
  const commentContent: FeedCommentContent = {
    id: comment.id,
    contentType: 'COMMENT',
    createdDate: comment.createdDate,
    updatedDate: comment.updatedDate,
    createdBy: createdByAuthorProfile as AuthorProfile,
    isRemoved: comment.isRemoved,
    comment: {
      id: comment.id,
      content: comment.content,
      contentFormat: comment.contentFormat || 'QUILL_EDITOR',
      commentType: comment.commentType,
      score: comment.score,
      reviewScore: comment.reviewScore,
      thread: comment.thread
        ? {
            id: comment.thread.id,
            threadType: comment.thread.threadType,
            objectId: comment.thread.objectId,
          }
        : undefined,
    },
    relatedDocumentId: comment.thread?.objectId,
    relatedDocumentContentType: contentType,
  };

  // Add review data if this is a review comment
  if (comment.commentType === 'REVIEW') {
    commentContent.review = {
      score: comment.reviewScore || comment.score || 0,
    };
  }

  // Create a FeedEntry with the comment content
  return {
    id: `comment-${comment.id}`,
    recommendationId: null, // TODO: will we have recommendation id for comments?
    timestamp: comment.createdDate,
    action: 'contribute', // Default action for comments
    content: commentContent,
    contentType: 'COMMENT',
    relatedWork: relatedDocument, // Add the related document if provided
    metrics: {
      votes: comment.score || 0,
      comments: comment.childrenCount || 0,
      saves: 0, // Required property
      reviewScore: comment.commentType === 'REVIEW' ? comment.reviewScore || comment.score || 0 : 0,
    },
    userVote: comment.userVote,
    tips: comment.tips,
    awardedBountyAmount: comment.awardedBountyAmount,
  };
};

/**
 * Transforms a Comment with bounties into a FeedEntry that can be used with FeedItemBountyComment component
 * @param comment The Comment object with bounties to transform
 * @param contentType The content type of the related document (paper, post, etc.)
 * @param relatedDocument Optional related work (paper or post) to include with the bounty
 * @returns A FeedEntry object with the bounty as content
 */
export const transformBountyCommentToFeedItem = (
  comment: Comment,
  contentType: ContentType,
  relatedDocument?: Work
): FeedEntry => {
  // Ensure the comment has bounties
  if (!comment.bounties || comment.bounties.length === 0) {
    throw new Error('Comment must have bounties to transform to a bounty feed item');
  }

  // Get the first bounty (or the most relevant one)
  const bounty = comment.bounties[0];

  // Create a FeedBountyContent object from the comment and bounty
  const bountyContent: FeedBountyContent = {
    id: comment.id,
    contentType: 'BOUNTY',
    createdDate: comment.createdDate,
    bounty: bounty,
    createdBy: comment.createdBy.authorProfile!,
    relatedDocumentId: comment.thread?.objectId,
    relatedDocumentContentType: contentType,
    comment: {
      id: comment.id,
      content: comment.content,
      contentFormat: comment.contentFormat || 'QUILL_EDITOR',
      commentType: comment.commentType || 'BOUNTY',
    },
  };

  // Create a FeedEntry with the bounty content
  return {
    id: `bounty-${comment.id}`,
    recommendationId: null, // TODO: will we have recommendation id for bounties?
    timestamp: comment.createdDate,
    action: 'open', // Default action for bounties
    content: bountyContent,
    contentType: 'BOUNTY',
    relatedWork: relatedDocument, // Add the related document if provided
    metrics: {
      votes: comment.score || 0,
      comments: comment.childrenCount || 0,
      saves: 0, // Required property
      reviewScore: 0, // Default value for reviewScore
    },
    userVote: comment.userVote,
    tips: comment.tips,
    awardedBountyAmount: comment.awardedBountyAmount,
  };
};

/**
 * Creates a FeedEntry from a Work object, typically used for bounty entries
 * where we need to display the related work (paper or post) as a feed item.
 * @param work The Work object to transform into a FeedEntry
 * @param originalEntry The original FeedEntry to extract metadata from (metrics, userVote, tips)
 * @returns A FeedEntry object with the work as content, or null if the work cannot be transformed
 */
export const createFeedEntryFromWork = (work: Work, originalEntry: FeedEntry): FeedEntry | null => {
  if (!work) return null;

  const contentType = work.contentType === 'paper' ? 'PAPER' : 'POST';
  if (!contentType) return null;

  const bountyEntry = originalEntry.content as FeedBountyContent;
  const originalBounty = bountyEntry.bounty;
  const bountyWithComment: BountyWithComment = {
    ...originalBounty,
    comment: bountyEntry.comment,
  };

  // Transform Work to FeedPostContent or FeedPaperContent
  if (contentType === 'POST') {
    const postContent: FeedPostContent = {
      id: work.id,
      bounties: [bountyWithComment],
      contentType: work.postType === 'PREREGISTRATION' ? 'PREREGISTRATION' : 'POST',
      createdDate: work.createdDate,
      createdBy: work.authors?.[0]?.authorProfile || bountyEntry.createdBy,
      textPreview: work.previewContent || work.abstract || '',
      slug: work.slug,
      title: work.title,
      previewImage: work.image,
      authors: work.authors?.map((a: { authorProfile: any }) => a.authorProfile) || [],
      topics: work.topics || [],
      postType: work.postType,
    };

    return {
      id: work.id.toString(),
      recommendationId: null,
      timestamp: work.createdDate,
      action: 'publish',
      contentType: contentType,
      content: postContent,
      relatedWork: undefined,
      metrics: originalEntry.metrics,
      userVote: originalEntry.userVote,
      tips: originalEntry.tips,
    };
  } else if (contentType === 'PAPER') {
    const paperContent: FeedPaperContent = {
      id: work.id,
      bounties: [bountyWithComment],
      contentType: 'PAPER',
      createdDate: work.createdDate,
      createdBy: work.authors?.[0]?.authorProfile || bountyEntry.createdBy,
      textPreview: work.abstract || '',
      slug: work.slug,
      title: work.title,
      authors: work.authors?.map((a: { authorProfile: any }) => a.authorProfile) || [],
      topics: work.topics || [],
      journal: work.journal || {
        id: 0,
        name: '',
        slug: '',
        description: '',
      },
    };

    return {
      id: work.id.toString(),
      recommendationId: null,
      timestamp: work.createdDate,
      action: 'publish',
      contentType: 'PAPER',
      content: paperContent,
      relatedWork: undefined,
      metrics: originalEntry.metrics,
      userVote: originalEntry.userVote,
      tips: originalEntry.tips,
    };
  }

  return null;
};

export type { AuthorProfile };
export type { Fundraise };

export function mapFeedContentTypeToContentType(
  feedContentType: FeedContentType
): ContentType | undefined {
  switch (feedContentType) {
    case 'PAPER':
      return 'paper';
    case 'POST':
    case 'PREREGISTRATION':
      return 'post';
    case 'COMMENT':
    case 'BOUNTY':
      return undefined;
    case 'APPLICATION':
      return 'post';
    case 'GRANT':
      return 'funding_request';
    default:
      return undefined;
  }
}
