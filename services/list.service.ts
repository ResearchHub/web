import { ApiClient } from './client';
import {
  UserList,
  UserListDetail,
  CreateListRequest,
  UpdateListRequest,
  ListStats,
  UserListItem,
  TopAuthor,
  TopHub,
  TopCategory,
  UserCheckResponse,
} from '@/types/user-list';

interface ListApiResponse<T> {
  results: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

interface PaginatedListResponse<T> {
  lists: T[];
  hasMore: boolean;
  stats?: ListStats;
}

export interface UserListsResponse {
  lists: UserList[];
  stats?: ListStats;
}

export class ListService {
  private static readonly BASE_PATH = '/api/user_list';
  private static readonly ITEM_BASE_PATH = '/api/user_list_item';

  private static buildUrl(path: string, params?: Record<string, any>): string {
    if (!params) return path;
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined) query.append(key === 'pageSize' ? 'page_size' : key, val.toString());
    });
    return query.toString() ? `${path}?${query}` : path;
  }

  static async getUserLists(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedListResponse<UserList>> {
    const response = await ApiClient.get<ListApiResponse<UserList>>(
      this.buildUrl(`${this.BASE_PATH}/`, params)
    );
    return {
      lists: response.results || [],
      hasMore: !!response.next,
      stats: this.aggregateStats(response.results || []),
    };
  }

  private static aggregateStats(lists: UserList[]): ListStats | undefined {
    if (!lists.length) return undefined;

    const aggregateByField = <T extends { id: number }>(
      lists: UserList[],
      field: keyof UserList,
      countField?: string
    ) => {
      const map = new Map<number, { item: T; count: number }>();
      lists.forEach((list) => {
        const items = list[field] as T[] | undefined;
        items?.forEach((item) => {
          if (item?.id) {
            const existing = map.get(item.id);
            const itemCount = (countField && (item as any)[countField]) || 1;
            map.set(item.id, {
              item,
              count: (existing?.count || 0) + itemCount,
            });
          }
        });
      });
      return Array.from(map.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    };

    return {
      topAuthors: aggregateByField<TopAuthor>(lists, 'top_authors', 'count').map((item) => ({
        ...item.item,
        count: item.count,
      })),
      topCategories: aggregateByField<TopHub>(lists, 'top_hubs').map((item) => ({
        id: item.item.id,
        name: item.item.name,
        slug: item.item.slug,
        itemCount: item.count,
      })),
    };
  }

  static async getListById(
    listId: number,
    params?: { page?: number; pageSize?: number }
  ): Promise<UserListDetail> {
    return ApiClient.get<UserListDetail>(this.buildUrl(`${this.BASE_PATH}/${listId}/`, params));
  }

  static async createList(data: CreateListRequest): Promise<UserList> {
    return ApiClient.post<UserList>(`${this.BASE_PATH}/`, data);
  }

  static async updateList(listId: number, data: UpdateListRequest): Promise<UserList> {
    return ApiClient.patch<UserList>(`${this.BASE_PATH}/${listId}/`, data);
  }

  static async deleteList(listId: number): Promise<void> {
    return ApiClient.delete(`${this.BASE_PATH}/${listId}/`);
  }

  static async addItemToList(listId: number, unifiedDocumentId: number): Promise<UserListItem> {
    return ApiClient.post<UserListItem>(`${this.ITEM_BASE_PATH}/`, {
      parent_list: listId,
      unified_document: unifiedDocumentId,
    });
  }

  static async removeItemFromList(itemId: number): Promise<void> {
    return ApiClient.delete(`${this.ITEM_BASE_PATH}/${itemId}/`);
  }

  static async getUserCheck(): Promise<UserCheckResponse> {
    return ApiClient.get<UserCheckResponse>(`${this.BASE_PATH}/user_check/`);
  }
}
