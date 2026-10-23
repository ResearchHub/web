import { ApiClient } from './client';
import { transformCoverImageGeneration, type CoverImageGeneration } from '@/types/coverImage';

export interface GenerateCoverImagesParams {
  documentType: 'PREREGISTRATION' | 'GRANT';
  title: string;
  subtitle?: string;
  organization?: string;
  fundingAmountUsd?: number | null;
  /** The draft the covers are for; its chat's cover logo is placed in them. */
  noteId?: number | null;
}

/**
 * AI-generated cover images for proposals and RFPs: start a request, then
 * poll it until its images are ready.
 */
export class CoverImageService {
  private static readonly BASE_PATH = '/api/research_ai/cover-images';

  static async generate(params: GenerateCoverImagesParams): Promise<CoverImageGeneration> {
    const response = await ApiClient.post<any>(`${this.BASE_PATH}/`, {
      document_type: params.documentType,
      title: params.title,
      subtitle: params.subtitle ?? '',
      organization: params.organization ?? '',
      funding_amount_usd: params.fundingAmountUsd ?? null,
      note_id: params.noteId ?? null,
    });
    return transformCoverImageGeneration(response);
  }

  static async get(id: number): Promise<CoverImageGeneration> {
    const response = await ApiClient.get<any>(`${this.BASE_PATH}/${id}/`);
    return transformCoverImageGeneration(response);
  }
}
