// TODO: Remove this file in favor of topics
export type Hub = {
  name: string;
  slug: string;
  id: number;
  imageUrl?: string;
  description?: string;
  headline?: string;
  verified?: boolean;
  editors?: number[]; // ids referencing author profiles
  followersCount?: number;
};
