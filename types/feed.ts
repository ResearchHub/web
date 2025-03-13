import { AuthorProfile, transformAuthorProfile } from './authorProfile';
import { ContentMetrics } from './metrics';
import { Topic, transformTopic } from './topic';
import { createTransformer, BaseTransformed } from './transformer';
import { Work, transformPaper, transformPost, FundingRequest } from './work';
import { Bounty, transformBounty } from './bounty';
import { Comment, transformComment } from './comment';
import { Fundraise, transformFundraise } from './funding';
import { Journal } from './journal';

export type FeedActionType = 'repost' | 'contribute' | 'open' | 'publish' | 'post';

// Re-export FundingRequest for backward compatibility
export type { FundingRequest };

// New FeedPostEntry type for RESEARCHHUBPOST content
export interface FeedPostEntry {
  id: number;
  fundraise?: Fundraise; // Only present for PREREGISTRATION content types
  contentType: 'PREREGISTRATION' | 'POST';
  createdDate: string;
  textPreview: string;
  slug: string;
  title: string;
  authors: AuthorProfile[];
  topics: Topic[];
  metrics: ContentMetrics;
  createdBy: AuthorProfile;
}

export interface FeedPaperEntry {
  id: number;
  contentType: 'PAPER';
  createdDate: string;
  textPreview: string;
  slug: string;
  title: string;
  authors: AuthorProfile[];
  topics: Topic[];
  metrics: ContentMetrics;
  createdBy: AuthorProfile;
  journal: Journal;
}

// Simplified Content type - now Work, Bounty, Comment, or FeedPostEntry
export type Content = Work | Bounty | Comment | FeedPostEntry | FeedPaperEntry;

// Define a union type for all possible content types
export type FeedContentType = 'PAPER' | 'POST' | 'PREREGISTRATION' | 'BOUNTY' | 'COMMENT';

export interface FeedEntry {
  id: string;
  timestamp: string;
  action: FeedActionType;
  content: Content;
  contentType: FeedContentType; // New field to easily identify the type of content
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
  let contentType: FeedContentType;

  switch (content_type.toUpperCase()) {
    case 'BOUNTY':
      contentType = 'BOUNTY';
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
      contentType = 'PAPER';
      // For papers, use the transformPaper function
      try {
        // Create a FeedPaperEntry object directly
        const paperEntry: FeedPaperEntry = {
          id: content_object.id,
          contentType: 'PAPER',
          createdDate: content_object.created_date,
          textPreview: content_object.abstract || '',
          slug: content_object.slug || '',
          title: content_object.title || '',
          authors: content_object.authors?.map(transformAuthorProfile) || [],
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
          metrics: {
            votes: content_object.metrics?.votes || 0,
            comments: content_object.metrics?.comments || 0,
            reposts: 0,
            saves: 0,
            views: 0,
            reviewScore: 0,
            reviews: 0,
            earned: 0,
          },
          createdBy: author
            ? transformAuthorProfile(author)
            : content_object.authors?.[0]
              ? transformAuthorProfile(content_object.authors[0])
              : {
                  id: 0,
                  fullName: 'Unknown Author',
                  profileImage: '',
                  headline: '',
                  profileUrl: '/profile/0',
                },
          journal: content_object.journal || {
            id: 0,
            name: '',
            slug: '',
            image: null,
            description: '',
          },
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
        const commentData = {
          id: content_object.id,
          comment_content_json: content_object.comment_content_json,
          comment_content_type: content_object.comment_content_type,
          comment_type: content_object.comment_type,
          created_date: content_object.created_date || created_date,
          updated_date: content_object.updated_date || created_date,
          created_by: author,
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
                object_id: content_object.id,
              }
            : null,
          is_public: true,
          is_removed: false,
          metadata: content_object.metadata || {},
        };
        content = transformComment(commentData);

        // If the comment is associated with a paper, transform it to a Work and set as relatedWork
        if (content_object?.paper?.id) {
          console.log('content_object.paper', content_object.paper);
          try {
            relatedWork = transformPaper(content_object.paper);
          } catch (paperError) {
            console.error('Error transforming paper for comment:', paperError);
          }
        }
      } catch (error) {
        console.error('Error transforming comment:', error);
        throw new Error(`Failed to transform comment: ${error}`);
      }
      break;

    case 'RESEARCHHUBPOST':
      contentType = 'POST';
      // For RESEARCHHUBPOST, map directly to FeedPostEntry
      try {
        // Extract the necessary data from content_object
        const isPreregistration = content_object.type === 'PREREGISTRATION';

        // Create a FeedPostEntry object
        const postEntry: FeedPostEntry = {
          id: content_object.id,
          contentType: isPreregistration ? 'PREREGISTRATION' : 'POST',
          createdDate: content_object.created_date,
          textPreview: content_object.renderable_text || '',
          slug: content_object.slug || '',
          title: content_object.title || '',
          authors: [transformAuthorProfile(author)],
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
          metrics: {
            votes: content_object.metrics?.votes || 0,
            comments: content_object.metrics?.comments || 0,
            reposts: 0,
            saves: 0,
            views: 0,
            reviewScore: 0,
            reviews: 0,
            earned: 0,
          },
          createdBy: transformAuthorProfile(author),
        };

        // Add fundraise data if it's a PREREGISTRATION and has fundraise data
        if (isPreregistration && content_object.fundraise) {
          try {
            postEntry.fundraise = transformFundraise(content_object.fundraise);
          } catch (fundraiseError) {
            console.error('Error transforming fundraise for preregistration:', fundraiseError);
          }
        }

        content = postEntry;
      } catch (error) {
        console.error('Error transforming RESEARCHHUBPOST:', error);
        throw new Error(`Failed to transform RESEARCHHUBPOST: ${error}`);
      }
      break;
    default:
      // For unsupported types, try to transform to a Work
      console.warn(
        `Unsupported content type: ${content_type}, attempting to transform as generic work`
      );
      contentType = 'POST'; // Default to POST for unknown types
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
    contentType,
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
