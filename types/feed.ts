import { AuthorProfile, transformAuthorProfile } from './authorProfile';
import { ContentMetrics } from './metrics';
import { Topic, transformTopic } from './topic';
import { createTransformer, BaseTransformed } from './transformer';
import { Work, transformPaper, FundingRequest } from './work';
import { Bounty, transformBounty } from './bounty';

export type FeedActionType = 'repost' | 'contribute' | 'open' | 'publish' | 'post';

// Re-export FundingRequest for backward compatibility
export type { FundingRequest };

// Simplified Content type - now just Work or Bounty
export type Content = Work | Bounty;

export interface FeedEntry {
  id: string;
  timestamp: string;
  action: FeedActionType;
  content: Content;
  metrics?: ContentMetrics;
  relatedWork?: Work;
  raw?: RawApiFeedEntry;
}

export interface RawApiFeedEntry {
  id: number;
  content_type: string;
  content_object: any;
  created_date: string;
  action: string;
  action_date: string;
  author: {
    id: number;
    first_name: string;
    last_name: string;
    description: string;
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

export type TransformedContent = Content & BaseTransformed;
export type TransformedFeedEntry = FeedEntry & BaseTransformed;

// Updated transformFeedEntry function to use the simplified Content type
export const transformFeedEntry = (feedEntry: RawApiFeedEntry): FeedEntry => {
  if (!feedEntry) {
    throw new Error('Feed entry is undefined');
  }

  const { id, content_type, content_object, created_date, action, action_date, author } = feedEntry;

  // Base feed entry properties
  const baseFeedEntry: Partial<FeedEntry> = {
    id: id.toString(),
    timestamp: action_date,
    action: action.toLowerCase() as FeedActionType,
  };

  // Transform the content based on content_type
  let content: Content;
  let relatedWork: Work | undefined;

  switch (content_type.toUpperCase()) {
    case 'BOUNTY':
      // For bounties, use the transformBounty function
      try {
        // Transform the bounty using the transformBounty function
        const bounty = transformBounty({ created_by: author, ...content_object });

        // If the bounty has a paper, transform it to a Work and set as relatedWork
        if (content_object.paper) {
          try {
            relatedWork = transformPaper(content_object.paper);
          } catch (paperError) {
            console.error('Error transforming paper for bounty:', paperError);
          }
        }

        content = bounty;
      } catch (error) {
        console.error('Error transforming bounty:', error);
        throw new Error(`Failed to transform bounty: ${error}`);
      }
      break;

    case 'PAPER':
      // For papers, use the transformPaper function
      try {
        content = transformPaper(content_object);
      } catch (error) {
        console.error('Error transforming paper:', error);
        throw new Error(`Failed to transform paper: ${error}`);
      }
      break;

    case 'RHCOMMENTMODEL':
    case 'RESEARCHHUBPOST':
      // For comments and posts, transform to Work with contentType 'post'
      try {
        // Create a minimal object that can be transformed to a Work
        const postData = {
          id: content_object.id,
          title:
            content_object.title ||
            `Comment on ${content_object.document_type?.toLowerCase() || 'content'}`,
          content_type: 'post',
          slug: content_object.slug || `comment/${content_object.id}`,
          created_date: created_date,
          full_markdown: content_object.comment_content_json || '',
          authors: [author],
          hub: content_object.hub,
          unified_document: {
            id: content_object.id,
            document_type: 'POST',
          },
          metrics: content_object.metrics || {
            votes: 0,
            comments: 0,
            reposts: 0,
            saves: 0,
          },
        };

        content = transformPaper(postData);
      } catch (error) {
        console.error('Error transforming post/comment:', error);
        throw new Error(`Failed to transform post/comment: ${error}`);
      }
      break;
    default:
      // For unsupported types, try to transform to a Work
      console.warn(
        `Unsupported content type: ${content_type}, attempting to transform as generic work`
      );
      try {
        // Create a minimal object that can be transformed to a Work
        const genericData = {
          id: content_object.id || id,
          title: content_object.title || `${content_type} #${content_object.id || id}`,
          content_type: 'post',
          slug: content_object.slug || `${content_type.toLowerCase()}/${content_object.id || id}`,
          created_date: created_date,
          authors: [author],
          hub: content_object.hub,
          unified_document: {
            id: content_object.id || id,
            document_type: 'POST',
          },
          metrics: content_object.metrics || {
            votes: 0,
            comments: 0,
            reposts: 0,
            saves: 0,
          },
        };

        content = transformPaper(genericData);
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
    metrics: content_object.metrics
      ? {
          votes: content_object.metrics.votes || 0,
          comments: content_object.metrics.comments || 0,
          reposts: content_object.metrics.reposts || 0,
          saves: content_object.metrics.saves || 0,
        }
      : undefined,
    raw: feedEntry,
  } as FeedEntry;
};
