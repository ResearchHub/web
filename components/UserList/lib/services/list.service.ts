import { ApiClient } from '@/services/client';
import { isJsonParseError } from '@/services/lib/serviceUtils';
import {
  UserList,
  CreateListRequest,
  UpdateListRequest,
  UserListsResponse,
  UserListItem,
  ApiUserListItemDTO,
  ApiUserList,
  ApiUserListsResponse,
  ApiUserCheckResponse,
  UserListsOverviewResponse,
  transformUserListsOverview,
  transformUserListsResponse,
  transformUserList,
  transformUserListItem,
} from '@/components/UserList/lib/user-list';
import { ID } from '@/types/root';

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

  static async getListByIdApi(id: ID): Promise<UserList> {
    const response = await ApiClient.get<ApiUserList>(`${this.BASE_PATH}/${id}/`);
    return transformUserList(response);
  }

  static async getListItemsApi(
    id: ID,
    params?: { page?: number; pageSize?: number }
  ): Promise<{
    results: UserListItem[];
    count?: number;
    next?: string | null;
    previous?: string | null;
  }> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.pageSize) query.append('page_size', params.pageSize.toString());
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await ApiClient.get<{
      results: ApiUserListItemDTO[];
      count?: number;
      next?: string | null;
      previous?: string | null;
    }>(`${this.BASE_PATH}/${id}/item${queryString}`);

    return {
      ...response,
      results: response.results.map(transformUserListItem),
    };
  }

  static async createListApi(data: CreateListRequest): Promise<UserList> {
    const response = await ApiClient.post<ApiUserList>(`${this.BASE_PATH}/`, data);
    return transformUserList(response);
  }

  static async updateListApi(id: ID, data: UpdateListRequest): Promise<UserList> {
    const response = await ApiClient.patch<ApiUserList>(`${this.BASE_PATH}/${id}/`, data);
    return transformUserList(response);
  }

  private static async handleDeleteApi(path: string): Promise<void> {
    try {
      await ApiClient.delete(path);
    } catch (err) {
      if (isJsonParseError(err)) return;
      throw err;
    }
  }

  static async deleteListApi(id: ID): Promise<void> {
    return this.handleDeleteApi(`${this.BASE_PATH}/${id}/`);
  }

  static async addItemToListApi(id: ID, unifiedDocumentId: ID): Promise<{ id: ID }> {
    return ApiClient.post<{ id: ID }>(`${this.BASE_PATH}/${id}/item/`, {
      parent_list: id,
      unified_document: unifiedDocumentId,
    });
  }

  static async removeItemFromListApi(id: ID, itemId: ID): Promise<void> {
    return this.handleDeleteApi(`${this.BASE_PATH}/${id}/item/${itemId}/`);
  }

  static async getOverviewApi(): Promise<UserListsOverviewResponse> {
    const response = await ApiClient.get<ApiUserCheckResponse>(`${this.BASE_PATH}/overview/`);
    return transformUserListsOverview(response);
  }
}
