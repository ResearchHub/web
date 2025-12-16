import { ApiClient } from './client';
import { isDOI } from '@/utils/doi';
import { Work, transformPaper } from '@/types/work';

interface CreateByOpenAlexIdResponse {
  paper_id: number;
}

interface Author {
  id: number;
  isCorrespondingAuthor: boolean;
  author_position?: string;
  institution_id?: number;
}

interface Declaration {
  declaration_type: string;
  accepted: boolean;
}

export interface CreatePaperPayload {
  title: string;
  abstract: string;
  fileUrl?: string;
  fileObjectKey?: string;
  pdfUrl?: string;
  authors: Array<{
    id: number;
    isCorrespondingAuthor: boolean;
    author_position?: string;
    institution_id?: number;
  }>;
  hubs: number[];
  changeDescription: string;
  previousPaperId?: number;
  declarations?:
    | Declaration[]
    | {
        termsAccepted: boolean;
        licenseAccepted: boolean;
        authorshipConfirmed: boolean;
        originalityConfirmed: boolean;
      };
}

interface CreatePaperResponse {
  id: number;
  title: string;
}

interface CheckoutSessionResponse {
  url: string;
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
  private static readonly PAYMENT_PATH = '/api/payment';

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

  static async create(payload: CreatePaperPayload): Promise<CreatePaperResponse> {
    // Create payload in the format that the API expects (following the working example)
    const apiPayload: any = {
      title: payload.title,
      abstract: payload.abstract,
      change_description: payload.changeDescription,
    };

    // Handle declarations
    if (payload.declarations) {
      if (!Array.isArray(payload.declarations)) {
        // Transform from new format to API format
        apiPayload.declarations = [
          {
            declaration_type: 'ACCEPT_TERMS_AND_CONDITIONS',
            accepted: payload.declarations.termsAccepted,
          },
          {
            declaration_type: 'AUTHORIZE_CC_BY_4_0',
            accepted: payload.declarations.licenseAccepted,
          },
          {
            declaration_type: 'CONFIRM_AUTHORS_RIGHTS',
            accepted: payload.declarations.authorshipConfirmed,
          },
          {
            declaration_type: 'CONFIRM_ORIGINALITY_AND_COMPLIANCE',
            accepted: payload.declarations.originalityConfirmed,
          },
        ];
      } else {
        apiPayload.declarations = payload.declarations;
      }
    }

    // Set pdf_url
    if (payload.fileUrl) {
      apiPayload.pdf_url = payload.fileUrl;
    }

    // Add previous_paper_id if provided (for creating new versions)
    if (payload.previousPaperId) {
      apiPayload.previous_paper_id = payload.previousPaperId;
    }

    // Format authors exactly as in the working example
    apiPayload.authors = payload.authors.map((author) => {
      const authorObj: any = {
        id: author.id,
        author_position: author.author_position || 'middle',
        is_corresponding: author.isCorrespondingAuthor,
      };

      if (author.institution_id) {
        authorObj.institution_id = author.institution_id;
      }

      return authorObj;
    });

    // Format hub_ids exactly as in the working example
    apiPayload.hub_ids = payload.hubs;

    console.log('Paper API payload:', JSON.stringify(apiPayload, null, 2));

    // Use the correct endpoint
    return ApiClient.post<CreatePaperResponse>(
      `${this.BASE_PATH}/create_researchhub_paper/`,
      apiPayload
    );
  }

  /**
   * Create a checkout session for journal submission payment
   */
  static async payForJournalSubmission(
    paperId: number,
    successUrl: string,
    failureUrl: string
  ): Promise<CheckoutSessionResponse> {
    return ApiClient.post<CheckoutSessionResponse>(`${this.PAYMENT_PATH}/checkout-session/`, {
      success_url: successUrl,
      failure_url: failureUrl,
      paper: paperId,
      purpose: 'APC',
    });
  }

  /**
   * Publish a preprint paper to the ResearchHub Journal. Once published, the paper
   * becomes the version of record and its latest version will have the
   *  `publicationStatus` set to `PUBLISHED` as well as `isVersionOfRecord = true`.
   *
   * @param paperId - The id of the paper to publish
   */
  static async publishPaper(paperId: number) {
    return ApiClient.post(`${this.BASE_PATH}/publish_to_researchhub_journal/`, {
      previous_paper_id: paperId,
    });
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

  /**
   * Get similar papers for a given paper
   * API returns: {count: number, results: [paper1, paper2, ...]}
   */
  static async getSimilarPapers(paperId: number): Promise<Work[]> {
    const response = await ApiClient.get<any>(`${this.BASE_PATH}/${paperId}/similar_papers/`);

    // Extract papers array from response (handles {results: [...]} or direct array)
    const papers = Array.isArray(response) ? response : response?.results || [];

    // Transform each paper
    return papers.map(transformPaper);
  }
}
