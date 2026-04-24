import { gql } from '@apollo/client';

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
