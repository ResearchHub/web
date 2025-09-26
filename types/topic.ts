import { createTransformer } from './transformer';

export type Topic = {
  name: string;
  slug: string;
  id: number;
  namespace?: 'journal' | 'topic';
  imageUrl?: string;
  description?: string;
  category?: string;
  discussionCount?: number;
  paperCount?: number;
  subscriberCount?: number;
  isLocked?: boolean;
  isRemoved?: boolean;
  isUsedForRep?: boolean;
};

export const transformTopic = createTransformer<any, Topic>((raw: any) => {
  // Extract name with fallbacks
  const name = raw.name || raw.display_name || 'Untitled Topic';

  return {
    id: raw.id,
    name: name,
    slug: raw.slug,
    imageUrl: raw.hub_image || undefined,
    description: raw.description,
    namespace: raw.namespace,
    category: raw.category,
    discussionCount: raw.discussion_count,
    paperCount: raw.paper_count,
    subscriberCount: raw.subscriber_count,
    isLocked: raw.is_locked,
    isRemoved: raw.is_removed,
    isUsedForRep: raw.is_used_for_rep,
  };
});

export const transformTopicSuggestions = (raw: any): Topic[] => {
  const topicSuggestions: Topic[] = [];
  const suggestions = raw.name_suggest__completion;

  suggestions.forEach((suggestion: any) => {
    suggestion.options.forEach((option: any) => {
      const parsed = transformTopic(option._source);
      topicSuggestions.push(parsed);
    });
  });

  return topicSuggestions;
};
