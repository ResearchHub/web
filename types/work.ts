import { AuthorProfile, transformAuthorProfile } from './authorProfile';
import { ContentMetrics } from './metrics';
import { Journal } from './journal';
import { Topic, transformTopic } from './topic';
import { createTransformer, BaseTransformed } from './transformer';
import { Hub } from './hub';
import { NoteWithContent, transformNoteWithContent } from './note';
import { ProxyService } from '../services/proxy.service';
import { stripHtml } from '../utils/stringUtils';
import { transformUser, TransformedUser } from './user';
import { transformTip, Tip } from './tip';

export type WorkType = 'article' | 'review' | 'preprint' | 'preregistration' | 'funding_request';

export type AuthorPosition = 'first' | 'middle' | 'last';

export type ContentType =
  | 'post'
  | 'paper'
  | 'preregistration'
  | 'question'
  | 'discussion'
  | 'funding_request';

export type FlagReasonKey =
  | 'LOW_QUALITY'
  | 'COPYRIGHT'
  | 'NOT_CONSTRUCTIVE'
  | 'PLAGIARISM'
  | 'ABUSIVE_OR_RUDE'
  | 'SPAM';

export interface Authorship {
  authorProfile: AuthorProfile;
  isCorresponding: boolean;
  position: AuthorPosition;
}

// TODO: Create a transformer function
export type DocumentVersion = {
  paperId: number;
  version: number;
  isLatest: boolean;
  publishedDate: string;
  message: string;
  publicationStatus: string;
  isVersionOfRecord: boolean;
  isResearchHubJournal: boolean;
};

export interface FormatType {
  type: string;
  url: string;
  /**
   * This is a proxied URL for internal use (e.g., to avoid CORS issues when rendering PDFs).
   */
  internalUrl?: string;
}

export interface Enrichment {
  source: string;
  citationCount?: number | null;
  influentialCitationCount?: number | null;
  altmetricScore?: number | null;
  impactScore?: number | null;
  journal?: string | null;
  tldr?: string | null;
  twitterMentions?: number | null;
  newsMentions?: number | null;
}

export interface Work {
  id: number;
  type?: WorkType;
  contentType: ContentType;
  title: string;
  slug: string;
  createdDate: string;
  publishedDate?: string;
  authors: Authorship[];
  abstract: string;
  doi?: string;
  journal?: Journal;
  category?: Topic;
  subcategory?: Topic;
  topics: Topic[];
  formats: FormatType[];
  license?: string;
  pdfCopyrightAllowsDisplay?: boolean;
  figures: Array<{
    url: string;
  }>;
  metrics?: ContentMetrics;
  versions?: DocumentVersion[];
  note?: NoteWithContent;
  image?: string;
  previewContent?: string;
  contentUrl?: string;
  unifiedDocumentId?: number | null;
  postType?: string;
  fundraise?: any;
  tips?: Tip[];
  enrichments?: Enrichment[];
}

export interface FundingRequest extends Work {
  type: 'funding_request';
  contentType: 'funding_request';
  status: 'OPEN' | 'CLOSED' | 'FUNDED';
  amount: number;
  goalAmount: number;
  deadline: string;
  preregistered?: boolean;
  image?: string;
}

// Transformed types
export type TransformedAuthorship = Authorship & BaseTransformed;
export type TransformedJournal = Journal & BaseTransformed;
export type TransformedTopic = Topic & BaseTransformed;
export type TransformedDocumentVersion = DocumentVersion & BaseTransformed;
export type TransformedWork = Work & BaseTransformed;

// Transformers
export const transformAuthorship = createTransformer<any, Authorship>((raw) => ({
  authorProfile: transformAuthorProfile(raw),
  isCorresponding: raw.authorship?.is_corresponding || false,
  position: (raw.authorship?.position as AuthorPosition) || 'middle',
}));

export const transformJournal = (raw: any): TransformedJournal | undefined => {
  // Check for external_source first (legacy format)
  if (raw.external_source) {
    return createTransformer<any, Journal>((raw) => ({
      id: raw.external_source_id || 0,
      name: raw.external_source || '',
      slug: raw.external_source_slug || raw.external_source?.toLowerCase() || '',
      imageUrl: raw.external_source_image || '',
    }))(raw);
  }

  // Check for journal property (new format)
  if (raw.journal) {
    return createTransformer<any, Journal>((raw) => ({
      id: raw.journal.id || 0,
      name: raw.journal.name || '',
      slug: raw.journal.slug || raw.journal.name?.toLowerCase() || '',
      imageUrl: raw.journal.image || '',
    }))(raw);
  }

  return undefined;
};

export const transformDocumentVersion = createTransformer<any, DocumentVersion>((raw) => ({
  paperId: raw.paper_id,
  version: typeof raw.version === 'number' ? raw.version : parseFloat(raw.version) || 0,
  isLatest: raw.is_latest,
  publishedDate: raw.published_date,
  message: raw.message || '',
  publicationStatus: raw.publication_status || '',
  isVersionOfRecord: raw.is_version_of_record || false,
  isResearchHubJournal: !!raw.publication_status,
}));

