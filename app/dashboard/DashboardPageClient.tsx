'use client';

import { ReactNode } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FunderOverview } from '@/components/Funding/FunderOverview';
import { FundingDashboardTabs } from '@/components/Funding/FundingDashboardTabs';

interface DashboardPageClientProps {
  children: ReactNode;
}

export function DashboardPageClient({ children }: DashboardPageClientProps) {
  return (
    <PageLayout rightSidebar={false}>
      <FunderOverview className="mt-4" />
      <FundingDashboardTabs />
      {children}
    </PageLayout>
  );
}
