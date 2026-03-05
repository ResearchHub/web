import { Currency, ID } from './root';
import { createTransformer } from './transformer';
import { AuthorProfile, transformAuthorProfile } from './authorProfile';
import { Contact, transformContact } from './note';

export type GrantStatus = 'OPEN' | 'CLOSED' | 'PENDING' | 'DECLINED' | 'COMPLETED';

export const GRANT_STATUS_CONFIG: Record<
  GrantStatus,
  { dotClass: string; badgeClass: string; label: string }
> = {
  OPEN: {
    dotClass: 'bg-emerald-500',
    badgeClass: 'text-primary-700 bg-primary-100',
    label: 'Accepting Applications',
  },
  CLOSED: { dotClass: 'bg-gray-400', badgeClass: 'text-gray-500 bg-gray-200', label: 'Closed' },
  PENDING: {
    dotClass: 'bg-yellow-500',
    badgeClass: 'text-yellow-700 bg-yellow-100',
    label: 'Pending Review',
  },
  DECLINED: { dotClass: 'bg-red-500', badgeClass: 'text-red-700 bg-red-100', label: 'Declined' },
  COMPLETED: {
    dotClass: 'bg-blue-500',
    badgeClass: 'text-blue-700 bg-blue-100',
    label: 'Completed',
  },
};

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
  reviewedBy?: {
    id: ID;
    authorProfile: AuthorProfile;
    firstName: string;
    lastName: string;
  };
  reviewedDate?: string;
  declineReason?: string;
}

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
  reviewedBy: raw.reviewed_by
    ? {
        id: raw.reviewed_by.id,
        authorProfile: transformAuthorProfile(raw.reviewed_by.author_profile),
        firstName: raw.reviewed_by.first_name,
        lastName: raw.reviewed_by.last_name,
      }
    : undefined,
  reviewedDate: raw.reviewed_date ?? undefined,
  declineReason: raw.decline_reason ?? undefined,
}));
