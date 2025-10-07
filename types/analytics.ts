import { CommentType } from './comment';
import { FeedContentType, FeedPostContent, mapFeedContentTypeToContentType } from './feed';
import { UserVoteType } from './reaction';
import { ContentType, Work } from './work';
import { DeviceType } from '@/hooks/useDeviceType';

interface UserContext {
  user_id?: string;
  author_id?: string;
  editor?: boolean;
  moderator?: boolean;
}

interface BaseContext {
  device_type: DeviceType;
}

interface TopicBasic {
  id?: string;
  name?: string;
  slug?: string;
}

export interface RelatedWork {
  id: string;
  content_type: ContentType;
  topics?: TopicBasic[];
  unified_document_id?: string;
  primary_topic?: TopicBasic;
  secondary_topic?: TopicBasic;
}

export type FeedSource = 'home' | 'earn' | 'fund' | 'journal' | 'topic' | 'author' | 'unknown';

// 1. Vote Action
export interface VoteActionEvent extends UserContext, BaseContext {
  vote_type: UserVoteType;
  related_work?: RelatedWork;
}

// 2. Feed Item Clicked
export interface FeedItemClickedEvent extends UserContext, BaseContext {
  feed_position: number;
  feed_source: FeedSource;
  feed_tab: string;
  related_work?: RelatedWork;
}

// 3. Proposal Funded
export interface ProposalFundedEvent extends UserContext, BaseContext {
  fundraise_id: string;
  amount?: number;
  currency?: string;
  related_work?: RelatedWork;
}

// 4. Comment Created
export interface CommentCreatedEvent extends UserContext, BaseContext {
  thread_id: string;
  parent_id?: string;
  bounty_amount?: number;
  bounty_type?: CommentType;
  comment_type: CommentType;
  related_work?: RelatedWork;
}

// 5. Peer Review Created
export interface PeerReviewCreatedEvent extends UserContext, BaseContext {
  comment_id: string;
  score: number;
  related_work?: RelatedWork;
}

/**
 * Helper function to convert FeedPostContent to RelatedWork for analytics
 * @param post - The FeedPostContent to convert
 * @returns RelatedWork object for analytics tracking
 */
export function convertFeedPostContentToRelatedWork(post: FeedPostContent): RelatedWork {
  try {
    return {
      id: post.id.toString(),
      content_type:
        mapFeedContentTypeToContentType(post.contentType) ||
        (post.contentType.toLowerCase() as ContentType),
      topics: post.topics?.map((topic) => ({
        id: topic.id?.toString(),
        name: topic.name,
        slug: topic.slug,
      })),
      unified_document_id: post.unifiedDocumentId?.toString(),
      primary_topic: post.topics?.[0] && {
        id: post.topics[0].id?.toString(),
        name: post.topics[0].name,
        slug: post.topics[0].slug,
      },
      secondary_topic: post.topics?.[1] && {
        id: post.topics[1].id?.toString(),
        name: post.topics[1].name,
        slug: post.topics[1].slug,
      },
    };
  } catch (error) {
    console.error('Error converting FeedPostContent to RelatedWork:', error, { post });
    // Return a minimal RelatedWork object as fallback
    return {
      id: post?.id?.toString() || 'unknown',
      content_type: 'post' as ContentType,
      topics: [],
      unified_document_id: post?.unifiedDocumentId?.toString(),
    };
  }
}

/**
 * Helper function to convert Work to RelatedWork for analytics
 * @param work - The Work to convert
 * @returns RelatedWork object for analytics tracking
 */
export function convertWorkToRelatedWork(work: Work): RelatedWork {
  try {
    return {
      id: work.id.toString(),
      content_type: work.contentType,
      topics: work.topics?.map((topic) => ({
        id: topic.id?.toString(),
        name: topic.name,
        slug: topic.slug,
      })),
      unified_document_id: work.unifiedDocumentId?.toString(),
      primary_topic: work.topics?.[0] && {
        id: work.topics[0].id?.toString(),
        name: work.topics[0].name,
        slug: work.topics[0].slug,
      },
      secondary_topic: work.topics?.[1] && {
        id: work.topics[1].id?.toString(),
        name: work.topics[1].name,
        slug: work.topics[1].slug,
      },
    };
  } catch (error) {
    console.error('Error converting Work to RelatedWork:', error, { work });
    // Return a minimal RelatedWork object as fallback
    return {
      id: work?.id?.toString() || 'unknown',
      content_type: work?.contentType || ('post' as ContentType),
      topics: [],
      unified_document_id: work?.unifiedDocumentId?.toString(),
    };
  }
}
