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
        server
        doi
        url
        pdfUrl
        authors
        category
        unifiedCategorySlug
        unifiedSubcategorySlug
        enrichments {
          source
          citationCount
          altmetricScore
          impactScore
          twitterMentions
          newsMentions
          fieldsOfStudy
          tldr
          influentialCitationCount
          journal
        }
      }
    }
  }
`;

export const GET_UNIFIED_CATEGORIES = gql`
  query GetUnifiedCategories {
    unifiedCategories {
      id
      slug
      name
      description
      displayOrder
      paperCount
      subcategories {
        id
        slug
        name
        description
        displayOrder
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

export const GET_CATEGORIES = gql`
  query GetCategories {
    categoriesWithCounts {
      name
      displayName
      paperCount
      lastUpdated
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

export interface Category {
  name: string;
  displayName: string;
  paperCount: number | null;
  lastUpdated: string | null;
}

export interface CategoriesResponse {
  categoriesWithCounts: Category[];
}

export interface GetPapersInput {
  timePeriod?: string;
  customStartDate?: string;
  customEndDate?: string;
  categories?: string[];
  subcategories?: string[];
  humanReadableCategories?: string[];
  sourceCategories?: string[];
  keywords?: string[];
  sources?: string[];
  hasEnrichment?: boolean;
  minImpactScore?: number;
  minCitations?: number;
  minAltmetricScore?: number;
  minTwitterMentions?: number;
  minNewsMentions?: number;
  sortBy?: string;
  sortOrder?: string;
  limit?: number;
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

export interface UnifiedCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  displayOrder: number;
  paperCount: number;
  subcategories: UnifiedSubcategory[];
}

export interface UnifiedSubcategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  displayOrder: number;
  paperCount: number;
}

export interface Paper {
  id: string;
  title: string;
  abstract: string | null;
  date: string;
  source: string;
  server: string;
  doi: string | null;
  url: string | null;
  pdfUrl: string | null;
  authors: string;
  category: string;
  unifiedCategorySlug: string | null;
  unifiedSubcategorySlug: string | null;
  enrichments: PaperEnrichment[] | null;
}

export interface PaperSearchResponse {
  totalCount: number;
  hasMore: boolean;
  papers: Paper[];
}

export interface UnifiedCategoriesResponse {
  unifiedCategories: UnifiedCategory[];
}
