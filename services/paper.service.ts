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

    const a = {
      id: 4865,
      authors: [],
      abstract_src_markdown: null,
      boost_amount: 0,
      first_preview: null,
      score: 9,
      purchases: [],
      unified_document: {
        id: 4602,
        documents: { id: 4602 },
        reviews: { avg: 3.5, count: 2 },
        is_removed: false,
        document_type: 'PAPER',
      },
      uploaded_by: {
        id: 33901,
        author_profile: {
          id: 931964,
          first_name: 'Maulik',
          last_name: 'Dhandha',
          profile_image:
            'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/27/blob_yxyA3Mo',
          is_verified: true,
        },
        first_name: 'Maulik',
        last_name: 'Dhandha',
        is_verified: true,
      },
      file: null,
      pdf_url: null,
      pdf_copyright_allows_display: true,
      peer_reviews: [],
      version: 1,
      version_list: [
        { version: 1, paper_id: 9326306, published_date: '2025-03-20', is_latest: true },
      ],
      created_date: '2025-03-25T17:22:39.479241Z',
      discussion_count: 3,
      pdf_file_extract: null,
      is_open_access: null,
      oa_status: null,
      external_source: null,
      title:
        'Fat fraction and iron concentration in lumbar vertebral bone marrow in the UK Biobank',
      doi: '10.1101/2025.03.19.25324245',
      paper_title:
        'Fat fraction and iron concentration in lumbar vertebral bone marrow in the UK Biobank',
      paper_publish_date: '2025-03-20',
      raw_authors: [
        { last_name: 'Parkinson', first_name: 'James R.' },
        { last_name: 'Thanaj', first_name: 'Marjola' },
        { last_name: 'Basty', first_name: 'Nicolas' },
        { last_name: 'Whitcher', first_name: 'Brandon' },
        { last_name: 'Thomas', first_name: 'E. Louise' },
        { last_name: 'Bell', first_name: 'Jimmy D.' },
      ],
      abstract:
        'Objectives This study aimed to assess the vertebrae bone marrow (VBM) fat and iron concentration in the UK Biobank imaging cohort (N = 26,531) using magnetic resonance imaging (MRI).\nMethods We measured the VBM fat using two approaches: fat fraction (FF) measured from Dixon MRI images and proton density fat fraction (PDFF) from multi-echo MRI scans, along with VBM iron concentration from multi-echo MRI images. We investigated sex-specific correlations between VBM measures and a range of anthropometric and lifestyle factors. Linear regression models were used to explore relationships between VBM measures, anthropometric and lifestyle factors, as well as disease status including osteoporosis and type-2 diabetes (T2D).\nResults VBM FF and PDFF were higher, while VBM iron concentration was lower in participants with osteoporosis and T2D (p < 0.00017). VBM FF and PDFF were positively associated with VAT, smoking, and T2D and were inversely associated with L1-L4 bone mineral density (BMD) and total skeletal muscle (p < 0.00017). VBM iron concentration was significantly positively associated with VAT, L1-L4 BMD, and alcohol intake.\nDiscussion These findings enhance our understanding of VBM measures in metabolic health assessments, highlighting their role as potential indicators of metabolic health.\nWhat is already known?Variations in bone marrow adipose tissue are linked to age, body composition, and clinical conditions such as type 2 diabetes, osteoporosis, and sarcopenia.Fat fraction (FF) derived from water-fat MRI is a robust method for assessing vertebral bone marrow (VBM) fat, which correlates with metabolic health markers.What does the study add?This study demonstrates sex-specific correlations of VBM fat fraction with age, body composition, and metabolic markers in the UK Biobank. It highlights relationships between VBM fat fraction and conditions such as sarcopenia, frailty, osteoporosis, type 2 diabetes, and back pain.This study identifies significant correlations between VBM iron concentration and anthropometric and disease variables, providing new insights into the role of iron deposition in bone health and metabolic processes.How might these results change the direction of research or the focus of clinical practice?The findings underscore the importance of including VBM fat fraction and iron concentration as imaging biomarkers in studies exploring metabolic and skeletal health.This study aims to shed light on sex-specific and condition-specific associations and may inform targeted interventions for metabolic and musculoskeletal conditions, especially in ageing populations, and encourage further research into the interplay between adiposity, bone health, and metabolic disorders.',
      url: 'https://www.medrxiv.org/content/10.1101/2025.03.19.25324245v1.full-text',
      pdf_license: 'unknown',
      slug: 'fat-fraction-and-iron-concentration-in-lumbar-vertebral-bone-marrow-in-the-uk-biobank',
      work_type: null,
      user_vote: null,
    };

    return transformPaper(a);
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
    });
  }
}
