import { Hub, transformHub } from './hub';
import { createTransformer } from './transformer';
import { AuthorProfile, ID, transformAuthorProfile, transformUser, User } from './user';

export interface GenericDocument {
  id: ID;
  authors: AuthorProfile[];
  hubs: Hub[];
  score: number;
  createdDate: string;
  discussionCount: number;
  title: string;
  createdBy: User | undefined;
  doi?: string;
  slug?: string;
}

export const transformGenericDocument = createTransformer<any, GenericDocument>((raw) => ({
  id: raw.id,
  authors: raw.authors?.map((a: any) => transformAuthorProfile(a)) || [],
  hubs: (raw.hubs || []).map((h: any) => transformHub(h)),
  score: raw.score,
  createdDate: raw.created_date,
  discussionCount: raw.discussion_count || 0,
  title: raw.title,
  createdBy: transformUser(raw.uploaded_by || raw.created_by),
  doi: raw.doi,
  slug: raw.slug,
}));
