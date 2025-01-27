import { Organization, transformOrganization } from './organization';
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

export type TransformedNote = Note & BaseTransformed;

export const transformNote = createTransformer<any, Note>((raw) => ({
  id: raw.id,
  access: raw.access as NoteAccess,
  organization: transformOrganization(raw.organization),
  createdDate: raw.created_date,
  updatedDate: raw.updated_date,
  title: raw.title,
}));
