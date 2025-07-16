import { createTransformer, BaseTransformed } from './transformer';
import {
  UnifiedCategory as GraphQLUnifiedCategory,
  UnifiedSubcategory as GraphQLUnifiedSubcategory,
} from '@/lib/graphql/queries';

export interface UnifiedSubcategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  displayOrder: number;
  paperCount: number;
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

export interface UnifiedCategoriesResponse {
  unifiedCategories: UnifiedCategory[];
}

// Transformer for subcategories
export const transformUnifiedSubcategory = createTransformer<
  GraphQLUnifiedSubcategory,
  UnifiedSubcategory
>((raw) => ({
  id: raw.id || '',
  slug: raw.slug || '',
  name: raw.name || '',
  description: raw.description || '',
  displayOrder: raw.displayOrder || 0,
  paperCount: raw.paperCount || 0,
}));

// Transformer for categories
export const transformUnifiedCategory = createTransformer<GraphQLUnifiedCategory, UnifiedCategory>(
  (raw) => ({
    id: raw.id || '',
    slug: raw.slug || '',
    name: raw.name || '',
    description: raw.description || '',
    displayOrder: raw.displayOrder || 0,
    paperCount: raw.paperCount || 0,
    subcategories: Array.isArray(raw.subcategories)
      ? raw.subcategories.map(transformUnifiedSubcategory)
      : [],
  })
);

// Transformer for categories response
export const transformUnifiedCategoriesResponse = createTransformer<any, UnifiedCategoriesResponse>(
  (raw) => ({
    unifiedCategories: Array.isArray(raw.unifiedCategories)
      ? raw.unifiedCategories.map(transformUnifiedCategory)
      : [],
  })
);
