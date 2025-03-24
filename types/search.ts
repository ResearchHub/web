import { createTransformer, BaseTransformed } from './transformer';
import { buildWorkUrl, buildAuthorUrl, buildTopicUrl } from '@/utils/url';
import { AuthorProfile } from './authorProfile';
import { ID } from './root';
import { transformTopic } from './topic';

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
        // Process headline to ensure it's a string
        let headline = '';
        if (raw.headline) {
          if (typeof raw.headline === 'string') {
            headline = raw.headline;
          } else if (typeof raw.headline === 'object' && raw.headline.title) {
            headline = String(raw.headline.title);
          }
        }

        return {
          entityType: raw.entity_type === 'person' ? 'author' : 'user',
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
          url: buildAuthorUrl(raw.id),
          authorProfile: raw.author_profile || {
            id: raw.id,
            headline: headline,
            profileImage: raw.profile_image || raw.avatar || '',
          },
        };

      case 'post':
        return {
          entityType: 'post',
          id: raw.id,
          displayName: raw.display_name || 'Untitled Post',
          source: raw.source || '',
          isRecent: false,
          url: buildWorkUrl({
            id: raw.id,
            contentType: 'post',
          }),
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
    headline: raw?.headline?.title,
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
