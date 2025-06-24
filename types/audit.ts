import { ID } from '@/types/root';
import { AuthorProfile, transformAuthorProfile } from '@/types/authorProfile';
import { FeedEntry, transformCommentToFeedItem } from '@/types/feed';
import { ContentType } from '@/types/work';
import { Comment } from '@/types/comment';
import { BaseTransformer } from '@/types/transformer';
import {
  handleCommentContentJson,
  getContentFromThreadDocument,
  getFallbackContent,
} from '@/components/Moderators/utils/auditUtils';

/**
 * Audit Types and Transformers
 *
 * This module provides:
 * - Type definitions for audit/moderation system
 * - Transform functions to convert audit data to feed components
 * - Helper functions for content preview and display
 *
 * Used primarily by moderation dashboard and audit components
 */

/**
 * Represents flagged content in the audit system
 */
export interface FlaggedContent {
  id: ID;
  createdDate: string;
  updatedDate?: string;
  reason?: string;
  reasonChoice?: string;
  flaggedBy: {
    authorProfile: AuthorProfile;
  };
  contentType: {
    id: ID;
    name: string;
  };
  hubs?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  item?: {
    id: ID;
    created_by?: {
      id: ID;
      first_name?: string;
      last_name?: string;
      author_profile?: {
        id: ID;
        profile_image?: string;
      };
    };
    comment_content_json?: string | object;
    content?: string;
    text?: string;
    title?: string;
    description?: string;
    renderable_text?: string;
    abstract?: string;
    thread?: {
      id: ID;
      content_object?: {
        unified_document?: {
          documents?: Array<{
            id: ID;
            title?: string;
            renderable_text?: string;
            abstract?: string;
          }>;
        };
      };
    };
  };
  verdict?: {
    id: ID;
    verdictChoice: string;
    createdBy: {
      id: ID;
      authorProfile: {
        id: ID;
        firstName: string;
        lastName: string;
      };
    };
  };
}

// Transform functions following the established pattern

/**
 * Transform a FlaggedContent item to a FeedEntry for consistent rendering with existing feed components
 */
export const transformFlaggedContentToFeedEntry = (
  flaggedContent: FlaggedContent
): FeedEntry | undefined => {
  const { item, contentType } = flaggedContent;

  if (!item) {
    return undefined;
  }

  const contentTypeName = contentType.name.toLowerCase();

  // Handle different content types similar to the main feed transformer
  switch (contentTypeName) {
    case 'rhcommentmodel':
    case 'comment':
      return transformCommentForAudit(item, flaggedContent);

    case 'paper':
      return transformPaperForAudit(item, flaggedContent);

    case 'bounty':
      return transformBountyForAudit(item, flaggedContent);

    case 'researchhubpost':
    case 'post':
      return transformPostForAudit(item, flaggedContent);

    default:
      // For unknown types, create a generic entry
      return transformGenericForAudit(item, flaggedContent);
  }
};

/**
 * Transform a comment item for audit display
 */
