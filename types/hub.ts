import { createTransformer } from './transformer';

// TODO: Remove this file in favor of topics
export type Hub = {
  name: string;
  slug: string;
  id: number;
};

export const transformHub = createTransformer<any, Hub>((raw) => ({
  id: raw.id,
  name: raw.name,
  slug: raw.slug,
}));
