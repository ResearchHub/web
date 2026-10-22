import { ApiClient } from './client';
import { transformCoverImageGeneration, type CoverImageGeneration } from '@/types/coverImage';

export interface GenerateCoverImagesParams {
  documentType: 'PREREGISTRATION' | 'GRANT';
  title: string;
  subtitle?: string;
  organization?: string;
  fundingAmountUsd?: number | null;
  /** Storage key of an uploaded logo to place in the banners. */
  logoKey?: string | null;
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
      logo_key: params.logoKey ?? '',
    });
    return transformCoverImageGeneration(response);
  }

  static async get(id: number): Promise<CoverImageGeneration> {
    const response = await ApiClient.get<any>(`${this.BASE_PATH}/${id}/`);
    return transformCoverImageGeneration(response);
  }
}