const transformCommentForAudit = (commentItem: any, flaggedContent: FlaggedContent): FeedEntry => {
  // Create a simplified Comment object from the audit item
  const comment: Partial<Comment> = {
    id: commentItem.id,
    content: commentItem.content ?? commentItem.comment_content_json,
    contentFormat: commentItem.content_format ?? 'QUILL_EDITOR',
    commentType: commentItem.comment_type ?? 'GENERIC_COMMENT',
    createdDate: commentItem.created_date ?? flaggedContent.createdDate,
    updatedDate: commentItem.updated_date,
    score: commentItem.score ?? 0,
    reviewScore: commentItem.review_score ?? 0,
    isRemoved: commentItem.is_removed ?? false,
    childrenCount: commentItem.children_count ?? 0,
    // Simplified user creation for audit context
    createdBy: {
      id: commentItem.created_by?.author_profile?.id ?? flaggedContent.flaggedBy.authorProfile.id,
      firstName:
        commentItem.created_by?.first_name ?? flaggedContent.flaggedBy.authorProfile.firstName,
      lastName:
        commentItem.created_by?.last_name ?? flaggedContent.flaggedBy.authorProfile.lastName,
      fullName: `${commentItem.created_by?.first_name ?? flaggedContent.flaggedBy.authorProfile.firstName} ${commentItem.created_by?.last_name ?? flaggedContent.flaggedBy.authorProfile.lastName}`,
      email: commentItem.created_by?.email ?? '',
      isVerified: commentItem.created_by?.is_verified ?? false,
      balance: 0,
      hasCompletedOnboarding: false,
      moderator: false,
      isModerator: false,
      authorProfile: {
        id: commentItem.created_by?.author_profile?.id ?? flaggedContent.flaggedBy.authorProfile.id,
        firstName:
          commentItem.created_by?.first_name ?? flaggedContent.flaggedBy.authorProfile.firstName,
        lastName:
          commentItem.created_by?.last_name ?? flaggedContent.flaggedBy.authorProfile.lastName,
        fullName: `${commentItem.created_by?.first_name ?? flaggedContent.flaggedBy.authorProfile.firstName} ${commentItem.created_by?.last_name ?? flaggedContent.flaggedBy.authorProfile.lastName}`,
        profileImage:
          commentItem.created_by?.author_profile?.profile_image ??
          flaggedContent.flaggedBy.authorProfile.profileImage ??
          '',
        headline: '',
        profileUrl: `/author/${commentItem.created_by?.author_profile?.id ?? flaggedContent.flaggedBy.authorProfile.id}`,
        isClaimed: false,
        isVerified: false,
      },
    },
    thread: commentItem.thread_id
      ? {
          id: commentItem.thread_id,
          threadType: commentItem.document_type ?? 'PAPER',
          objectId: commentItem.object_id ?? commentItem.thread_id,
          privacyType: 'PUBLIC',
          raw: commentItem,
        }
      : {
          id: 0,
          threadType: 'PAPER',
          objectId: 0,
          privacyType: 'PUBLIC',
          raw: commentItem,
        },
    bounties: [],
    tips: [],
    replies: [],
    raw: commentItem,
  };

  // Determine content type for related work
  const relatedContentType: ContentType = commentItem.document_type === 'POST' ? 'post' : 'paper';

  return transformCommentToFeedItem(comment as Comment, relatedContentType);
};

/**
 * Transform a paper item for audit display
 */
const transformPaperForAudit = (paperItem: any, flaggedContent: FlaggedContent): FeedEntry => {
  // Create a minimal FeedEntry for paper
  return {
    id: `audit-paper-${paperItem.id}`,
    timestamp: paperItem.created_date ?? flaggedContent.createdDate,
    action: 'publish',
    contentType: 'PAPER',
    content: {
      id: paperItem.id,
      contentType: 'PAPER',
      createdDate: paperItem.created_date ?? flaggedContent.createdDate,
      textPreview: paperItem.abstract ?? paperItem.title ?? '',
      slug: paperItem.slug ?? `paper-${paperItem.id}`,
      title: paperItem.title ?? 'Untitled Paper',
      authors: paperItem.authors ?? [],
      topics: paperItem.hubs ?? [],
      createdBy: {
        id: paperItem.created_by?.author_profile?.id ?? flaggedContent.flaggedBy.authorProfile.id,
        firstName:
          paperItem.created_by?.first_name ?? flaggedContent.flaggedBy.authorProfile.firstName,
        lastName:
          paperItem.created_by?.last_name ?? flaggedContent.flaggedBy.authorProfile.lastName,
        fullName: `${paperItem.created_by?.first_name ?? flaggedContent.flaggedBy.authorProfile.firstName} ${paperItem.created_by?.last_name ?? flaggedContent.flaggedBy.authorProfile.lastName}`,
        profileImage:
          paperItem.created_by?.author_profile?.profile_image ??
          flaggedContent.flaggedBy.authorProfile.profileImage ??
          '',
        headline: '',
        profileUrl: `/author/${paperItem.created_by?.author_profile?.id ?? flaggedContent.flaggedBy.authorProfile.id}`,
        isClaimed: false,
        isVerified: false,
      },
      journal: paperItem.journal ?? { id: 0, name: '', slug: '', image: null, description: '' },
    },
    metrics: {
      votes: paperItem.score ?? 0,
      comments: paperItem.discussion_count ?? 0,
      saves: 0,
      reviewScore: 0,
    },
  };
};

/**
 * Transform a bounty item for audit display
 */
