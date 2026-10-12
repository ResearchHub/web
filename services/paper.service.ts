import { ApiClient } from './client';
import { isDOI } from '@/utils/doi';
import { Work, transformPaper } from '@/types/work';

interface CreateByOpenAlexIdResponse {
  paper_id: number;
}

export interface UpdatePaperMetadataPayload {
  title?: string;
  doi?: string;
  publishedDate?: string; // Will be converted to YYYY-MM-DD format
  hubs?: number[];
  license?: string;
}

export interface UpdatePaperAbstractPayload {
  abstract: string;
}

export class PaperService {
  private static readonly BASE_PATH = '/api/paper';

  // TODO: Remove this
  static async createByOpenAlexId(openalexId: string) {
    return ApiClient.post<CreateByOpenAlexIdResponse>(`${this.BASE_PATH}/create_by_openalex_id/`, {
      openalex_id: openalexId,
    });
  }

  static async get(identifier: string): Promise<Work> {
    let response;

    if (isDOI(identifier)) {
      response = await ApiClient.get(`${this.BASE_PATH}/retrieve_by_doi/?doi=${identifier}`);
    } else {
      response = await ApiClient.get(`${this.BASE_PATH}/${identifier}/`);
    }

    return transformPaper(response);
  }

  /**
   * Update paper metadata
   */
  static async updateMetadata(paperId: number, payload: UpdatePaperMetadataPayload): Promise<Work> {
    const apiPayload: any = {};

    if (payload.title) {
      apiPayload.title = payload.title;
      apiPayload.paper_title = payload.title; // Backend expects both fields
    }

    if (payload.doi) {
      apiPayload.doi = payload.doi;
    }

    if (payload.publishedDate) {
      // Convert from any date format to YYYY-MM-DD
      const date = new Date(payload.publishedDate);
      if (!isNaN(date.getTime())) {
        apiPayload.paper_publish_date = date.toISOString().split('T')[0];
      }
    }

    if (payload.hubs) {
      apiPayload.hubs = payload.hubs;
    }

    if (payload.license) {
      apiPayload.pdf_license = payload.license;
    }

    const response = await ApiClient.patch(`${this.BASE_PATH}/${paperId}/`, apiPayload);
    return transformPaper(response);
  }

  /**
   * Update paper abstract
   */
  static async updateAbstract(paperId: number, payload: UpdatePaperAbstractPayload): Promise<Work> {
    const response = await ApiClient.patch(`${this.BASE_PATH}/${paperId}/`, payload);
    return transformPaper(response);
  }
}
