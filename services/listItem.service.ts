import { ID } from '@/types/root';
import { ApiClient } from '@/services/client';

export interface ListItem {
  id: ID;
  unified_document: ID;
  document_type: string;
  created_date: string;
}

export type CreateListItemParams = {
  parent_list: ID;
  unified_document: ID;
};

export type DeleteListItemParams = {
  id: ID;
};

export default class ListItemService {
  private static readonly basePath = '/api/list_item';

  // =================== API ===================

  // POST /api/list_item/ — create list item and add it to a list
  static async createListItem(params: CreateListItemParams): Promise<ListItem> {
    try {
      return await ApiClient.post<ListItem>(this.getPath(), params);
    } catch (e) {
      throw new Error(`Failed to create list item: ${this.getErrorMsg(e)}`);
    }
  }

  // DELETE /api/list_item/{id}/ — remove list item from a list
  static async deleteListItem(params: DeleteListItemParams): Promise<void> {
    try {
      await ApiClient.delete(this.getPath(params.id));
    } catch (e) {
      throw new Error(`Failed to delete list item: ${this.getErrorMsg(e)}`);
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
