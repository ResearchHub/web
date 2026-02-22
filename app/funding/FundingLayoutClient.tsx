'use client';

import { ReactNode } from 'react';
import { GrantProvider } from '@/contexts/GrantContext';

interface FundingLayoutClientProps {
  children: ReactNode;
}

export function FundingLayoutClient({ children }: FundingLayoutClientProps) {
  return <GrantProvider>{children}</GrantProvider>;
}
