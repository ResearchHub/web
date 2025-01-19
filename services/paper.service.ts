import { ApiClient } from './client'
import { isDOI } from '@/utils/doi'
import { Work, transformWork } from '@/types/work'

interface CreateByOpenAlexIdResponse {
  paper_id: number
}

export class PaperService {
  private static readonly BASE_PATH = '/api/paper'

  // TODO: Remove this
  static async createByOpenAlexId(openalexId: string) {
    return ApiClient.post<CreateByOpenAlexIdResponse>(
      `${this.BASE_PATH}/create_by_openalex_id/`,
      { openalex_id: openalexId }
    )
  }

  static async get(identifier: string): Promise<Work> {
    let response;
    
    if (isDOI(identifier)) {
      response = await ApiClient.get(`${this.BASE_PATH}/retrieve_by_doi/?doi=${identifier}`);
    } else {
      response = await ApiClient.get(`${this.BASE_PATH}/${identifier}/`);
    }

    return transformWork(response);
  }
} 