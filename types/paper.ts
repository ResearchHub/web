import { createTransformer, BaseTransformed } from './transformer';
import { PaperEnrichment as GraphQLPaperEnrichment } from '@/lib/graphql/queries';

export interface PaperEnrichment {
  source: string;
  citationCount: number;
  influentialCitationCount: number;
  altmetricScore: number;
  impactScore: number;
  journal: string;
  fieldsOfStudy: string[];
  tldr: string;
  twitterMentions: number;
  newsMentions: number;
}

export interface Paper {
  id: string;
  title: string;
  abstract: string;
  date: string;
  source: string;
  server: string;
  doi: string;
  url: string;
  file?: string;
  pdfUrl: string;
  authors: string;
  category: string;
  unifiedCategorySlug: string;
  unifiedSubcategorySlug: string;
  impactScore: number;
  enrichments: PaperEnrichment[];
}

export interface PaperSearchResponse {
  totalCount: number;
  hasMore: boolean;
  papers: Paper[];
}

// Transformer for enrichments
export const transformPaperEnrichment = createTransformer<GraphQLPaperEnrichment, PaperEnrichment>(
  (raw) => ({
    source: raw.source || '',
    citationCount: raw.citationCount || 0,
    influentialCitationCount: raw.influentialCitationCount || 0,
    altmetricScore: raw.altmetricScore || 0,
    impactScore: raw.impactScore || 0,
    journal: raw.journal || '',
    fieldsOfStudy: raw.fieldsOfStudy || [],
    tldr: raw.tldr || '',
    twitterMentions: raw.twitterMentions || 0,
    newsMentions: raw.newsMentions || 0,
  })
);

// Transformer for papers
export const transformPaper = createTransformer<any, Paper>((raw) => ({
  id: raw.id || '',
  title: raw.title || '',
  abstract: raw.abstract || '',
  date: raw.date || '',
  source: raw.source || '',
  server: raw.server || '',
  doi: raw.doi || '',
  url: raw.url || '',
  file: raw.file,
  pdfUrl: raw.pdfUrl || '',
  authors: raw.authors || '',
  category: raw.category || '',
  unifiedCategorySlug: raw.unifiedCategory?.slug || raw.unifiedCategorySlug || '',
  unifiedSubcategorySlug: raw.unifiedSubcategory?.slug || raw.unifiedSubcategorySlug || '',
  impactScore: raw.impactScore || 0,
  enrichments: Array.isArray(raw.enrichments) ? raw.enrichments.map(transformPaperEnrichment) : [],
}));

// Transformer for paper search response
export const transformPaperSearchResponse = createTransformer<any, PaperSearchResponse>((raw) => ({
  totalCount: raw.totalCount || 0,
  hasMore: raw.hasMore || false,
  papers: Array.isArray(raw.papers) ? raw.papers.map(transformPaper) : [],
}));
