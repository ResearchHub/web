import { createTransformer } from './transformer';
import {
  Category as GraphQLCategory,
  Subcategory as GraphQLSubcategory,
} from '@/lib/graphql/queries';

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

// Transformer for subcategories
export const transformSubcategory = createTransformer<GraphQLSubcategory, Subcategory>((raw) => ({
  slug: raw.slug || '',
  name: raw.name || '',
  paperCount: raw.paperCount || 0,
}));

// Transformer for categories
export const transformCategory = createTransformer<GraphQLCategory, Category>((raw) => ({
  slug: raw.slug || '',
  name: raw.name || '',
  icon: raw.icon || '',
  paperCount: raw.paperCount || 0,
  subcategories: Array.isArray(raw.subcategories)
    ? raw.subcategories.map(transformSubcategory)
    : [],
}));

// Transformer for categories response
export const transformCategoriesResponse = createTransformer<any, CategoriesResponse>((raw) => ({
  categories: Array.isArray(raw.categories) ? raw.categories.map(transformCategory) : [],
}));

// For backward compatibility, export the old names as aliases
export type UnifiedCategory = Category;
export type UnifiedSubcategory = Subcategory;
export type UnifiedCategoriesResponse = CategoriesResponse;
export const transformUnifiedCategory = transformCategory;
export const transformUnifiedSubcategory = transformSubcategory;
export const transformUnifiedCategoriesResponse = transformCategoriesResponse;
