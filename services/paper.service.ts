import { ApiClient } from './client';
import { isDOI } from '@/utils/doi';
import { Work, transformPaper } from '@/types/work';

export class PaperService {
  private static readonly BASE_PATH = '/api/paper';

  static async get(identifier: string): Promise<Work> {
    let response;

    if (isDOI(identifier)) {
      response = await ApiClient.get(`${this.BASE_PATH}/retrieve_by_doi/?doi=${identifier}`);
    } else {
      response = await ApiClient.get(`${this.BASE_PATH}/${identifier}/`);
    }

    return transformPaper(response);
  }
}
