import { ApiClient } from './client';
import {
  UserList,
  CreateListRequest,
  UpdateListRequest,
  UserListsResponse,
} from '@/types/user-list';

export class ListService {
  private static readonly BASE_PATH = '/api/lists';

  static async getUserLists(page: number = 1): Promise<UserListsResponse> {
    return ApiClient.get<UserListsResponse>(`${this.BASE_PATH}/?page=${page}`);
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
