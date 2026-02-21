import { Currency, ID } from './root';
import { createTransformer } from './transformer';
import { AuthorProfile, transformAuthorProfile } from './authorProfile';
import { Contact, transformContact } from './note';

export type GrantStatus = 'OPEN' | 'CLOSED';

export interface GrantAmount {
  usd: number;
  rsc: number;
  formatted: string;
}

export interface Grant {
  id: ID;
  createdBy: {
    id: ID;
    authorProfile: AuthorProfile;
    firstName: string;
    lastName: string;
  };
  amount: GrantAmount;
  currency: Currency;
  organization: string;
  description: string;
  status: GrantStatus;
  startDate: string;
  endDate: string;
  contacts: Contact[];
  applicants?: AuthorProfile[];
}

export interface GrantForModal {
  id: string;
  title: string;
  noteId: number | null;
  createdDate: string;
  status: 'published' | 'draft';
}

export const transformGrantForModal = (raw: any): GrantForModal => ({
  id: raw.id.toString(),
  title: raw.title || 'Untitled RFP',
  noteId: raw.note?.id ?? null,
  createdDate: raw.created_date,
  status: raw.doi ? 'published' : 'draft',
});

export const transformGrant = createTransformer<any, Grant>((raw) => ({
  id: raw.id,
  createdBy: {
    id: raw.created_by.id,
    authorProfile: transformAuthorProfile(raw.created_by.author_profile),
    firstName: raw.created_by.first_name,
    lastName: raw.created_by.last_name,
  },
  amount: {
    usd: raw.amount.usd,
    rsc: raw.amount.rsc,
    formatted: raw.amount.formatted,
  },
  currency: raw.currency as Currency,
  organization: raw.organization,
  description: raw.description,
  status: raw.status as GrantStatus,
  startDate: raw.start_date,
  endDate: raw.end_date,
  contacts: Array.isArray(raw.contacts)
    ? raw.contacts.map((contact: any) => transformContact(contact))
    : undefined,
  applicants: Array.isArray(raw.applications)
    ? raw.applications.map((application: any) => transformAuthorProfile(application.applicant))
    : undefined,
}));
