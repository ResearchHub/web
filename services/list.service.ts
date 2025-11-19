import { ApiClient } from './client';
import {
  UserList,
  CreateListRequest,
  UpdateListRequest,
  UserListsResponse,
  UserCheckResponse,
  UserListItem,
} from '@/types/user-list';

interface ListApiResponse<T> {
  results: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export class ListService {
  private static readonly BASE_PATH = '/api/user_list';
  private static readonly ITEM_BASE_PATH = '/api/user_list_item';

  static async getUserLists(page: number = 1): Promise<UserListsResponse> {
    return ApiClient.get<UserListsResponse>(`${this.BASE_PATH}/?page=${page}`);
  }

  static async getListById(listId: number): Promise<UserList> {
    return ApiClient.get<UserList>(`${this.BASE_PATH}/${listId}/`);
  }

  static async getListItems(
    listId: number,
    params?: { page?: number; pageSize?: number }
  ): Promise<ListApiResponse<UserListItem>> {
    const query = new URLSearchParams({ parent_list: listId.toString() });
    if (params?.page) query.append('page', params.page.toString());
    if (params?.pageSize) query.append('page_size', params.pageSize.toString());
    return ApiClient.get<ListApiResponse<UserListItem>>(`${this.ITEM_BASE_PATH}/?${query}`);
  }

  static async createList(data: CreateListRequest): Promise<UserList> {
    return ApiClient.post<UserList>(`${this.BASE_PATH}/`, data);
  }

  static async updateList(listId: number, data: UpdateListRequest): Promise<UserList> {
    return ApiClient.patch<UserList>(`${this.BASE_PATH}/${listId}/`, data);
  }

  private static async handleDelete(path: string): Promise<void> {
    try {
      await ApiClient.delete(path);
    } catch (err) {
      if (err instanceof SyntaxError) return;
      throw err;
    }
  }

  static async deleteList(listId: number): Promise<void> {
    return this.handleDelete(`${this.BASE_PATH}/${listId}/`);
  }

  static async addItemToList(listId: number, unifiedDocumentId: number): Promise<void> {
    return ApiClient.post<void>(`${this.ITEM_BASE_PATH}/`, {
      parent_list: listId,
      unified_document: unifiedDocumentId,
    });
  }

  static async removeItemFromList(itemId: number): Promise<void> {
    return this.handleDelete(`${this.ITEM_BASE_PATH}/${itemId}/`);
  }

  static async getOverview(): Promise<UserCheckResponse> {
    return ApiClient.get<UserCheckResponse>(`${this.BASE_PATH}/overview/`);
  }
}
