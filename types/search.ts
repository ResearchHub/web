import { createTransformer } from './transformer';
import { buildWorkUrl, buildAuthorUrl } from '@/utils/url';
import { mapApiDocumentTypeToClientType } from '@/utils/contentTypeMapping';
import { AuthorProfile, extractHeadline } from './authorProfile';
import { ID } from './root';
import { ContentType } from './work';

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
  publishedDate?: string;
  contentType?: ContentType;
  /** Cover image, or a paper's first PDF page, for the Recently visited thumbnail. */
  imageUrl?: string;
  /** The first author photo found, the thumbnail's fallback when there is no image. */
  authorImage?: string;
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
  documentType?: string;
}

export type SearchSuggestion = WorkSuggestion | UserSuggestion | PostSuggestion;

export const transformSearchSuggestion = createTransformer<any, SearchSuggestion>((raw: any) => {
  try {
    if (raw.lastVisited) {
      // If it's a recent suggestion
      return {
        entityType: 'paper',
        doi: raw.doi || '',
        displayName: raw.title,
        authors: raw.authors || [],
        citations: 0,
        source: '',
        openalexId: '',
        id: raw.id,
        isRecent: true,
        lastVisited: raw.lastVisited,
        slug: raw.slug,
        publishedDate: raw.date_published,
        contentType: raw.contentType || 'paper',
        url: buildWorkUrl({
          id: raw.id,
          contentType: raw.contentType || 'paper',
          slug: raw.slug,
        }),
      };
    }

    // Handle different entity types
    switch (raw.entity_type) {
      case 'user': {
        const userHeadline =
          extractHeadline(raw.headline) || extractHeadline(raw.author_profile?.headline);

        return {
          entityType: 'user',
          id: raw.id,
          displayName:
            raw.display_name ||
            raw.full_name ||
            `${raw.first_name || ''} ${raw.last_name || ''}`.trim() ||
            'User',
          reputation: raw.reputation,
          source: raw.source || '',
          isRecent: false,
          createdDate: raw.created_date,
          isVerified: raw.is_verified || false,
          url: raw.author_profile ? buildAuthorUrl(raw.author_profile.id) : undefined,
          authorProfile: raw.author_profile
            ? {
                ...raw.author_profile,
                userId: raw.id,
                profileImage: raw.author_profile.profile_image || '',
                headline: userHeadline,
              }
            : {
                id: raw.id,
                headline: userHeadline,
                profileImage: raw.profile_image || raw.avatar || '',
                userId: raw.id,
              },
        };
      }
      case 'person': {
        const headline = extractHeadline(raw.headline);
        const fullName =
          raw.display_name ||
          raw.full_name ||
          `${raw.first_name || ''} ${raw.last_name || ''}`.trim() ||
          'Author';

        return {
          entityType: 'author',
          id: raw.id,
          displayName: fullName,
          reputation: raw.reputation,
          source: raw.source || '',
          isRecent: false,
          createdDate: raw.created_date,
          isVerified: raw.is_verified || false,
          url: buildAuthorUrl(raw.id),
          authorProfile: {
            id: raw.id,
            headline,
            profileImage: raw.profile_image || raw.avatar || '',
            userId: raw.user_id,
            fullName,
            firstName: raw.first_name || '',
            lastName: raw.last_name || '',
            profileUrl: buildAuthorUrl(raw.id),
            isClaimed: !!raw.user_id,
            isVerified: raw.is_verified || false,
          },
        };
      }
      case 'post': {
        const documentType = raw.document_type || raw.type;
        const documentContentType = mapApiDocumentTypeToClientType(documentType);

        return {
          entityType: 'post',
          id: raw.id,
          displayName: raw.display_name || 'Untitled Post',
          source: raw.source || '',
          isRecent: false,
          documentType,
          url: documentContentType
            ? buildWorkUrl({
                id: raw.id,
                contentType: documentContentType,
              })
            : undefined,
        };
      }
      case 'paper':
      default:
        return {
          entityType: 'paper',
          doi: raw.doi || '',
          displayName: raw.display_name || 'Untitled Paper',
          authors: Array.isArray(raw.authors) ? raw.authors : [],
          citations: raw.citations || 0,
          source: raw.source || '',
          openalexId: raw.openalex_id || '',
          id: raw.id,
          isRecent: false,
          publishedDate: raw.date_published,
          url: buildWorkUrl({
            id: raw.id,
            contentType: 'paper',
          }),
        };
    }
  } catch (error) {
    // Fallback with minimal data to prevent rendering errors
    console.error('Error transforming search suggestion:', error);
    return {
      entityType: raw.entity_type || 'paper',
      id: raw.id || 0,
      displayName: raw.display_name || raw.title || 'Unknown Item',
      source: raw.source || '',
      isRecent: false,
      url: '#',
    } as SearchSuggestion;
  }
});

export interface AuthorSuggestion {
  id: ID;
  fullName?: string;
  profileImage?: string;
  institutions: Array<{
    id: ID;
    name: string;
  }>;
  headline?: string;
  reputationHubs: string[];
  userId?: ID;
  createdDate?: string;
  education: string[];
}

export function mapUserSuggestionToAuthorSuggestion(suggestion: UserSuggestion): AuthorSuggestion {
  const profile = suggestion.authorProfile;
  return {
    id: profile?.id ?? suggestion.id!,
    fullName: suggestion.displayName,
    profileImage: profile?.profileImage,
    headline: profile?.headline,
    userId: profile?.userId,
    createdDate: suggestion.createdDate,
    institutions: [],
    education: [],
    reputationHubs: [],
  };
}
