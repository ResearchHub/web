import { ReactNode } from 'react';
import { GrantService } from '@/services/grant.service';
import { FundingLayoutClient } from './FundingLayoutClient';
import { FeedEntry } from '@/types/feed';

interface FundingLayoutProps {
  children: ReactNode;
}

/**
 * Server component that fetches grants and passes them to the client layout.
 * This enables static rendering of the /funding page with pre-fetched grants.
 */
export default async function FundingLayout({ children }: FundingLayoutProps) {
  let grants: FeedEntry[] = [];

  try {
    // Fetch grants on the server side
    const result = await GrantService.getGrants({
      page: 1,
      pageSize: 20,
      status: 'OPEN',
      ordering: 'newest',
    });
    grants = result.grants;
  } catch (error) {
    console.error('Failed to fetch grants in layout:', error);
    // Continue with empty grants - the client will fetch them
  }

  return <FundingLayoutClient initialGrants={grants}>{children}</FundingLayoutClient>;
}
