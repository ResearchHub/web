import { ApiClient } from './client';
import { Work, transformPaper } from '@/types/work';

export class PaperService {
  private static readonly BASE_PATH = '/api/paper';

  static async get(identifier: string): Promise<Work> {
    const response = await ApiClient.get(`${this.BASE_PATH}/${identifier}/`);
    return transformPaper(response);
  }
}
