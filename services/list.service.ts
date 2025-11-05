import { ApiClient } from './client';
import {
  UserList,
  UserListDetail,
  CreateListRequest,
  UpdateListRequest,
  AddItemRequest,
  ListStats,
  UserListItem,
  TopAuthor,
  TopHub,
  TopTopic,
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

  /**
   * Fetch all lists for the current user
   */
  static async getUserLists(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedListResponse<UserList>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('page_size', params.pageSize.toString());

    const url = `${this.BASE_PATH}/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await ApiClient.get<ListApiResponse<UserList>>(url);

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
        itemCount: item.count,
      })),
      topTopics: aggregateByField<any>(lists, 'top_topics').map((item) => ({
        id: item.item.id,
        name: item.item.name || 'Unknown',
        itemCount: item.count,
      })),
    };
  }

  /**
   * Fetch a specific list by ID
   */
  static async getListById(
    listId: number,
    params?: { page?: number; pageSize?: number }
  ): Promise<UserListDetail> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('page_size', params.pageSize.toString());

    const url = `${this.BASE_PATH}/${listId}/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await ApiClient.get<UserListDetail>(url);

    return response;
  }

  /**
   * Create a new list
   */
  static async createList(data: CreateListRequest): Promise<UserList> {
    return await ApiClient.post<UserList>(`${this.BASE_PATH}/`, data);
  }

  /**
   * Update a list name
   */
  static async updateList(listId: number, data: UpdateListRequest): Promise<UserList> {
    return await ApiClient.patch<UserList>(`${this.BASE_PATH}/${listId}/`, data);
  }

  /**
   * Delete a list
   */
  static async deleteList(listId: number): Promise<void> {
    await ApiClient.delete(`${this.BASE_PATH}/${listId}/`);
  }

  /**
   * Add an item to a list
   */
  static async addItemToList(listId: number, unifiedDocumentId: number): Promise<UserListItem> {
    return await ApiClient.post<UserListItem>(`${this.ITEM_BASE_PATH}/`, {
      parent_list: listId,
      unified_document: unifiedDocumentId,
    });
  }

  /**
   * Remove an item from a list
   */
  static async removeItemFromList(listId: number, itemId: number): Promise<void> {
    await ApiClient.delete(`${this.ITEM_BASE_PATH}/${itemId}/`);
  }

  /**
   * Get simplified list data for checking if documents are in lists
   * This is a lightweight endpoint for the green folder button and add to list modal
   */
  static async getUserCheck(): Promise<UserCheckResponse> {
    return await ApiClient.get<UserCheckResponse>(`${this.BASE_PATH}/user_check/`);
  }
}
