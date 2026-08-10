import { Metadata } from 'next';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { ProposalFeed } from '@/components/Funding/ProposalFeed';
import { ProposalSortAndFilters } from '@/components/Funding/ProposalSortAndFilters';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Proposals',
  description: 'Propose research, get reviewed, receive funding.',
  url: '/feed-v2/fund/proposals',
});

export default function FeedV2ProposalsPage() {
  return (
    <div>
      <ProposalSortAndFilters />
      <ProposalFeed />
    </div>
  );
}
