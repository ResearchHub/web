import { AuthorProfile, transformAuthorProfile } from './authorProfile';
import { ContentMetrics } from './metrics';
import { Journal } from './journal';
import { Topic } from './topic';
import { createTransformer, BaseTransformed } from './transformer';
import { Hub } from './hub';
import { NoteWithContent, transformNoteWithContent } from './note';
import { ProxyService } from '../services/proxy.service';

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
  workId: number;
  version: string;
  isLatest: boolean;
  publishedDate: string;
  description: string;
};

export interface FormatType {
  type: string;
  url: string;
}

export interface Work {
  id: number;
  type: WorkType;
  contentType: ContentType;
  title: string;
  slug: string;
  createdDate: string;
  publishedDate: string;
  authors: Authorship[];
  abstract?: string;
  previewContent?: string;
  contentUrl?: string;
  doi?: string;
  journal?: Journal;
  topics: Topic[];
  formats: Array<FormatType>;
  license?: string;
  pdfCopyrightAllowsDisplay?: boolean;
  figures: Array<{
    url: string;
  }>;
  versions: Array<DocumentVersion>;
  metrics: ContentMetrics;
  unifiedDocumentId: number | null;
  note?: NoteWithContent;
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
      name: raw.external_source,
      slug: raw.external_source_slug || '',
      imageUrl: raw.external_source_image || '',
    }))(raw);
  }

  // Check for journal property (new format)
  if (raw.journal) {
    return createTransformer<any, Journal>((raw) => ({
      id: raw.journal.id || 0,
      name: raw.journal.name,
      slug: raw.journal.slug || '',
      imageUrl: raw.journal.image || '',
    }))(raw);
  }

  return undefined;
};

export const transformDocumentVersion = createTransformer<any, DocumentVersion>((raw) => ({
  workId: raw.paper_id,
  version: raw.version,
  isLatest: raw.is_latest,
  publishedDate: raw.published_date,
  description: raw.description || '',
}));

export const transformWork = createTransformer<any, Work>((raw) => ({
  id: raw.id,
  type: raw.work_type as WorkType,
  contentType: raw.content_type as ContentType,
  title: raw.title || raw.paper_title,
  slug: raw.slug,
  createdDate: raw.created_date,
  publishedDate: raw.paper_publish_date,
  authors:
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
        : [],
  abstract: raw.abstract,
  doi: raw.doi,
  journal: transformJournal(raw),
  topics: Array.isArray(raw.hubs)
    ? raw.hubs.map((hub: Hub) => ({
        id: hub.id,
        name: hub.name,
        slug: hub.slug,
      }))
    : raw.hub
      ? [
          {
            id: raw.hub.id || 0,
            name: raw.hub.name,
            slug: raw.hub.slug,
          },
        ]
      : [],
  formats: raw.pdf_url
    ? [...(raw.formats || []), { type: 'PDF', url: ProxyService.generateProxyUrl(raw.pdf_url) }]
    : (raw.formats || []).map((format: FormatType) => ({
        ...format,
        url: format.type === 'PDF' ? ProxyService.generateProxyUrl(format.url) : format.url,
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
    comments: raw.metrics?.comments || raw.discussion_count || 0,
    saves: raw.metrics?.saves || raw.saves_count || 0,
    reviewScore: raw?.unified_document?.reviews?.avg || 0,
    reviews: raw?.unified_document?.reviews?.count || 0,
    earned: raw.earned || 0,
    views: raw.metrics?.views || raw.views_count || 0,
  },
  unifiedDocumentId: raw?.unified_document?.id || null,
}));

export const transformPost = createTransformer<any, Work>((raw) => ({
  ...transformWork(raw),
  contentType:
    raw.unified_document?.document_type === 'PREREGISTRATION' ? 'preregistration' : 'post',
  note: raw.note ? transformNoteWithContent(raw.note) : undefined,
  publishedDate: raw.created_date, // Posts use created_date for both
  previewContent: raw.full_markdown,
  contentUrl: raw.post_src,
  formats: [], // Posts don't have formats
  license: undefined,
  pdfCopyrightAllowsDisplay: true,
}));

export const transformPaper = createTransformer<any, Work>((raw) => ({
  ...transformWork(raw),
  contentType: 'paper',
}));
