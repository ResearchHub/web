import { ApiClient } from './client';
import {
  UserList,
  CreateListRequest,
  UpdateListRequest,
  UserListsResponse,
} from '@/types/user-list';

export class ListService {
  private static readonly BASE_PATH = '/api/lists';

  static async getUserLists(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<UserListsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.pageSize) query.append('page_size', params.pageSize.toString());
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return ApiClient.get<UserListsResponse>(`${this.BASE_PATH}/${queryString}`);
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
}
