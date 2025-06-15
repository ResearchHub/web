import { parseUserSavedPapers } from '@/components/UserSaved/lib/utils';
import { ApiClient } from './client';
import { UserSavedIdentifier } from '@/types/userSaved';
import { FeedEntry } from '@/types/feed';
interface ModifyListParams {
  list_name: string;
  u_doc_id?: number | null;
  paper_id?: number | null;
  delete_flag: boolean;
}

interface SucceededFlag {
  success: boolean;
}

export class UserSavedService {
  private static readonly path: string = '/user_saved/';

  static async createUserList(listName: string): Promise<SucceededFlag> {
    return ApiClient.post(this.path, { list_name: listName });
  }

  static async getUserLists(): Promise<string[]> {
    return ApiClient.get(this.path);
  }

  static async deleteList(listName: string): Promise<SucceededFlag> {
    return ApiClient.delete(this.path, { list_name: listName });
  }

  static async getListItems(listName: string): Promise<FeedEntry[]> {
    const raw: any = await ApiClient.get(this.path + `?list_name=${encodeURIComponent(listName)}`);
    return parseUserSavedPapers(raw);
  }

  static async addListItem(
    listName: string,
    identifier: UserSavedIdentifier
  ): Promise<SucceededFlag> {
    const params: ModifyListParams = {
      delete_flag: false,
      u_doc_id: identifier.idType === 'uDocId' ? identifier.id : null,
      paper_id: identifier.idType === 'paperId' ? identifier.id : null,
      list_name: listName,
    };
    return ApiClient.put(this.path, params);
  }

  static async deleteListItem(
    listName: string,
    identifier: UserSavedIdentifier
  ): Promise<SucceededFlag> {
    const params: ModifyListParams = {
      delete_flag: true,
      u_doc_id: identifier.idType === 'uDocId' ? identifier.id : null,
      paper_id: identifier.idType === 'paperId' ? identifier.id : null,
      list_name: listName,
    };
    return ApiClient.put(this.path, params);
  }

  static async getListsContaining(identifier: UserSavedIdentifier): Promise<string[]> {
    const suffix =
      identifier.idType === 'paperId' ? `?paper_id=${identifier.id}` : `?u_doc_id=${identifier.id}`;
    return ApiClient.get(this.path + suffix);
  }
}