export const transformWork = createTransformer<any, Work>((raw) => {
  // Process fullName fields from raw authors if needed
  const processedAuthors =
    Array.isArray(raw.authors) && raw.authors.length > 0
      ? raw.authors.map(transformAuthorship)
      : Array.isArray(raw.raw_authors) && raw.raw_authors.length > 0
        ? raw.raw_authors.map((author: any) => ({
            authorProfile: {
              id: 0, // We don't have a real ID for raw authors
              fullName: `${author.first_name || ''} ${author.last_name || ''}`.trim(),
              profileImage: '',
              headline: '',
              profileUrl: '',
              isClaimed: false,
            },
            isCorresponding: false,
            position: 'middle' as AuthorPosition,
          }))
        : [];

  // Transform tips from purchases
  const tips = Array.isArray(raw.purchases) ? raw.purchases.map(transformTip) : [];

  return {
    id: raw.id,
    type: raw.work_type as WorkType,
    contentType: raw.content_type as ContentType,
    title: stripHtml(raw.title || raw.paper_title || ''),
    slug: raw.slug,
    createdDate: raw.created_date,
    publishedDate: raw.paper_publish_date,
    authors: processedAuthors,
    abstract: stripHtml(raw.abstract || raw.renderable_text || ''),
    doi: raw.doi,
    journal: transformJournal(raw),
    topics: Array.isArray(raw.hubs)
      ? raw.hubs.map((hub: Hub) => ({
          id: hub.id,
          name: hub.name || '',
          slug: hub.slug,
        }))
      : raw.hub
        ? [
            {
              id: raw.hub.id || 0,
              name: raw.hub.name || '',
              slug: raw.hub.slug,
            },
          ]
        : [],
    formats: raw.file
      ? [...(raw.formats || []), { type: 'PDF', url: raw.file, internalUrl: raw.file }]
      : raw.pdf_url
        ? [
            ...(raw.formats || []),
            {
              type: 'PDF',
              url: raw.pdf_url,
              internalUrl: ProxyService.generateProxyUrl(raw.pdf_url),
            },
          ]
        : (raw.formats || []).map((format: FormatType) => ({
            ...format,
            internalUrl:
              format.type === 'PDF' ? ProxyService.generateProxyUrl(format.url) : undefined,
          })),
    license: raw.pdf_license,
    pdfCopyrightAllowsDisplay: raw.pdf_copyright_allows_display,
    figures: raw.first_preview
      ? [
          {
            url: raw.first_preview.file,
          },
        ]
      : [],
    versions: Array.isArray(raw.version_list) ? raw.version_list.map(transformDocumentVersion) : [],
    metrics: {
      votes: raw.metrics?.votes || raw.score || 0,
      adjustedScore: raw.adjusted_score,
      comments: raw.metrics?.comments || raw.discussion_count || 0,
      saves: raw.metrics?.saves || raw.saves_count || 0,
      reviewScore: raw?.unified_document?.reviews?.avg || 0,
      reviews: raw?.unified_document?.reviews?.count || 0,
      earned: raw.earned || 0,
      views: raw.metrics?.views || raw.views_count || 0,
    },
    unifiedDocumentId: raw?.unified_document?.id || null,
    postType: raw.type || raw.unified_document?.document_type,
    fundraise: raw.fundraise,
    note: raw.note ? transformNoteWithContent(raw.note) : undefined,
    previewContent: raw.full_markdown || '',
    contentUrl: raw.post_src,
    tips: tips,
    image: raw.image_url,
    enrichments: raw.enrichments || [],
  };
});

export const transformPost = createTransformer<any, Work>((raw) => ({
  ...transformWork(raw),
  contentType:
    raw.unified_document?.document_type === 'PREREGISTRATION' || raw.type === 'PREREGISTRATION'
      ? 'preregistration'
      : raw.unified_document?.document_type === 'GRANT' || raw.type === 'GRANT'
        ? 'funding_request'
        : 'post',
  note: raw.note ? transformNoteWithContent(raw.note) : undefined,
  publishedDate: raw.created_date, // Posts use created_date for both
  previewContent: raw.full_markdown || '',
  contentUrl: raw.post_src,
  formats: [], // Posts don't have formats
  license: undefined,
  pdfCopyrightAllowsDisplay: true,
}));

export const transformPaper = createTransformer<any, Work>((raw) => ({
  ...transformWork(raw),
  contentType: 'paper',
  journal: transformJournal(raw),
  category: raw.category ? transformTopic(raw.category) : undefined,
  subcategory: raw.subcategory ? transformTopic(raw.subcategory) : undefined,
}));

/**
 * Transform raw work from a unified-document context.
 * Uses transformPaper when document_type is PAPER, otherwise transformPost.
 */
export function transformUnifiedDocument(raw: Record<string, unknown>): Work {
  const documentType = (raw?.unified_document as { document_type?: string } | undefined)
    ?.document_type;
  if (documentType === 'PAPER') {
    return transformPaper(raw);
  }
  return transformPost(raw);
}
