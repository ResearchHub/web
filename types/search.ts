import { createTransformer, BaseTransformed } from './transformer';
import { buildWorkUrl, buildAuthorUrl, buildTopicUrl } from '@/utils/url';
import { mapApiDocumentTypeToClientType } from '@/utils/contentTypeMapping';
import { AuthorProfile } from './authorProfile';
import { ID } from './root';
import { transformTopic } from './topic';
import { ContentType } from './work';

export type SuggestionSource = 'api' | 'recent' | 'researchhub' | 'openalex';
export type EntityType = 'user' | 'paper' | 'author' | 'post' | 'hub';

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

export interface TopicSuggestion extends BaseSuggestion {
  entityType: 'hub';
  displayName: string;
  id: number;
  slug: string;
  imageUrl?: string;
  description?: string;
  paperCount?: number;
}

export type SearchSuggestion = WorkSuggestion | UserSuggestion | PostSuggestion | TopicSuggestion;

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
          doi: raw.doi,
          slug: raw.slug,
        }),
      };
    }

    // Handle different entity types
    switch (raw.entity_type) {
      case 'user':
        // Process headline to ensure it's a string
        let userHeadline = '';
        if (raw.headline) {
          if (typeof raw.headline === 'string') {
            userHeadline = raw.headline;
          } else if (typeof raw.headline === 'object' && raw.headline.title) {
            userHeadline = String(raw.headline.title);
          }
        }

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
              }
            : {
                id: raw.id,
                headline: userHeadline,
                profileImage: raw.profile_image || raw.avatar || '',
                userId: raw.id,
              },
        };
      case 'person':
        // Process headline to ensure it's a string
        let headline = '';
        if (raw.headline) {
          if (typeof raw.headline === 'string') {
            headline = raw.headline;
          } else if (typeof raw.headline === 'object' && raw.headline.title) {
            headline = String(raw.headline.title);
          }
        }

        let fullName =
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
            headline: headline,
            profileImage: raw.profile_image || raw.avatar || '',
            userId: raw.user_id,
            fullName: fullName,
            firstName: raw.first_name || '',
            lastName: raw.last_name || '',
            profileUrl: buildAuthorUrl(raw.id),
            isClaimed: raw.is_claimed || false,
            isVerified: raw.is_verified || false,
          },
        };

      case 'post':
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

      case 'hub':
        try {
          // Transform hub using topic transformer and adapt to SearchSuggestion format
          const topicData = transformTopic(raw);
          return {
            entityType: 'hub',
            id: topicData.id,
            displayName: topicData.name || raw.name || raw.display_name || 'Untitled Topic',
            slug: topicData.slug || '',
            source: raw.source || 'api',
            isRecent: false,
            imageUrl: topicData.imageUrl,
            description: topicData.description,
            paperCount: topicData.paperCount,
            url: buildTopicUrl(topicData.slug),
          };
        } catch (error) {
          console.error('Error transforming topic:', error, raw);
          // Fallback if topic transformation fails
          return {
            entityType: 'hub',
            id: raw.id || 0,
            displayName: raw.name || raw.display_name || 'Untitled Topic',
            slug: raw.slug || '',
            source: raw.source || 'api',
            isRecent: false,
            url: raw.slug ? buildTopicUrl(raw.slug) : '#',
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
            doi: raw.doi,
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

export const transformAuthorSuggestion = (raw: any): AuthorSuggestion => {
  return {
    id: raw.id,
    fullName: raw.full_name || `${raw.first_name} ${raw.last_name}`.trim(),
    profileImage: raw.profile_image,
    institutions: Array.isArray(raw.institutions) ? raw.institutions : [],
    education: Array.isArray(raw.education) ? raw.education : [],
    headline: raw?.author_profile?.headline?.title,
    reputationHubs: Array.isArray(raw.reputation_hubs) ? raw.reputation_hubs : [],
    userId: raw.user_id,
    createdDate: raw.created_date,
  };
};

export const transformAuthorSuggestions = (raw: any): AuthorSuggestion[] => {
  const authorSuggestions: AuthorSuggestion[] = [];
  const suggestions = raw.suggestion_phrases__completion;

  if (Array.isArray(suggestions)) {
    suggestions.forEach((suggestion: any) => {
      if (suggestion.options && Array.isArray(suggestion.options)) {
        suggestion.options.forEach((option: any) => {
          if (option._source) {
            const parsed = transformAuthorSuggestion(option._source);
            authorSuggestions.push(parsed);
          }
        });
      }
    });
  }

  return authorSuggestions;
};

export interface ApiDocumentSearchResult {
  id: number;
  type: 'paper' | 'post';
  title: string;
  snippet: string; // with <mark> tags for highlighting
  abstract?: string; // Full abstract text (new field from backend)
  matched_field: string; // 'title', 'abstract', etc.
  authors: Array<{
    first_name: string;
    last_name: string;
    full_name: string;
  }>; // array of author objects
  created_date: string | null;
  paper_publish_date: string | null;
  hot_score: number;
  score: number; // upvotes
  _search_score: number; // relevance score
  hubs: any[]; // hub objects
  unified_document_id: number | null;
  doi: string | null;
  citations: number;
  is_open_access: boolean | null;
  slug: string | null;
  document_type: string | null; // 'GRANT', etc.
  journal?:
    | string // Legacy format: just the journal name
    | {
        // New format: full journal object
        id: number;
        name: string;
        slug?: string;
        image_url?: string;
      }
    | null;
}

export interface PersonSearchResult {
  id: number;
  full_name: string;
  profile_image: string;
  snippet: string | null; // with <mark> tags
  matched_field: string | null;
  headline: { title: string | null };
  institutions: Array<{ id: number; name: string }>;
  user_reputation: number;
  user_id: number | null;
  _search_score: number;
}

export interface SearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  documents: ApiDocumentSearchResult[];
  people: PersonSearchResult[];
  aggregations: {
    years: Array<{ key: string; doc_count: number }>;
    hubs: Array<{ key: string; doc_count: number }>;
    content_types: Array<{ key: string; doc_count: number }>;
  };
}

// Search Filter Types
export interface SearchFilters {
  yearMin?: number;
  yearMax?: number;
  contentTypes?: string[];
  authors?: string[];
}

export type SearchSortOption = 'relevance' | 'newest' | 'hot' | 'upvoted';

export interface SearchPreferences {
  filters: SearchFilters;
  sortBy: SearchSortOption;
}
