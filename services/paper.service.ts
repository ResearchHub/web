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
}
