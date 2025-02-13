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
  isRemoved: boolean;
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

export const transformNote = createTransformer<any, Note>((raw) => ({
  id: raw.id,
  access: raw.access,
  organization: transformOrganization(raw.organization),
  createdDate: raw.created_date,
  updatedDate: raw.updated_date,
  title: raw.title,
  isRemoved: raw.unifiedDocument?.isRemoved || false,
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
