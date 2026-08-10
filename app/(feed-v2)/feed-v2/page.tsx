import { Metadata } from 'next';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { FundActivityPageContent } from '@/components/Funding/FundActivityPageContent';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Activity',
  description: 'Recent activity across funding opportunities and proposals.',
  url: '/feed-v2',
});

export default function FeedV2ActivityPage() {
  return <FundActivityPageContent />;
}
