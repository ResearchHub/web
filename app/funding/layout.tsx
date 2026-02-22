import { ReactNode } from 'react';
import { FundingLayoutClient } from './FundingLayoutClient';

interface FundingLayoutProps {
  children: ReactNode;
}

export default function FundingLayout({ children }: FundingLayoutProps) {
  return <FundingLayoutClient>{children}</FundingLayoutClient>;
}
