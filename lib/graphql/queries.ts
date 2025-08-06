import { gql } from '@apollo/client';

export const GET_PAPERS = gql`
  query GetPapers($input: GetPapersInput!) {
    getPapers(input: $input) {
      totalCount
      hasMore
      papers {
        id
        title
        abstract
        date
        source
        doi
        url
        pdfUrl
        authors
        impactScore
        unifiedCategory {
          slug
        }
        unifiedSubcategory {
          slug
        }
        enrichments {
          source
          citationCount
          influentialCitationCount
          altmetricScore
          impactScore
          journal
          fieldsOfStudy
          tldr
          twitterMentions
          newsMentions
        }
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories($minPaperCount: Int, $includeEmptySubcategories: Boolean) {
    categories(
      minPaperCount: $minPaperCount
      includeEmptySubcategories: $includeEmptySubcategories
    ) {
      slug
      name
      icon
      paperCount
      subcategories {
        slug
        name
        paperCount
      }
    }
  }
`;

export const ADVANCED_PAPER_SEARCH = gql`
  query AdvancedPaperSearch($searchInput: AdvancedPaperSearchInput!) {
    advancedPaperSearch(searchInput: $searchInput) {
      papers {
        doi
        title
        category
        date
        authors
        abstract
        enrichments {
          source
          citationCount
          influentialCitationCount
          altmetricScore
          impactScore
          journal
          fieldsOfStudy
          tldr
          twitterMentions
          newsMentions
        }
      }
      totalCount
      hasMore
    }
  }
`;

export interface AdvancedPaperSearchInput {
  categories?: string[];
  timePeriod?: string;
  sortBy?: string;
  sortOrder?: string;
  limit?: number;
  minCitations?: number;
  hasEnrichment?: boolean;
}

export interface PaperEnrichment {
  source: string;
  citationCount: number | null;
  influentialCitationCount: number | null;
  altmetricScore: number | null;
  impactScore: number | null;
  journal: string | null;
  fieldsOfStudy: string[] | null;
  tldr: string | null;
  twitterMentions: number | null;
  newsMentions: number | null;
}

export interface PaperSearchResult {
  doi: string;
  title: string;
  category: string;
  date: string;
  authors: string;
  abstract: string | null;
  enrichments: PaperEnrichment[] | null;
}

export interface AdvancedPaperSearchResponse {
  papers: PaperSearchResult[];
  totalCount: number;
  hasMore: boolean;
}

export interface Subcategory {
  slug: string;
  name: string;
  paperCount: number;
}

export interface Category {
  slug: string;
  name: string;
  icon: string;
  paperCount: number;
  subcategories: Subcategory[];
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface GetPapersInput {
  keywords?: string[];
  subcategories?: string[];
  timePeriod?: string;
  sortBy?: string;
  limit?: number;
  useMlRelevance?: boolean;
  // Legacy fields that might still be needed
  categories?: string[];
  sources?: string[];
  hasEnrichment?: boolean;
  minImpactScore?: number;
  minCitations?: number;
  minAltmetricScore?: number;
  minTwitterMentions?: number;
  minNewsMentions?: number;
  sortOrder?: string;
  offset?: number;
}

export interface PaperFilterInput {
  categories?: string[];
  subcategories?: string[];
  humanReadableCategories?: string[];
  keywords?: string[];
  sources?: string[];
  servers?: string[];
  startDate?: string;
  endDate?: string;
  hasEnrichment?: boolean;
  minCitations?: number;
  limit?: number;
}

export interface Paper {
  id: string;
  title: string;
  abstract: string | null;
  date: string;
  source: string;
  server?: string;
  doi: string | null;
  url: string | null;
  pdfUrl: string | null;
  authors: string;
  category?: string;
  impactScore?: number | null;
  unifiedCategory?: {
    slug: string;
  } | null;
  unifiedSubcategory?: {
    slug: string;
  } | null;
  enrichments: PaperEnrichment[] | null;
}

export interface PaperSearchResponse {
  totalCount: number;
  hasMore: boolean;
  papers: Paper[];
}
