import type { Organization } from './organization';
import { createTransformer, BaseTransformed } from './transformer';
import { transformOrganization } from './organization';
import { ID } from './root';

export type NoteAccess = 'WORKSPACE' | 'PRIVATE' | 'SHARED';

export interface Note {
  id: number;
  access: NoteAccess;
  organization: Organization;
  createdDate: string;
  updatedDate: string;
  title: string;
}

export interface NoteWithContent extends Note {
  content: string;
  contentJson: string;
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

export const transformNote = (data: NoteApiItem): Note => ({
  id: data.id,
  access: data.access,
  organization: transformOrganization(data.organization),
  createdDate: data.created_date,
  updatedDate: data.updated_date,
  title: data.title,
});

export const transformNoteWithContent = (data: any): NoteWithContent => ({
  id: data.id,
  access: data.access,
  organization: transformOrganization(data.organization),
  createdDate: data.created_date,
  updatedDate: data.updated_date,
  title: data.title,
  content: data.latest_version?.src || '',
  versionId: data.latest_version?.id || 0,
  versionDate: data.latest_version?.created_date || data.created_date,
  plainText: data.latest_version?.plain_text || '',
  contentJson: data.latest_version?.json || '',
});

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
