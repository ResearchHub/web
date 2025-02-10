import { createTransformer, BaseTransformed } from './transformer';
import { buildWorkUrl, buildAuthorUrl } from '@/utils/url';
import { AuthorProfile } from './user';

export type SuggestionSource = 'api' | 'recent';
export type EntityType = 'user' | 'paper' | 'work';

export interface BaseSuggestion {
  entityType: EntityType;
  source: string;
  id?: number;
  isRecent?: boolean;
  url?: string;
}

export interface WorkSuggestion extends BaseSuggestion {
  entityType: 'work';
  doi: string;
  displayName: string;
  authors: string[];
  citations: number;
  openalexId: string;
  lastVisited?: string;
  slug?: string;
}

export interface UserSuggestion extends BaseSuggestion {
  entityType: 'user';
  fullName: string;
  reputation: number;
  createdDate: string;
  isVerified: boolean;
  authorProfile: AuthorProfile;
}

export type SearchSuggestion = WorkSuggestion | UserSuggestion;

export interface RecentPageView {
  id: number;
  title: string;
  doi?: string;
  authors: string[];
  lastVisited: string;
  slug: string;
}

export type TransformedSearchSuggestion = SearchSuggestion & BaseTransformed;

export const transformSearchSuggestion = createTransformer<any, SearchSuggestion>((raw: any) => {
  if (raw.lastVisited) {
    // If it's a recent suggestion
    return {
      entityType: 'work',
      doi: raw.doi || '',
      displayName: raw.title,
      authors: raw.authors,
      citations: 0,
      source: '',
      openalexId: '',
      id: raw.id,
      isRecent: true,
      lastVisited: raw.lastVisited,
      slug: raw.slug,
      url: buildWorkUrl(raw.id, raw.title),
    };
  }

  // Handle different entity types
  switch (raw.entity_type) {
    case 'user':
      return {
        entityType: 'user',
        id: raw.id,
        fullName: raw.full_name,
        reputation: raw.reputation,
        source: raw.source,
        isRecent: false,
        createdDate: raw.created_date,
        isVerified: raw.is_verified || false,
        url: buildAuthorUrl(raw.id, raw.full_name),
        authorProfile: raw.author_profile,
      };

    case 'work':
    default:
      return {
        entityType: 'work',
        doi: raw.doi,
        displayName: raw.display_name,
        authors: raw.authors,
        citations: raw.citations,
        source: raw.source,
        openalexId: raw.openalex_id,
        id: raw.id,
        isRecent: false,
        url: buildWorkUrl(raw.id, raw.display_name),
      };
  }
});
