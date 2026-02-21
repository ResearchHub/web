'use client';

import { ReactNode } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { ActivitySidebar } from '@/components/Funding/ActivitySidebar';

interface DashboardPageClientProps {
  children: ReactNode;
}

export function DashboardPageClient({ children }: DashboardPageClientProps) {
  return <PageLayout rightSidebar={<ActivitySidebar />}>{children}</PageLayout>;
}
