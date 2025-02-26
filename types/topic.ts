import { createTransformer } from './transformer';

export type Topic = {
  name: string;
  slug: string;
  id: number;
  imageUrl?: string;
  description?: string;
};

export const transformTopic = createTransformer<any, Topic>((raw: any) => ({
  id: raw.id,
  name: raw.name,
  slug: raw.slug,
  imageUrl: raw.hub_image,
  description: raw.description,
}));

export const transformTopics = (raw: any): Topic[] => {
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
