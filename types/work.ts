import { AuthorProfile } from './user';
import { ContentMetrics } from './metrics';
import { Journal } from './journal';
import { Topic } from './topic';
import { createTransformer, BaseTransformed } from './transformer';
import { transformAuthorProfile } from './user';
import { Hub } from './hub';

export type WorkType = 'article' | 'review' | 'preprint' | 'preregistration';

export type AuthorPosition = 'first' | 'middle' | 'last';

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

export interface Work {
  id: number;
  type: WorkType;
  title: string;
  slug: string;
  createdDate: string;
  publishedDate: string;
  authors: Authorship[];
  abstract?: string;
  previewContent?: string;
  doi?: string;
  journal?: Journal;
  topics: Topic[];
  formats: Array<{
    type: string;
    url: string;
  }>;
  license?: string;
  pdfCopyrightAllowsDisplay?: boolean;
  figures: Array<{
    url: string;
  }>;
  versions: Array<DocumentVersion>;
  metrics: ContentMetrics;
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
  if (!raw.external_source) return undefined;

  return createTransformer<any, Journal>((raw) => ({
    id: raw.external_source_id || 0,
    name: raw.external_source,
    slug: raw.external_source_slug || '',
    image: raw.external_source_image || '',
  }))(raw);
};

export const transformTopic = createTransformer<any, Topic>((raw) => ({
  id: raw.id,
  name: raw.name,
  slug: raw.slug,
}));

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
  title: raw.title || raw.paper_title,
  slug: raw.slug,
  createdDate: raw.created_date,
  publishedDate: raw.paper_publish_date,
  authors: Array.isArray(raw.authors) ? raw.authors.map(transformAuthorship) : [],
  abstract: raw.abstract,
  doi: raw.doi,
  journal: raw.external_source ? transformJournal(raw) : undefined,
  topics: Array.isArray(raw.hubs)
    ? raw.hubs.map((hub: Hub) => ({
        id: hub.id,
        name: hub.name,
        slug: hub.slug,
      }))
    : [],
  formats: raw.formats || [],
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
    votes: raw.score || 0,
    comments: raw.discussion_count || 0,
    saves: raw.saves_count || 0,
    reviewScore: raw.unified_document?.reviews?.avg || 0,
    reviews: raw.unified_document?.reviews?.count || 0,
    earned: raw.earned || 0,
    views: raw.views_count || 0,
  },
}));
