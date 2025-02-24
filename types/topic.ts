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
