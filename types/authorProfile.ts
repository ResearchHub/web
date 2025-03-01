import { formatTimestamp } from '@/utils/date';
import { ID } from './root';
import { createTransformer, BaseTransformed } from './transformer';
import { User, transformUser } from './user';

export interface AuthorProfile {
  id: number;
  fullName: string;
  profileImage: string;
  headline?: string;
  profileUrl: string;
  user?: User;
}

export type TransformedAuthorProfile = AuthorProfile & BaseTransformed;

export const transformAuthorProfile = createTransformer<any, AuthorProfile>((raw) => ({
  id: raw.id,
  fullName: `${raw.first_name} ${raw.last_name}`.trim(),
  profileImage: raw.profile_image || '',
  headline: typeof raw.headline === 'string' ? raw.headline : raw.headline?.title || '',
  profileUrl: `/profile/${raw.id}`,
  user: raw.user ? transformUser(raw.user) : undefined,
}));

export interface SuggestedAuthor {
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

export const transformAuthorSuggestion = (raw: any): SuggestedAuthor => {
  return {
    id: raw.id,
    fullName: raw.full_name || `${raw.first_name} ${raw.last_name}`.trim(),
    profileImage: raw.profile_image,
    institutions: Array.isArray(raw.institutions) ? raw.institutions : [],
    education: Array.isArray(raw.education) ? raw.education : [],
    headline: raw?.headline?.title,
    reputationHubs: Array.isArray(raw.reputation_hubs) ? raw.reputation_hubs : [],
    userId: raw.user_id,
    createdDate: formatTimestamp(raw.created_date),
  };
};

export const transformAuthorSuggestions = (raw: any): SuggestedAuthor[] => {
  const authorSuggestions: SuggestedAuthor[] = [];
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