const transformBountyForAudit = (bountyItem: any, flaggedContent: FlaggedContent): FeedEntry => {
  // Create a minimal FeedEntry for bounty
  return {
    id: `audit-bounty-${bountyItem.id}`,
    timestamp: bountyItem.created_date ?? flaggedContent.createdDate,
    action: 'open',
    contentType: 'BOUNTY',
    content: {
      id: bountyItem.id,
      contentType: 'BOUNTY',
      createdDate: bountyItem.created_date ?? flaggedContent.createdDate,
      bounty: bountyItem,
      createdBy: {
        id: bountyItem.created_by?.author_profile?.id ?? flaggedContent.flaggedBy.authorProfile.id,
        firstName:
          bountyItem.created_by?.first_name ?? flaggedContent.flaggedBy.authorProfile.firstName,
        lastName:
          bountyItem.created_by?.last_name ?? flaggedContent.flaggedBy.authorProfile.lastName,
        fullName: `${bountyItem.created_by?.first_name ?? flaggedContent.flaggedBy.authorProfile.firstName} ${bountyItem.created_by?.last_name ?? flaggedContent.flaggedBy.authorProfile.lastName}`,
        profileImage:
          bountyItem.created_by?.author_profile?.profile_image ??
          flaggedContent.flaggedBy.authorProfile.profileImage ??
          '',
        headline: '',
        profileUrl: `/author/${bountyItem.created_by?.author_profile?.id ?? flaggedContent.flaggedBy.authorProfile.id}`,
        isClaimed: false,
        isVerified: false,
      },
      comment: {
        id: bountyItem.id,
        content: bountyItem.content ?? bountyItem.description,
        contentFormat: 'QUILL_EDITOR',
        commentType: 'BOUNTY',
      },
    },
    metrics: {
      votes: bountyItem.score ?? 0,
      comments: 0,
      saves: 0,
      reviewScore: 0,
    },
  };
};

/**
 * Transform a post item for audit display
 */
const transformPostForAudit = (postItem: any, flaggedContent: FlaggedContent): FeedEntry => {
  return {
    id: `audit-post-${postItem.id}`,
    timestamp: postItem.created_date ?? flaggedContent.createdDate,
    action: 'post',
    contentType: 'POST',
    content: {
      id: postItem.id,
      contentType: 'POST',
      createdDate: postItem.created_date ?? flaggedContent.createdDate,
      textPreview: postItem.renderable_text ?? postItem.title ?? '',
      slug: postItem.slug ?? `post-${postItem.id}`,
      title: postItem.title ?? 'Untitled Post',
      authors: postItem.authors ?? [],
      topics: postItem.hubs ?? [],
      createdBy: {
        id: postItem.created_by?.author_profile?.id ?? flaggedContent.flaggedBy.authorProfile.id,
        firstName:
          postItem.created_by?.first_name ?? flaggedContent.flaggedBy.authorProfile.firstName,
        lastName: postItem.created_by?.last_name ?? flaggedContent.flaggedBy.authorProfile.lastName,
        fullName: `${postItem.created_by?.first_name ?? flaggedContent.flaggedBy.authorProfile.firstName} ${postItem.created_by?.last_name ?? flaggedContent.flaggedBy.authorProfile.lastName}`,
        profileImage:
          postItem.created_by?.author_profile?.profile_image ??
          flaggedContent.flaggedBy.authorProfile.profileImage ??
          '',
        headline: '',
        profileUrl: `/author/${postItem.created_by?.author_profile?.id ?? flaggedContent.flaggedBy.authorProfile.id}`,
        isClaimed: false,
        isVerified: false,
      },
    },
    metrics: {
      votes: postItem.score ?? 0,
      comments: postItem.discussion_count ?? 0,
      saves: 0,
      reviewScore: 0,
    },
  };
};

/**
 * Transform a generic/unknown item for audit display
 */
