import type { Organization } from './organization';
import { createTransformer, BaseTransformed } from './transformer';

export type NoteAccess = 'WORKSPACE' | 'PRIVATE' | 'SHARED';

export interface Note {
  id: number;
  access: NoteAccess;
  organization: Organization;
  createdDate: string;
  updatedDate: string;
  title: string;
}

export interface NoteContent extends Note {
  content: string;
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
  organization: {
    id: data.organization.id,
    coverImage: data.organization.cover_image,
    name: data.organization.name,
    slug: data.organization.slug,
  },
  createdDate: data.created_date,
  updatedDate: data.updated_date,
  title: data.title,
});

export const transformNoteContent = (data: any): NoteContent => ({
  id: data.id,
  access: data.access,
  organization: {
    id: data.organization.id,
    coverImage: data.organization.cover_image,
    name: data.organization.name,
    slug: data.organization.slug,
  },
  createdDate: data.created_date,
  updatedDate: data.updated_date,
  title: data.title,
  content: data.latest_version?.src || '',
  versionId: data.latest_version?.id || 0,
  versionDate: data.latest_version?.created_date || data.created_date,
  plainText: data.latest_version?.plain_text || '',
});
