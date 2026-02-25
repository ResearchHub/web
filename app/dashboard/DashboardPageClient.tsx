'use client';

import { ReactNode } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { DashboardStats } from '@/components/Funding/DashboardStats';
import { FundingDashboardTabs } from '@/components/Funding/FundingDashboardTabs';

interface DashboardPageClientProps {
  children: ReactNode;
}

export function DashboardPageClient({ children }: DashboardPageClientProps) {
  return (
    <PageLayout rightSidebar={<div></div>}>
      <DashboardStats className="mt-4" />
      <FundingDashboardTabs />
      {children}
    </PageLayout>
  );
}