const transformGenericForAudit = (item: any, flaggedContent: FlaggedContent): FeedEntry => {
  return {
    id: `audit-generic-${item.id ?? flaggedContent.id}`,
    timestamp: item.created_date ?? flaggedContent.createdDate,
    action: 'contribute',
    contentType: 'POST', // Default to POST for unknown types
    content: {
      id: item.id ?? flaggedContent.id,
      contentType: 'POST',
      createdDate: item.created_date ?? flaggedContent.createdDate,
      textPreview: item.content ?? item.description ?? item.title ?? 'Content not available',
      slug: item.slug ?? `content-${item.id ?? flaggedContent.id}`,
      title: item.title ?? `${flaggedContent.contentType.name} Content`,
      authors: [],
      topics: flaggedContent.hubs ?? [],
      createdBy: {
        id: item.created_by?.author_profile?.id ?? flaggedContent.flaggedBy.authorProfile.id,
        firstName: item.created_by?.first_name ?? flaggedContent.flaggedBy.authorProfile.firstName,
        lastName: item.created_by?.last_name ?? flaggedContent.flaggedBy.authorProfile.lastName,
        fullName: `${item.created_by?.first_name ?? flaggedContent.flaggedBy.authorProfile.firstName} ${item.created_by?.last_name ?? flaggedContent.flaggedBy.authorProfile.lastName}`,
        profileImage:
          item.created_by?.author_profile?.profile_image ??
          flaggedContent.flaggedBy.authorProfile.profileImage ??
          '',
        headline: '',
        profileUrl: `/author/${item.created_by?.author_profile?.id ?? flaggedContent.flaggedBy.authorProfile.id}`,
        isClaimed: false,
        isVerified: false,
      },
    },
    metrics: {
      votes: item.score ?? 0,
      comments: 0,
      saves: 0,
      reviewScore: 0,
    },
  };
};

/**
 * Get display title for a flagged content entry
 */
export const getFlaggedContentTitle = (entry: FlaggedContent): string => {
  const contentType = entry.contentType.name.toLowerCase();
  const flaggedByName = `${entry.flaggedBy.authorProfile.firstName} ${entry.flaggedBy.authorProfile.lastName}`;

  if (contentType.includes('comment')) {
    return `Comment flagged by ${flaggedByName}`;
  } else if (contentType.includes('review')) {
    return `Peer review flagged by ${flaggedByName}`;
  } else if (contentType.includes('bounty')) {
    return `Bounty flagged by ${flaggedByName}`;
  } else if (contentType.includes('paper')) {
    return `Paper flagged by ${flaggedByName}`;
  } else if (contentType.includes('post')) {
    return `Post flagged by ${flaggedByName}`;
  } else {
    return `${entry.contentType.name} flagged by ${flaggedByName}`;
  }
};

/**
 * Get content preview from flagged content entry
 */
export const getFlaggedContentPreview = (entry: FlaggedContent): string => {
  if (!entry.item) {
    return 'Content not available';
  }

  const contentItem = entry.item;

  // For comments with TipTap or Quill JSON content
  if (contentItem.comment_content_json) {
    return handleCommentContentJson(contentItem.comment_content_json);
  }

  // For posts and papers, get content from thread content object
  const threadContent = getContentFromThreadDocument(contentItem);
  if (threadContent) {
    return threadContent;
  }

  // Fallback to other possible content fields
  return getFallbackContent(contentItem);
};

/**
 * Get the parent document title from flagged content entry
 */
export const getFlaggedContentParentDocumentTitle = (entry: FlaggedContent): string => {
  const documents = entry.item?.thread?.content_object?.unified_document?.documents;
  if (documents && documents.length > 0) {
    return documents[0].title ?? 'Untitled Document';
  }
  return 'No parent document';
};

/**
 * Get offending user information from flagged content entry
 */
export const getFlaggedContentOffendingUser = (entry: FlaggedContent) => {
  if (entry.item?.created_by) {
    const createdBy = entry.item.created_by;
    return {
      name: `${createdBy.first_name ?? ''} ${createdBy.last_name ?? ''}`.trim() || 'Unknown User',
      avatar: createdBy.author_profile?.profile_image ?? null,
      authorId: createdBy.author_profile?.id ?? null,
      isRemoved: false,
    };
  }

  // If created_by is null, this likely means the content was removed
  return {
    name: 'Removed User',
    avatar: null,
    authorId: null,
    isRemoved: true,
  };
};

/**
 * Get status color class based on verdict
 */
export const getFlaggedContentStatusColor = (verdict?: string): string => {
  if (!verdict) return 'bg-orange-100 text-orange-800';

  switch (verdict.toLowerCase()) {
    case 'open':
      return 'bg-orange-100 text-orange-800';
    case 'removed':
      return 'bg-red-100 text-red-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get display status based on verdict
 */
export const getFlaggedContentDisplayStatus = (verdict?: string): string => {
  if (!verdict) return 'Pending';

  switch (verdict.toLowerCase()) {
    case 'open':
      return 'Pending';
    case 'removed':
      return 'Removed';
    case 'approved':
      return 'Dismissed';
    default:
      return 'Unknown';
  }
};
