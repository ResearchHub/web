// TODO: Remove this file in favor of topics
export type Hub = {
  name: string;
  slug: string;
  id: number;
  imageUrl?: string;
  description?: string;
};

export interface IHub {
  id: string | number;
  name: string;
  description?: string;
  color?: string;
}
