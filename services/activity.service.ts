import { ApiClient } from './client';
import {
  FeedEntry,
  ActivityFeedApiResponse,
  transformFeedEntry,
  RawApiFeedEntry,
} from '@/types/feed';
import type { CommentType } from '@/types/comment';

export type ActivityDocumentType = 'PREREGISTRATION' | 'GRANT' | 'DISCUSSION';

export type ActivityScope = 'grants' | 'peer_reviews' | 'financial';

export type ActivityCommentType = CommentType | 'PEER_REVIEW';

export interface GetActivityParams {
  page?: number;
  pageSize?: number;
  documentType?: ActivityDocumentType;
  contentType?: string;
  grantId?: number | string;
  scope?: ActivityScope;
  disableCache?: boolean;
}

export interface GetUserActivityParams {
  page?: number;
  pageSize?: number;
  contentType?: string;
  commentTypes?: readonly ActivityCommentType[];
  scope?: ActivityScope;
}

export interface ActivityResult {
  entries: FeedEntry[];
  hasMore: boolean;
  count: number;
}

export class ActivityService {
  private static readonly BASE_PATH = '/api/activity_feed';
  private static readonly DEFAULT_PAGE_SIZE = 20;

  private static async fetchActivity(url: string): Promise<ActivityResult> {
    try {
      const response = await ApiClient.get<ActivityFeedApiResponse>(url);

      const entries = response.results
        .map((entry: RawApiFeedEntry) => {
          try {
            return transformFeedEntry(entry);
          } catch {
            return null;
          }
        })
        .filter((entry): entry is FeedEntry => entry !== null);

      return {
        entries,
        hasMore: !!response.next,
        count: response.count ?? entries.length,
      };
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      return { entries: [], hasMore: false, count: 0 };
    }
  }

  static async getActivity(params?: GetActivityParams): Promise<ActivityResult> {
    const pageSize = params?.pageSize ?? this.DEFAULT_PAGE_SIZE;
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    queryParams.append('page_size', pageSize.toString());
    if (params?.documentType) queryParams.append('document_type', params.documentType);
    if (params?.contentType) queryParams.append('content_type', params.contentType);
    if (params?.grantId) queryParams.append('grant_id', params.grantId.toString());
    if (params?.scope) queryParams.append('scope', params.scope);
    if (params?.disableCache) queryParams.append('disable_cache', 'true');

    const qs = queryParams.toString();
    const url = `${this.BASE_PATH}/${qs ? `?${qs}` : ''}`;
    return this.fetchActivity(url);
  }

  static async getUserActivity(
    userId: number,
    params?: GetUserActivityParams
  ): Promise<ActivityResult> {
    const pageSize = params?.pageSize ?? this.DEFAULT_PAGE_SIZE;
    const queryParams = new URLSearchParams({
      user_id: userId.toString(),
      page_size: pageSize.toString(),
    });
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.contentType) queryParams.append('content_type', params.contentType);
    params?.commentTypes?.forEach((commentType) => queryParams.append('comment_type', commentType));
    if (params?.scope) queryParams.append('scope', params.scope);

    return this.fetchActivity(`${this.BASE_PATH}/user_activity/?${queryParams.toString()}`);
  }
}
