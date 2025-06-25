import { ID } from '@/types/root';
import { AuthorProfile } from '@/types/authorProfile';
import { User } from '@/types/user';
import { FeedEntry, transformCommentToFeedItem } from '@/types/feed';
import { ContentType } from '@/types/work';
import { Comment } from '@/types/comment';
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
  flaggedBy: User;
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
    createdBy?: AuthorProfile;
    commentContentJson?: string | object;
    content?: string;
    text?: string;
    title?: string;
    description?: string;
    renderableText?: string;
    abstract?: string;
    thread?: {
      id: ID;
      contentObject?: {
        unifiedDocument?: {
          documents?: Array<{
            id: ID;
            title?: string;
            renderableText?: string;
            abstract?: string;
          }>;
        };
      };
    };
  };
  verdict?: {
    id: ID;
    verdictChoice: string;
    createdBy: AuthorProfile;
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
    content: commentItem.content ?? commentItem.commentContentJson,
    contentFormat: commentItem.contentFormat ?? 'QUILL_EDITOR',
    commentType: commentItem.commentType ?? 'GENERIC_COMMENT',
    createdDate: commentItem.createdDate ?? flaggedContent.createdDate,
    updatedDate: commentItem.updatedDate,
    score: commentItem.score ?? 0,
    reviewScore: commentItem.reviewScore ?? 0,
    isRemoved: commentItem.isRemoved ?? false,
    childrenCount: commentItem.childrenCount ?? 0,
    // Simplified user creation for audit context
    createdBy: {
      id: commentItem.createdBy?.id ?? flaggedContent.flaggedBy.id,
      firstName: commentItem.createdBy?.firstName ?? flaggedContent.flaggedBy.firstName,
      lastName: commentItem.createdBy?.lastName ?? flaggedContent.flaggedBy.lastName,
      fullName: `${commentItem.createdBy?.firstName ?? flaggedContent.flaggedBy.firstName} ${commentItem.createdBy?.lastName ?? flaggedContent.flaggedBy.lastName}`,
      email: commentItem.createdBy?.email ?? '',
      isVerified: commentItem.createdBy?.isVerified ?? false,
      balance: 0,
      hasCompletedOnboarding: false,
      moderator: false,
      isModerator: false,
      authorProfile: {
        id: commentItem.createdBy?.id ?? flaggedContent.flaggedBy.id,
        firstName: commentItem.createdBy?.firstName ?? flaggedContent.flaggedBy.firstName,
        lastName: commentItem.createdBy?.lastName ?? flaggedContent.flaggedBy.lastName,
        fullName: `${commentItem.createdBy?.firstName ?? flaggedContent.flaggedBy.firstName} ${commentItem.createdBy?.lastName ?? flaggedContent.flaggedBy.lastName}`,
        profileImage:
          commentItem.createdBy?.profileImage ??
          flaggedContent.flaggedBy.authorProfile?.profileImage ??
          '',
        headline: '',
        profileUrl: `/author/${commentItem.createdBy?.id ?? flaggedContent.flaggedBy.id}`,
        isClaimed: false,
        isVerified: false,
      },
    },
    thread: commentItem.thread?.id
      ? {
          id: commentItem.thread.id,
          threadType:
            commentItem.thread.contentObject?.unifiedDocument?.documents?.[0].documentType ??
            'PAPER',
          objectId:
            commentItem.thread.contentObject?.unifiedDocument?.documents?.[0].objectId ??
            commentItem.thread.id,
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
  const relatedContentType: ContentType =
    commentItem.thread?.contentObject?.unifiedDocument?.documents?.[0].documentType === 'POST'
      ? 'post'
      : 'paper';

  return transformCommentToFeedItem(comment as Comment, relatedContentType);
};

/**
 * Transform a paper item for audit display
 */
const transformPaperForAudit = (paperItem: any, flaggedContent: FlaggedContent): FeedEntry => {
  // Create a minimal FeedEntry for paper
  return {
    id: `audit-paper-${paperItem.id}`,
    timestamp: paperItem.createdDate ?? flaggedContent.createdDate,
    action: 'publish',
    contentType: 'PAPER',
    content: {
      id: paperItem.id,
      contentType: 'PAPER',
      createdDate: paperItem.createdDate ?? flaggedContent.createdDate,
      textPreview: paperItem.abstract ?? paperItem.title ?? '',
      slug: paperItem.slug ?? `paper-${paperItem.id}`,
      title: paperItem.title ?? 'Untitled Paper',
      authors: paperItem.authors ?? [],
      topics: paperItem.hubs ?? [],
      createdBy: {
        id: paperItem.createdBy?.id ?? flaggedContent.flaggedBy.id,
        firstName: paperItem.createdBy?.firstName ?? flaggedContent.flaggedBy.firstName,
        lastName: paperItem.createdBy?.lastName ?? flaggedContent.flaggedBy.lastName,
        fullName: `${paperItem.createdBy?.firstName ?? flaggedContent.flaggedBy.firstName} ${paperItem.createdBy?.lastName ?? flaggedContent.flaggedBy.lastName}`,
        profileImage:
          paperItem.createdBy?.profileImage ??
          flaggedContent.flaggedBy.authorProfile?.profileImage ??
          '',
        headline: '',
        profileUrl: `/author/${paperItem.createdBy?.id ?? flaggedContent.flaggedBy.id}`,
        isClaimed: false,
        isVerified: false,
      },
      journal: paperItem.journal ?? { id: 0, name: '', slug: '', image: null, description: '' },
    },
    metrics: {
      votes: paperItem.score ?? 0,
      comments: paperItem.discussionCount ?? 0,
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
    timestamp: bountyItem.createdDate ?? flaggedContent.createdDate,
    action: 'open',
    contentType: 'BOUNTY',
    content: {
      id: bountyItem.id,
      contentType: 'BOUNTY',
      createdDate: bountyItem.createdDate ?? flaggedContent.createdDate,
      bounty: bountyItem,
      createdBy: {
        id: bountyItem.createdBy?.id ?? flaggedContent.flaggedBy.id,
        firstName: bountyItem.createdBy?.firstName ?? flaggedContent.flaggedBy.firstName,
        lastName: bountyItem.createdBy?.lastName ?? flaggedContent.flaggedBy.lastName,
        fullName: `${bountyItem.createdBy?.firstName ?? flaggedContent.flaggedBy.firstName} ${bountyItem.createdBy?.lastName ?? flaggedContent.flaggedBy.lastName}`,
        profileImage:
          bountyItem.createdBy?.profileImage ??
          flaggedContent.flaggedBy.authorProfile?.profileImage ??
          '',
        headline: '',
        profileUrl: `/author/${bountyItem.createdBy?.id ?? flaggedContent.flaggedBy.id}`,
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
    timestamp: postItem.createdDate ?? flaggedContent.createdDate,
    action: 'post',
    contentType: 'POST',
    content: {
      id: postItem.id,
      contentType: 'POST',
      createdDate: postItem.createdDate ?? flaggedContent.createdDate,
      textPreview: postItem.renderableText ?? postItem.title ?? '',
      slug: postItem.slug ?? `post-${postItem.id}`,
      title: postItem.title ?? 'Untitled Post',
      authors: postItem.authors ?? [],
      topics: postItem.hubs ?? [],
      createdBy: {
        id: postItem.createdBy?.id ?? flaggedContent.flaggedBy.id,
        firstName: postItem.createdBy?.firstName ?? flaggedContent.flaggedBy.firstName,
        lastName: postItem.createdBy?.lastName ?? flaggedContent.flaggedBy.lastName,
        fullName: `${postItem.createdBy?.firstName ?? flaggedContent.flaggedBy.firstName} ${postItem.createdBy?.lastName ?? flaggedContent.flaggedBy.lastName}`,
        profileImage:
          postItem.createdBy?.profileImage ??
          flaggedContent.flaggedBy.authorProfile?.profileImage ??
          '',
        headline: '',
        profileUrl: `/author/${postItem.createdBy?.id ?? flaggedContent.flaggedBy.id}`,
        isClaimed: false,
        isVerified: false,
      },
    },
    metrics: {
      votes: postItem.score ?? 0,
      comments: postItem.discussionCount ?? 0,
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
    timestamp: item.createdDate ?? flaggedContent.createdDate,
    action: 'contribute',
    contentType: 'POST', // Default to POST for unknown types
    content: {
      id: item.id ?? flaggedContent.id,
      contentType: 'POST',
      createdDate: item.createdDate ?? flaggedContent.createdDate,
      textPreview: item.content ?? item.description ?? item.title ?? 'Content not available',
      slug: item.slug ?? `content-${item.id ?? flaggedContent.id}`,
      title: item.title ?? `${flaggedContent.contentType.name} Content`,
      authors: [],
      topics: flaggedContent.hubs ?? [],
      createdBy: {
        id: item.createdBy?.id ?? flaggedContent.flaggedBy.id,
        firstName: item.createdBy?.firstName ?? flaggedContent.flaggedBy.firstName,
        lastName: item.createdBy?.lastName ?? flaggedContent.flaggedBy.lastName,
        fullName: `${item.createdBy?.firstName ?? flaggedContent.flaggedBy.firstName} ${item.createdBy?.lastName ?? flaggedContent.flaggedBy.lastName}`,
        profileImage:
          item.createdBy?.profileImage ??
          flaggedContent.flaggedBy.authorProfile?.profileImage ??
          '',
        headline: '',
        profileUrl: `/author/${item.createdBy?.id ?? flaggedContent.flaggedBy.id}`,
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
  const flaggedByName = `${entry.flaggedBy.firstName} ${entry.flaggedBy.lastName}`;

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
  if (contentItem.commentContentJson) {
    return handleCommentContentJson(contentItem.commentContentJson);
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
  const documents = entry.item?.thread?.contentObject?.unifiedDocument?.documents;
  if (documents && documents.length > 0) {
    return documents[0].title ?? 'Untitled Document';
  }
  return 'No parent document';
};

/**
 * Get offending user information from flagged content entry
 */
export const getFlaggedContentOffendingUser = (entry: FlaggedContent) => {
  if (entry.item?.createdBy) {
    const createdBy = entry.item.createdBy;
    return {
      name: `${createdBy.firstName ?? ''} ${createdBy.lastName ?? ''}`.trim() || 'Unknown User',
      avatar: createdBy.profileImage ?? null,
      authorId: createdBy.id ?? null,
      isRemoved: false,
    };
  }

  // If createdBy is null, this likely means the content was removed
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
