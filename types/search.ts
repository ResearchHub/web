import { createTransformer, BaseTransformed } from './transformer';
import { buildWorkUrl, buildAuthorUrl } from '@/utils/url';
import { AuthorProfile } from './user';

export type SuggestionSource = 'api' | 'recent' | 'researchhub' | 'openalex';
export type EntityType = 'user' | 'paper' | 'author' | 'post';

export interface BaseSuggestion {
  entityType: EntityType;
  source: string;
  id?: number;
  isRecent?: boolean;
  url?: string;
}

export interface WorkSuggestion extends BaseSuggestion {
  entityType: 'paper';
  doi: string;
  displayName: string;
  authors: string[];
  citations: number;
  openalexId: string;
  lastVisited?: string;
  slug?: string;
}

export interface UserSuggestion extends BaseSuggestion {
  entityType: 'user' | 'author';
  displayName: string;
  reputation?: number;
  createdDate?: string;
  isVerified?: boolean;
  authorProfile: AuthorProfile;
}

export interface PostSuggestion extends BaseSuggestion {
  entityType: 'post';
  displayName: string;
  id: number;
}

export type SearchSuggestion = WorkSuggestion | UserSuggestion | PostSuggestion;

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
      entityType: 'paper',
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
      url: buildWorkUrl({
        id: raw.id,
        contentType: 'paper',
        doi: raw.doi,
      }),
    };
  }

  // Handle different entity types
  switch (raw.entity_type) {
    case 'user':
    case 'person':
      return {
        entityType: raw.entity_type === 'person' ? 'author' : 'user',
        id: raw.id,
        displayName: raw.display_name,
        reputation: raw.reputation,
        source: raw.source,
        isRecent: false,
        createdDate: raw.created_date,
        isVerified: raw.is_verified || false,
        url: buildAuthorUrl(raw.id),
        authorProfile: raw.author_profile || {
          id: raw.id,
          headline: raw.headline,
          profileImage: raw.profile_image,
        },
      };

    case 'post':
      return {
        entityType: 'post',
        id: raw.id,
        displayName: raw.display_name,
        source: raw.source,
        isRecent: false,
        url: buildWorkUrl({
          id: raw.id,
          contentType: 'post',
        }),
      };

    case 'paper':
    default:
      return {
        entityType: 'paper',
        doi: raw.doi,
        displayName: raw.display_name,
        authors: raw.authors,
        citations: raw.citations,
        source: raw.source,
        openalexId: raw.openalex_id,
        id: raw.id,
        isRecent: false,
        url: buildWorkUrl({
          id: raw.id,
          contentType: 'paper',
          doi: raw.doi,
        }),
      };
  }
});
