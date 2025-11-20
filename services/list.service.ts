import { ApiClient } from './client';
import {
  UserList,
  CreateListRequest,
  UpdateListRequest,
  UserListsResponse,
  UserCheckResponse,
  UserListItem,
  ListApiResponse,
} from '@/types/user-list';

export class ListService {
  private static readonly BASE_PATH = '/api/lists';
  private static readonly ITEM_BASE_PATH = '/api/list';
  static async getUserListsApi(page: number = 1): Promise<UserListsResponse> {
    return ApiClient.get<UserListsResponse>(`${this.BASE_PATH}/?page=${page}`);
  }

  static async getListByIdApi(listId: number): Promise<UserList> {
    return ApiClient.get<UserList>(`${this.BASE_PATH}/${listId}/`);
  }

  static async getListItemsApi(
    listId: number,
    params?: { page?: number; pageSize?: number }
  ): Promise<ListApiResponse<UserListItem>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.pageSize) query.append('page_size', params.pageSize.toString());
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return ApiClient.get<ListApiResponse<UserListItem>>(
      `${this.ITEM_BASE_PATH}/${listId}/${queryString}`
    );
  }

  static async createListApi(data: CreateListRequest): Promise<UserList> {
    return ApiClient.post<UserList>(`${this.BASE_PATH}/`, data);
  }

  static async updateListApi(listId: number, data: UpdateListRequest): Promise<UserList> {
    return ApiClient.patch<UserList>(`${this.BASE_PATH}/${listId}/`, data);
  }

  private static async handleDeleteApi(path: string): Promise<void> {
    try {
      await ApiClient.delete(path);
    } catch (err) {
      if (err instanceof SyntaxError) return;
      throw err;
    }
  }

  static async deleteList(listId: number): Promise<void> {
    return this.handleDeleteApi(`${this.BASE_PATH}/${listId}/`);
  }

  static async addItemToListApi(listId: number, unifiedDocumentId: number): Promise<void> {
    return ApiClient.post<void>(`${this.ITEM_BASE_PATH}/`, {
      parent_list: listId,
      unified_document: unifiedDocumentId,
    });
  }

  static async removeItemFromList(itemId: number): Promise<void> {
    return this.handleDeleteApi(`${this.ITEM_BASE_PATH}/${itemId}/`);
  }

  static async getOverviewApi(): Promise<UserCheckResponse> {
    return ApiClient.get<UserCheckResponse>(`${this.BASE_PATH}/overview/`);
  }
}
