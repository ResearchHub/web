'use client';

import { FunderDashboard } from '@/components/FunderDashboard/FunderDashboard';
import { PageLayout } from '@/app/layouts/PageLayout';

export default function FunderDashboardPage() {
  return (
    <PageLayout rightSidebar={false}>
      <FunderDashboard />
    </PageLayout>
  );
}
