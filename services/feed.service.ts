import { ApiClient } from './client';
import {
  FeedEntry,
  Content,
  FeedActionType,
  Paper,
  Comment,
  FundingRequest,
  Bounty,
  Grant,
  Review,
  Contribution,
} from '@/types/feed';

interface FeedResponse {
  id: number;
  content_type: string;
  content_object: any;
  created_date: string;
  action: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    profile_image: string;
    email: string;
    is_verified: boolean;
  };
}

interface FeedApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FeedResponse[];
}

export class FeedService {
  private static readonly BASE_PATH = '/api/feed';

  private static mapAuthor(user: any) {
    return {
      id: user.id,
      fullName: `${user.first_name} ${user.last_name}`,
      profileImage: user.profile_image,
      isVerified: user.is_verified,
      profileUrl: `/profile/${user.id}`, // TODO: Get actual profile URL format
    };
  }

  private static mapContentObject(contentObject: any, type: string): Content {
    const baseContent = {
      id: contentObject.id.toString(),
      type: type.toLowerCase() as Content['type'],
      timestamp: contentObject.created_date,
      hub: {
        id: contentObject.hub?.id || 0,
        name: contentObject.hub?.name || '',
        slug: contentObject.hub?.slug || '',
      },
      slug: contentObject.slug,
      actor: FeedService.mapAuthor(contentObject.user),
    };

    switch (type.toLowerCase()) {
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
          authors: contentObject.authors.map(FeedService.mapAuthor),
        };
        return paper;
      }
      case 'comment': {
        const comment: Comment = {
          ...baseContent,
          type: 'comment',
          content: contentObject.content,
          parent: contentObject.parent
            ? FeedService.mapContentObject(contentObject.parent, contentObject.parent.type)
            : undefined,
        };
        return comment;
      }
      case 'funding_request': {
        const fundingRequest: FundingRequest = {
          ...baseContent,
          type: 'funding_request',
          title: contentObject.title,
          abstract: contentObject.abstract,
          status: contentObject.status || 'OPEN',
          amount: contentObject.amount || 0,
          goalAmount: contentObject.goal_amount || 0,
          deadline: contentObject.deadline,
          image: contentObject.image,
          preregistered: contentObject.preregistered,
        };
        return fundingRequest;
      }
      case 'bounty': {
        const bounty: Bounty = {
          ...baseContent,
          type: 'bounty',
          title: contentObject.title,
          description: contentObject.description,
          amount: contentObject.amount || 0,
          deadline: contentObject.deadline,
        };
        return bounty;
      }
      case 'grant': {
        const grant: Grant = {
          ...baseContent,
          type: 'grant',
          title: contentObject.title,
          abstract: contentObject.abstract,
          amount: contentObject.amount || 0,
          deadline: contentObject.deadline,
        };
        return grant;
      }
      case 'review': {
        const review: Review = {
          ...baseContent,
          type: 'review',
          title: contentObject.title,
          content: contentObject.content,
          score: contentObject.score,
        };
        return review;
      }
      case 'contribution': {
        const contribution: Contribution = {
          ...baseContent,
          type: 'contribution',
          amount: contentObject.amount || 0,
        };
        return contribution;
      }
      default:
        throw new Error(`Unknown content type: ${type}`);
    }
  }

  private static mapFeedResponse(response: FeedResponse): FeedEntry {
    const contentType = response.content_type.toLowerCase();
    const contentObject = response.content_object;

    return {
      id: response.id.toString(),
      timestamp: response.created_date,
      action: response.action.toLowerCase() as FeedActionType,
      content: FeedService.mapContentObject(contentObject, contentType),
      metrics: {
        votes: contentObject.metrics?.votes || 0,
        comments: contentObject.metrics?.comments || 0,
        reposts: contentObject.metrics?.reposts || 0,
        saves: contentObject.metrics?.saves || 0,
      },
      contributors:
        contentObject.contributors?.map((contributor: any) => ({
          profile: FeedService.mapAuthor(contributor.profile),
          amount: contributor.amount,
        })) || [],
    };
  }

  static async getFeed(params?: {
    page?: number;
    pageSize?: number;
    action?: string;
    contentType?: string;
  }): Promise<{ entries: FeedEntry[]; hasMore: boolean }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('page_size', params.pageSize.toString());
    if (params?.action) queryParams.append('action', params.action);
    if (params?.contentType) queryParams.append('content_type', params.contentType);

    const url = `${this.BASE_PATH}/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await ApiClient.get<FeedApiResponse>(url);

    return {
      entries: response.results.map(FeedService.mapFeedResponse),
      hasMore: !!response.next,
    };
  }
}
