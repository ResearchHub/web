import { ApiClient } from './client'

interface CreateByOpenAlexIdResponse {
  paper_id: number
}

export class PaperService {
  private static readonly BASE_PATH = '/api/paper'

  static async createByOpenAlexId(openalexId: string) {
    return ApiClient.post<CreateByOpenAlexIdResponse>(
      `${this.BASE_PATH}/create_by_openalex_id/`,
      { openalex_id: openalexId }
    )
  }
} 