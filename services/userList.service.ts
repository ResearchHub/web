import { ApiClient } from './client';
import {
  transformUserList,
  transformListDocument,
  transformUserListWithDocuments,
} from '@/types/userList';
import type {
  UserList,
  UserListWithDocuments,
  ListDocument,
  CreateUserListParams,
  UpdateUserListParams,
  AddDocumentToListParams,
  RemoveDocumentFromListParams,
  AddPermissionParams,
  RemovePermissionParams,
  UserListListResponse,
  ListVisibility,
} from '@/types/userList';
import { ID } from '@/types/root';
import { ApiError } from './types';

export class UserListError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'UserListError';
  }
}

export class UserListService {
  private static readonly BASE_PATH = '/api/lists';

  /**
   * Fetches all lists for the current user
   * @param params - Optional query parameters
   * @throws {UserListError} When the request fails
   */
  static async getUserLists(params?: {
    visibility?: ListVisibility;
    page?: number;
    pageSize?: number;
  }): Promise<UserListListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.visibility) queryParams.append('visibility', params.visibility);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('page_size', params.pageSize.toString());

      const response = await ApiClient.get<any>(`${this.BASE_PATH}/?${queryParams.toString()}`);

      return {
        count: response.count || 0,
        next: response.next || null,
        previous: response.previous || null,
        results: response.results.map(transformUserList),
      };
    } catch (error) {
      const { data = {} } = error instanceof ApiError ? JSON.parse(error.message) : {};
      const errorMsg = data?.detail || 'Failed to fetch user lists';
      throw new UserListError(errorMsg);
    }
  }

  /**
   * Fetches a specific list by ID
   * @param listId - The ID of the list to fetch
   * @throws {UserListError} When the request fails or parameters are invalid
   */
  static async getUserList(listId: string): Promise<UserListWithDocuments> {
    if (!listId) {
      throw new UserListError('Missing list ID', 'INVALID_PARAMS');
    }

    try {
      const response = await ApiClient.get<any>(`${this.BASE_PATH}/${listId}/`);
      return transformUserListWithDocuments(response);
    } catch (error) {
      const { data = {} } = error instanceof ApiError ? JSON.parse(error.message) : {};
      const errorMsg = data?.detail || 'Failed to fetch user list';
      throw new UserListError(errorMsg);
    }
  }

  /**
   * Creates a new user list
   * @param params - List creation parameters
   * @throws {UserListError} When the request fails or parameters are invalid
   */
  static async createUserList(params: CreateUserListParams): Promise<UserList> {
    if (!params.title) {
      throw new UserListError('Title is required', 'INVALID_PARAMS');
    }

    try {
      const response = await ApiClient.post<any>(`${this.BASE_PATH}/`, params);
      return transformUserList(response);
    } catch (error) {
      const { data = {} } = error instanceof ApiError ? JSON.parse(error.message) : {};
      const errorMsg = data?.detail || 'Failed to create user list';
      throw new UserListError(errorMsg);
    }
  }

  /**
   * Updates an existing user list
   * @param listId - The ID of the list to update
   * @param params - Update parameters
   * @throws {UserListError} When the request fails or parameters are invalid
   */
  static async updateUserList(listId: string, params: UpdateUserListParams): Promise<UserList> {
    if (!listId) {
      throw new UserListError('Missing list ID', 'INVALID_PARAMS');
    }

    try {
      const response = await ApiClient.patch<any>(`${this.BASE_PATH}/${listId}/`, params);
      return transformUserList(response);
    } catch (error) {
      const { data = {} } = error instanceof ApiError ? JSON.parse(error.message) : {};
      const errorMsg = data?.detail || 'Failed to update user list';
      throw new UserListError(errorMsg);
    }
  }

  /**
   * Deletes a user list
   * @param listId - The ID of the list to delete
   * @throws {UserListError} When the request fails or parameters are invalid
   */
  static async deleteUserList(listId: string): Promise<void> {
    if (!listId) {
      throw new UserListError('Missing list ID', 'INVALID_PARAMS');
    }

    try {
      await ApiClient.delete(`${this.BASE_PATH}/${listId}/`);
    } catch (error) {
      const { data = {} } = error instanceof ApiError ? JSON.parse(error.message) : {};
      const errorMsg = data?.detail || 'Failed to delete user list';
      throw new UserListError(errorMsg);
    }
  }

  /**
   * Adds a document to a list
   * @param params - Add document parameters
   * @throws {UserListError} When the request fails or parameters are invalid
   */
  static async addDocumentToList(params: AddDocumentToListParams): Promise<ListDocument> {
    if (!params.listId || !params.documentId || !params.documentType) {
      throw new UserListError('Missing required parameters', 'INVALID_PARAMS');
    }

    try {
      const response = await ApiClient.post<any>(
        `${this.BASE_PATH}/${params.listId}/add_document/`,
        {
          document_id: params.documentId,
          document_type: params.documentType,
        }
      );
      return transformListDocument(response);
    } catch (error) {
      const { data = {} } = error instanceof ApiError ? JSON.parse(error.message) : {};
      const errorMsg = data?.detail || 'Failed to add document to list';
      throw new UserListError(errorMsg);
    }
  }

  /**
   * Removes a document from a list
   * @param params - Remove document parameters
   * @throws {UserListError} When the request fails or parameters are invalid
   */
  static async removeDocumentFromList(params: RemoveDocumentFromListParams): Promise<void> {
    if (!params.listId || !params.documentId) {
      throw new UserListError('Missing required parameters', 'INVALID_PARAMS');
    }

    try {
      await ApiClient.delete(
        `${this.BASE_PATH}/${params.listId}/remove_document/${params.documentId}/`
      );
    } catch (error) {
      const { data = {} } = error instanceof ApiError ? JSON.parse(error.message) : {};
      const errorMsg = data?.detail || 'Failed to remove document from list';
      throw new UserListError(errorMsg);
    }
  }

  /**
   * Adds permission for a user to access a list
   * @param params - Add permission parameters
   * @throws {UserListError} When the request fails or parameters are invalid
   */
  static async addPermission(params: AddPermissionParams): Promise<void> {
    if (!params.listId || !params.userId || !params.permissionLevel) {
      throw new UserListError('Missing required parameters', 'INVALID_PARAMS');
    }

    try {
      await ApiClient.post(`${this.BASE_PATH}/${params.listId}/add_permission/`, {
        user_id: params.userId,
        permission_level: params.permissionLevel,
      });
    } catch (error) {
      const { data = {} } = error instanceof ApiError ? JSON.parse(error.message) : {};
      const errorMsg = data?.detail || 'Failed to add permission';
      throw new UserListError(errorMsg);
    }
  }

  /**
   * Removes permission for a user to access a list
   * @param params - Remove permission parameters
   * @throws {UserListError} When the request fails or parameters are invalid
   */
  static async removePermission(params: RemovePermissionParams): Promise<void> {
    if (!params.listId || !params.userId) {
      throw new UserListError('Missing required parameters', 'INVALID_PARAMS');
    }

    try {
      await ApiClient.post(`${this.BASE_PATH}/${params.listId}/remove_permission/`, {
        user_id: params.userId,
      });
    } catch (error) {
      const { data = {} } = error instanceof ApiError ? JSON.parse(error.message) : {};
      const errorMsg = data?.detail || 'Failed to remove permission';
      throw new UserListError(errorMsg);
    }
  }

  /**
   * Reorders documents in a list
   * @param listId - The ID of the list
   * @param documentIds - Array of document IDs in the desired order
   * @throws {UserListError} When the request fails or parameters are invalid
   */
  static async reorderListDocuments(listId: string, documentIds: ID[]): Promise<void> {
    if (!listId || !documentIds.length) {
      throw new UserListError('Missing required parameters', 'INVALID_PARAMS');
    }

    try {
      await ApiClient.patch(`${this.BASE_PATH}/${listId}/reorder/`, {
        document_ids: documentIds,
      });
    } catch (error) {
      const { data = {} } = error instanceof ApiError ? JSON.parse(error.message) : {};
      const errorMsg = data?.detail || 'Failed to reorder list documents';
      throw new UserListError(errorMsg);
    }
  }

  /**
   * Fetches a shared list by share token (public access)
   * @param shareToken - The share token for the list
   * @throws {UserListError} When the request fails or parameters are invalid
   */
  static async getSharedList(shareToken: string): Promise<UserListWithDocuments> {
    if (!shareToken) {
      throw new UserListError('Missing share token', 'INVALID_PARAMS');
    }

    try {
      const response = await ApiClient.get<any>(`/shared/list/${shareToken}/`);
      return transformUserListWithDocuments(response);
    } catch (error) {
      const { data = {} } = error instanceof ApiError ? JSON.parse(error.message) : {};
      const errorMsg = data?.detail || 'Failed to fetch shared list';
      throw new UserListError(errorMsg);
    }
  }
}
