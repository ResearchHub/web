import type { Organization } from './organization';
import { createTransformer, BaseTransformed } from './transformer';
import { transformOrganization } from './organization';
import { ID } from './root';
import { ContentType } from './work';
import { Fundraise, transformFundraise } from './funding';
import { Topic, transformTopic } from './topic';
import { Grant, transformGrant } from './grant';
import { AuthorProfile, transformAuthorProfile } from './authorProfile';
export type NoteAccess = 'WORKSPACE' | 'PRIVATE' | 'SHARED';

export type Author = {
  authorId: number;
  userId: number;
  name: string;
};

export type Contact = {
  id: number;
  name: string;
  authorProfile?: AuthorProfile;
};

export type Post = {
  id: number;
  slug: string;
  contentType: ContentType;
  fundraise?: Fundraise;
  grant?: Grant;
  topics?: Topic[];
  authors?: Author[];
  contacts?: Contact[];
  doi?: string;
  image?: string;
};

export interface Note {
  id: number;
  access: NoteAccess;
  organization: Organization;
  createdDate: string;
  updatedDate: string;
  title: string;
  isRemoved: boolean;
  post: Post | null;
  documentType: string | null;
}

export interface NoteWithContent extends Note {
  content?: string;
  contentJson?: string;
  versionId: number;
  versionDate: string;
  plainText: string;
}

export interface NoteApiItem {
  id: number;
  access: NoteAccess;
  organization: {
    id: number;
    cover_image: string | null;
    name: string;
    slug: string;
  };
  created_date: string;
  updated_date: string;
  title: string;
}

export type TransformedNote = Note & BaseTransformed;

export const transformAuthor = createTransformer<any, Author>((raw: any) => ({
  authorId: raw.id,
  userId: raw.user,
  name: `${raw.first_name || ''} ${raw.last_name || ''}`.trim() || 'Unknown',
}));

export const transformContact = createTransformer<any, Contact>((raw) => ({
  id: raw.id,
  name: raw.name,
  authorProfile: raw.author_profile ? transformAuthorProfile(raw.author_profile) : undefined,
}));

export const transformPost = createTransformer<any, Post>((raw) => ({
  id: raw.id,
  slug: raw.slug,
  contentType:
    raw.document_type.toLowerCase() === 'preregistration'
      ? 'preregistration'
      : raw.document_type.toLowerCase() === 'grant'
        ? 'funding_request'
        : 'post',
  fundraise: raw.unified_document?.fundraise
    ? transformFundraise(raw.unified_document.fundraise)
    : undefined,
  grant: raw.unified_document?.grant ? transformGrant(raw.unified_document.grant) : undefined,
  doi: raw.doi,
  topics: Array.isArray(raw.hubs) ? raw.hubs.map((hub: any) => transformTopic(hub)) : undefined,
  authors: Array.isArray(raw.authors)
    ? raw.authors.map((author: any) => transformAuthor(author))
    : undefined,
  contacts: Array.isArray(raw.contacts)
    ? raw.contacts.map((contact: any) => transformContact(contact))
    : undefined,
  image: raw.image_url,
}));

export const transformNote = createTransformer<any, Note>((raw) => ({
  id: raw.id,
  access: raw.access,
  organization: transformOrganization(raw.organization),
  createdDate: raw.created_date,
  updatedDate: raw.updated_date,
  title: raw.title,
  isRemoved: raw.unifiedDocument?.isRemoved || false,
  post: raw.post ? transformPost(raw.post) : null,
  documentType: raw.document_type ?? null,
}));

export const transformNoteWithContent = createTransformer<any, NoteWithContent>((raw) => ({
  ...transformNote(raw),
  content: raw.latest_version?.src,
  versionId: raw.latest_version?.id || 0,
  versionDate: raw.latest_version?.created_date || raw.created_date,
  plainText: raw.latest_version?.plain_text || '',
  contentJson: raw.latest_version?.json,
}));

export interface NoteContent {
  id: ID;
  note: ID;
  plain_text: string;
  src: string;
  json: string;
}

export const transformNoteContent = createTransformer<any, NoteContent>((raw) => ({
  id: raw.id,
  note: raw.note,
  plain_text: raw.plain_text,
  src: raw.src,
  json: raw.json,
}));
