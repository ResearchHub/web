'use client';

import { ReactNode } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FunderOverview } from '@/components/Funding/FunderOverview';
import { FundingDashboardTabs } from '@/components/Funding/FundingDashboardTabs';

interface DashboardPageClientProps {
  children: ReactNode;
  userId?: number;
}

export function DashboardPageClient({ children, userId }: DashboardPageClientProps) {
  return (
    <PageLayout rightSidebar={false}>
      <FunderOverview className="mt-4" userId={userId} />
      <FundingDashboardTabs />
      {children}
    </PageLayout>
  );
}
