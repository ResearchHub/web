import { ApiClient } from './client';
import {
  UserList,
  CreateListRequest,
  UpdateListRequest,
  UserListsResponse,
  UserListItem,
  ListApiResponse,
  ApiUserCheckResponse,
  UserListsOverviewResponse,
  transformUserListsOverview,
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
    return ApiClient.get<UserListsResponse>(`${this.BASE_PATH}/${queryString}`);
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
      `${this.BASE_PATH}/${listId}/item/${queryString}`
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
    return ApiClient.post<void>(`${this.BASE_PATH}/${listId}/item/`, {
      parent_list: listId,
      unified_document: unifiedDocumentId,
    });
  }

  static async removeItemFromList(listId: number, itemId: number): Promise<void> {
    return this.handleDeleteApi(`${this.BASE_PATH}/${listId}/item/${itemId}/`);
  }

  static async getOverviewApi(): Promise<UserListsOverviewResponse> {
    const response = await ApiClient.get<ApiUserCheckResponse>(`${this.BASE_PATH}/overview/`);
    return transformUserListsOverview(response);
  }
}
