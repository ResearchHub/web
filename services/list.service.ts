import { ApiClient } from './client';
import {
  UserList,
  CreateListRequest,
  UpdateListRequest,
  UserListItem,
  UserCheckResponse,
} from '@/types/user-list';

interface ListApiResponse<T> {
  results: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

interface PaginatedListResponse {
  lists: UserList[];
  hasMore: boolean;
}

export class ListService {
  private static readonly BASE_PATH = '/api/user_list';
  private static readonly ITEM_BASE_PATH = '/api/user_list_item';

  private static buildUrl(path: string, params?: Record<string, any>): string {
    if (!params) return path;
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined) {
        const paramKey = key === 'pageSize' ? 'page_size' : key;
        query.append(paramKey, val.toString());
      }
    });
    return query.toString() ? `${path}?${query}` : path;
  }

  static async getUserLists(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedListResponse> {
    const response = await ApiClient.get<ListApiResponse<UserList>>(
      this.buildUrl(`${this.BASE_PATH}/`, params)
    );
    return {
      lists: response.results || [],
      hasMore: !!response.next,
    };
  }

  static async getListById(listId: number): Promise<UserList> {
    return ApiClient.get<UserList>(`${this.BASE_PATH}/${listId}/`);
  }

  static async getListItems(
    listId: number,
    params?: { page?: number; pageSize?: number }
  ): Promise<ListApiResponse<UserListItem>> {
    return ApiClient.get<ListApiResponse<UserListItem>>(
      this.buildUrl(`${this.ITEM_BASE_PATH}/`, { ...params, parent_list: listId })
    );
  }

  static async createList(data: CreateListRequest): Promise<UserList> {
    return ApiClient.post<UserList>(`${this.BASE_PATH}/`, data);
  }

  static async updateList(listId: number, data: UpdateListRequest): Promise<UserList> {
    return ApiClient.patch<UserList>(`${this.BASE_PATH}/${listId}/`, data);
  }

  static async deleteList(listId: number): Promise<void> {
    try {
      await ApiClient.delete(`${this.BASE_PATH}/${listId}/`);
    } catch (err) {
      if (err instanceof SyntaxError) return;
      throw err;
    }
  }

  static async addItemToList(listId: number, unifiedDocumentId: number): Promise<void> {
    return ApiClient.post<void>(`${this.ITEM_BASE_PATH}/`, {
      parent_list: listId,
      unified_document: unifiedDocumentId,
    });
  }

  static async removeItemFromList(itemId: number): Promise<void> {
    try {
      await ApiClient.delete(`${this.ITEM_BASE_PATH}/${itemId}/`);
    } catch (err) {
      if (err instanceof SyntaxError) return;
      throw err;
    }
  }

  static async getOverview(): Promise<UserCheckResponse> {
    return ApiClient.get<UserCheckResponse>(`${this.BASE_PATH}/overview/`);
  }
}
