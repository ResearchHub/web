import { ID } from '@/types/root';
import { ListItem } from '@/services/listItem.service';
import { ApiClient } from '@/services/client';
import { getPaginatedQueryParams, PaginatedParams, PaginatedResult } from '@/lib/utils';

export const TYPES_SUPPORTING_LISTS = ['PAPER', 'GRANT', 'PREREGISTRATION'];

export type ListItemsSortBy = '-created_date' | 'created_date' | 'name' | '-name';

export type ListsSortBy =
  | 'name'
  | '-name'
  | 'created_date'
  | '-created_date'
  | 'updated_date'
  | '-updated_date';

export interface List {
  id: ID;
  name: string;
  items?: ListItem[];
  created_date: string;
  updated_date: string;
}

export interface PaginatedListsResult extends PaginatedResult {
  results: List[];
}

export type CreateListParams = {
  name: string;
};

export type GetListsParams = PaginatedParams & { order?: ListsSortBy };

export type GetListParams = {
  id?: ID;
  items_order?: ListItemsSortBy;
};

export type DeleteListParams = {
  id: ID;
};

export type UpdateListParams = {
  id: ID;
  name?: string;
};

export default class ListService {
  private static readonly basePath = '/api/list';

  // =================== API ===================

  // GET /api/list/ — get lists
  static async getLists(params: GetListsParams): Promise<PaginatedListsResult> {
    try {
      const path = this.getPath(undefined, getPaginatedQueryParams(params, true) as string);

      return await ApiClient.get<PaginatedListsResult>(
        params.order ? `${path}?order=${params.order}` : path
      );
    } catch (e) {
      throw new Error(`Failed to get lists: ${this.getErrorMsg(e)}`);
    }
  }

  // GET /api/list/{id}/ — get a list
  static async getList(params: GetListParams): Promise<List> {
    try {
      const path = this.getPath(params.id);

      return await ApiClient.get<List>(
        params.items_order ? `${path}?items_order=${params.items_order}` : path
      );
    } catch (e) {
      throw new Error(`Failed to get list: ${this.getErrorMsg(e)}`);
    }
  }

  // POST /api/list/ — create a list
  static async createList(params: CreateListParams): Promise<List> {
    try {
      return await ApiClient.post<List>(this.getPath(), params);
    } catch (e) {
      throw new Error(`Failed to create list: ${this.getErrorMsg(e)}`);
    }
  }

  // DELETE /api/list/{id}/ — delete a list
  static async deleteList(params: DeleteListParams): Promise<void> {
    try {
      await ApiClient.delete(this.getPath(params.id));
    } catch (e) {
      throw new Error(`Failed to delete list: ${this.getErrorMsg(e)}`);
    }
  }

  // PATCH /api/list/{id}/ — update a list
  static async updateList(params: UpdateListParams): Promise<List> {
    try {
      return await ApiClient.patch<List>(this.getPath(params.id), params);
    } catch (e) {
      throw new Error(`Failed to update list: ${this.getErrorMsg(e)}`);
    }
  }

  // ================= HELPERS =================

  static getErrorMsg(error: any): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'An unknown error occurred';
  }

  static getPath(id?: ID, query?: string): string {
    if (query) {
      return `${this.basePath}?${query}`;
    }

    if (id) {
      return `${this.basePath}/${id}/`;
    }

    return `${this.basePath}/`;
  }
}
