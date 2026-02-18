'use client';

import { ReactNode } from 'react';
import { GrantProvider } from '@/contexts/GrantContext';
import { ProposalListProvider } from '@/contexts/ProposalListContext';
import { FeedEntry } from '@/types/feed';

interface FundingLayoutClientProps {
  children: ReactNode;
  initialGrants: FeedEntry[];
}

/**
 * Client component wrapper that provides the GrantContext and ProposalListContext
 * with server-fetched grants. This allows the grants to be statically rendered
 * while still using React context.
 */
export function FundingLayoutClient({ children, initialGrants }: FundingLayoutClientProps) {
  return (
    <GrantProvider initialGrants={initialGrants}>
      <ProposalListProvider>{children}</ProposalListProvider>
    </GrantProvider>
  );
}
