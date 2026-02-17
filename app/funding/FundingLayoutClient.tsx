'use client';

import { ReactNode } from 'react';
import { GrantProvider } from '@/contexts/GrantContext';
import { FeedEntry } from '@/types/feed';

interface FundingLayoutClientProps {
  children: ReactNode;
  initialGrants: FeedEntry[];
}

/**
 * Client component wrapper that provides the GrantContext with server-fetched grants.
 * This allows the grants to be statically rendered while still using React context.
 */
export function FundingLayoutClient({ children, initialGrants }: FundingLayoutClientProps) {
  return <GrantProvider initialGrants={initialGrants}>{children}</GrantProvider>;
}
