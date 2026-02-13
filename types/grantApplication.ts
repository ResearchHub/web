import { ID } from './root';
import { Grant } from './grant';
import { transformAuthorProfile } from './authorProfile';

export interface GrantApplication {
  id: ID;
  grant: Pick<
    Grant,
    | 'id'
    | 'title'
    | 'createdBy'
    | 'amount'
    | 'organization'
    | 'status'
    | 'startDate'
    | 'endDate'
    | 'currency'
  >;
}

export const transformGrantApplication = (raw: any): GrantApplication => ({
  id: raw.id,
  grant: {
    id: raw.grant.id,
    title: raw.grant.title || '',
    createdBy: {
      id: raw.grant.created_by.id,
      authorProfile: transformAuthorProfile(raw.grant.created_by.author_profile),
      firstName: raw.grant.created_by.first_name,
      lastName: raw.grant.created_by.last_name,
    },
    amount: {
      usd: raw.grant.amount.usd,
      rsc: raw.grant.amount.rsc,
      formatted: raw.grant.amount.formatted,
    },
    organization: raw.grant.organization,
    status: raw.grant.status,
    startDate: raw.grant.start_date,
    endDate: raw.grant.end_date,
    currency: raw.grant.goal_currency || raw.grant.currency,
  },
});
