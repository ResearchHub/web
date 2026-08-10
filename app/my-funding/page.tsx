import { Metadata } from 'next';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FunderDashboardPage } from '@/app/fund/dashboard/components/FunderDashboardPage';
import { buildOpenGraphMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Your Funding',
  description: 'Track the impact of the research you fund.',
  url: '/my-funding',
});

export default function MyFundingRoute() {
  return (
    <PageLayout rightSidebar={false} wideContent>
      <FunderDashboardPage />
    </PageLayout>
  );
}
