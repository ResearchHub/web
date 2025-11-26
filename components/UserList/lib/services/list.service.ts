import { ApiClient } from '@/services/client';
import {
  UserList,
  CreateListRequest,
  UpdateListRequest,
  UserListsResponse,
  UserListItemDTO,
  ApiUserList,
  ApiUserListsResponse,
  ApiUserCheckResponse,
  UserListsOverviewResponse,
  transformUserListsOverview,
  transformUserListsResponse,
  transformUserList,
} from '@/components/UserList/lib/user-list';

export class ListService {
  private static readonly BASE_PATH = '/api/list';

  static async getUserListsApi(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<UserListsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.pageSize) query.append('page_size', params.pageSize.toString());
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await ApiClient.get<ApiUserListsResponse>(`${this.BASE_PATH}${queryString}`);
    return transformUserListsResponse(response);
  }

  static async getListByIdApi(listId: number): Promise<UserList> {
    const response = await ApiClient.get<ApiUserList>(`${this.BASE_PATH}/${listId}/`);
    return transformUserList(response);
  }

  static async getListItemsApi(
    listId: number,
    params?: { page?: number; pageSize?: number }
  ): Promise<{
    results: UserListItemDTO[];
    count?: number;
    next?: string | null;
    previous?: string | null;
  }> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.pageSize) query.append('page_size', params.pageSize.toString());
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return ApiClient.get<{
      results: UserListItemDTO[];
      count?: number;
      next?: string | null;
      previous?: string | null;
    }>(`${this.BASE_PATH}/${listId}/item${queryString}`);
  }

  static async createListApi(data: CreateListRequest): Promise<UserList> {
    const response = await ApiClient.post<ApiUserList>(`${this.BASE_PATH}/`, data);
    return transformUserList(response);
  }

  static async updateListApi(listId: number, data: UpdateListRequest): Promise<UserList> {
    const response = await ApiClient.patch<ApiUserList>(`${this.BASE_PATH}/${listId}/`, data);
    return transformUserList(response);
  }

  private static async handleDeleteApi(path: string): Promise<void> {
    try {
      await ApiClient.delete(path);
    } catch (err) {
      if (err instanceof SyntaxError) return;
      throw err;
    }
  }

  static async deleteListApi(listId: number): Promise<void> {
    return this.handleDeleteApi(`${this.BASE_PATH}/${listId}/`);
  }

  static async addItemToListApi(listId: number, unifiedDocumentId: number): Promise<void> {
    return ApiClient.post<void>(`${this.BASE_PATH}/${listId}/item/`, {
      parent_list: listId,
      unified_document: unifiedDocumentId,
    });
  }

  static async removeItemFromListApi(listId: number, itemId: number): Promise<void> {
    return this.handleDeleteApi(`${this.BASE_PATH}/${listId}/item/${itemId}/`);
  }

  static async getOverviewApi(): Promise<UserListsOverviewResponse> {
    const response = await ApiClient.get<ApiUserCheckResponse>(`${this.BASE_PATH}/overview/`);
    return transformUserListsOverview(response);
  }
}
