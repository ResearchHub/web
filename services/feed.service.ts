import { ApiClient } from './client';
import { FeedEntry, Content, FeedActionType, Paper } from '@/types/feed';
import { transformAuthorProfile } from '@/types/authorProfile';
import { transformTopic } from '@/types/work';

interface FeedResponse {
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

interface FeedApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FeedResponse[];
}

export class FeedService {
  private static readonly BASE_PATH = '/api/feed';

  private static transformContentObject(contentObject: any, type: string): Content {
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
      actor: transformAuthorProfile(
        contentObject.author ? contentObject.author : contentObject.authors[0]
      ),
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
          authors: contentObject.authors.map(transformAuthorProfile),
        };
        return paper;
      }
      default:
        throw new Error(`Unknown content type: ${type}`);
    }
  }

  private static transformFeedEntry(response: FeedResponse): FeedEntry {
    const contentType = response.content_type.toLowerCase();
    const contentObject = response.content_object;

    return {
      id: response.id.toString(),
      timestamp: response.action_date,
      action: response.action.toLowerCase() as FeedActionType,
      content: FeedService.transformContentObject(contentObject, contentType),
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
      entries: response.results.map(FeedService.transformFeedEntry),
      hasMore: !!response.next,
    };
  }
}
