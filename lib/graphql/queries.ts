import { gql } from '@apollo/client';

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
        totalCitations
        maxImpactScore
        maxAltmetricScore
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
      recentPapersCount
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
  totalCitations: number | null;
  maxImpactScore: number | null;
  maxAltmetricScore: number | null;
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
  recentPapersCount: number | null;
  lastUpdated: string | null;
}

export interface CategoriesResponse {
  categoriesWithCounts: Category[];
}