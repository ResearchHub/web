import { Metadata } from 'next';
import { PageLayout } from '@/app/layouts/PageLayout';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { FunderDashboardContent } from './FunderDashboardContent';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Funder Dashboard',
  description: 'Track the impact of the research you fund.',
  url: '/fund/dashboard',
});

export default function FunderDashboardRoute() {
  return (
    <PageLayout rightSidebar={false} wideContent className="px-4 py-6 tablet:px-8">
      <FunderDashboardContent />
    </PageLayout>
  );
}
