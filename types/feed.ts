import { AuthorProfile, transformAuthorProfile } from './authorProfile';
import { ContentMetrics } from './metrics';
import { Journal } from './journal';
import { Topic, transformTopic } from './topic';
import { createTransformer, BaseTransformed } from './transformer';

export type FeedActionType = 'repost' | 'contribute' | 'open' | 'publish' | 'post';

export type ContentType = 'bounty' | 'funding_request' | 'paper' | 'post';

interface BaseContent {
  id: string;
  type: ContentType;
  timestamp: string;
  topic: Topic;
  slug: string;
  title?: string;
  actor?: AuthorProfile;
}

export interface Bounty extends BaseContent {
  type: 'bounty';
  abstract: string;
  amount: number;
  paper?: Paper;
  post?: Post;
  title: string;
  bountyType: 'review' | 'answer' | string;
}

export interface Paper extends BaseContent {
  type: 'paper';
  abstract: string;
  doi?: string;
  journal?: Journal;
  authors: AuthorProfile[];
}

export interface Post extends BaseContent {
  type: 'post';
  summary: string;
  postType: 'discussion' | 'question' | 'preregistration';
}

export type FundingRequestStatus = 'OPEN' | 'COMPLETED' | 'CLOSED';

export interface FundingRequest extends BaseContent {
  type: 'funding_request';
  title: string;
  abstract: string;
  status: 'OPEN' | 'CLOSED' | 'COMPLETED';
  amount: number;
  goalAmount: number;
  deadline: string;
  image?: string;
  preregistered?: boolean;
}

export type Content = Bounty | FundingRequest | Paper | Post;

export interface FeedEntry {
  id: string;
  timestamp: string;
  action: FeedActionType;
  content: Content;
  target?: Content;
  context?: Content;
  metrics?: ContentMetrics;
}

export interface FeedResponse {
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
  results: FeedResponse[];
}

export type TransformedContent = Content & BaseTransformed;
export type TransformedFeedEntry = FeedEntry & BaseTransformed;

const baseTransformContentObject = (params: { response: FeedResponse; type: string }): Content => {
  const { response, type } = params;
  const contentObject = response.content_object;

  let transformedActor;
  if (contentObject.author) {
    transformedActor = transformAuthorProfile(contentObject.author);
  } else if (contentObject.authors?.length > 0) {
    transformedActor = transformAuthorProfile(contentObject.authors[0]);
  } else if (response.author) {
    transformedActor = transformAuthorProfile(response.author);
  }

  const baseContent = {
    id: contentObject.id.toString(),
    type: type.toLowerCase() as Content['type'],
    timestamp: contentObject.created_date,
    topic: contentObject.topic
      ? transformTopic(contentObject.topic)
      : {
          id: 0,
          name: '',
          slug: '',
        },
    slug: contentObject.slug,
    actor: transformedActor,
  };

  switch (type.toLowerCase()) {
    case 'bounty': {
      const bounty: Bounty = {
        ...baseContent,
        type: 'bounty',
        abstract: contentObject.abstract,
        amount: contentObject.amount,
        paper: contentObject.paper,
        title: contentObject.title,
        bountyType: contentObject.bounty_type
          ? contentObject.bounty_type.toLowerCase()
          : 'generic_comment',
      };
      return bounty;
    }
    case 'paper': {
      const paper: Paper = {
        ...baseContent,
        type: 'paper',
        title: contentObject.title,
        abstract: contentObject.abstract,
        doi: contentObject.doi,
        journal: contentObject.journal && {
          id: contentObject.journal.id,
          name: contentObject.journal.name,
          slug: contentObject.journal.slug,
          imageUrl: contentObject.journal.image,
        },
        authors: contentObject.authors.map(transformAuthorProfile),
      };
      return paper;
    }
    case 'researchhubpost': {
      const postType = contentObject.type && contentObject.type.toLowerCase();
      const post: Post = {
        ...baseContent,
        type: 'post',
        title: contentObject.title,
        summary: contentObject.renderable_text,
        postType: ['discussion', 'question', 'preregistration'].includes(postType)
          ? postType
          : 'discussion',
      };
      return post;
    }
    default:
      throw new Error(`Unknown content type: ${type}`);
  }
};

export const transformContentObject = createTransformer<
  { response: FeedResponse; type: string },
  Content
>((params) => baseTransformContentObject(params));

export const transformFeedEntry = createTransformer<FeedResponse, FeedEntry>((response) => {
  const contentType = response.content_type.toLowerCase();
  const contentObject = response.content_object;

  return {
    id: response.id.toString(),
    timestamp: response.action_date,
    action: response.action.toLowerCase() as FeedActionType,
    content: transformContentObject({ response, type: contentType }),
    metrics: {
      votes: contentObject.metrics?.votes || 0,
      comments: contentObject.metrics?.comments || 0,
      reposts: contentObject.metrics?.reposts || 0,
      saves: contentObject.metrics?.saves || 0,
    },
    contributors:
      contentObject.contributors?.map((contributor: any) => ({
        profile: transformAuthorProfile(contributor.profile),
        amount: contributor.amount,
      })) || [],
  };
});
