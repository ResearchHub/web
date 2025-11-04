import { ApiClient } from './client';
import {
  UserList,
  UserListDetail,
  UserListItem,
  CreateListRequest,
  UpdateListRequest,
  UserListsResponse,
} from '@/types/user-list';

export class ListService {
  private static readonly BASE_PATH = '/api/user_list/';

  static async getUserLists(): Promise<UserListsResponse> {
    return ApiClient.get<UserListsResponse>(this.BASE_PATH);
  }

  static async getListById(listId: number): Promise<UserListDetail> {
    return ApiClient.get<UserListDetail>(`${this.BASE_PATH}${listId}/`);
  }

  static async createList(data: CreateListRequest): Promise<UserList> {
    return ApiClient.post<UserList>(this.BASE_PATH, data);
  }

  static async updateList(listId: number, data: UpdateListRequest): Promise<UserList> {
    return ApiClient.patch<UserList>(`${this.BASE_PATH}${listId}/`, data);
  }

  static async deleteList(listId: number): Promise<void> {
    await ApiClient.delete(`${this.BASE_PATH}${listId}/`);
  }

  static async addItemToList(listId: number, unifiedDocumentId: number): Promise<UserListItem> {
    return ApiClient.post<UserListItem>(`${this.BASE_PATH}${listId}/items/`, {
      unified_document: unifiedDocumentId,
    });
  }

  static async removeItemFromList(listId: number, itemId: number): Promise<void> {
    await ApiClient.delete(`${this.BASE_PATH}${listId}/items/${itemId}/`);
  }
}
