import { Metadata } from 'next';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FunderDashboardPage } from './components/FunderDashboardPage';
import { buildOpenGraphMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Funder Dashboard',
  description: 'Track the impact of the research you fund.',
  url: '/fund/dashboard',
});

export default function FunderDashboardRoute() {
  return (
    <PageLayout rightSidebar={false}>
      <FunderDashboardPage />
    </PageLayout>
  );
}
