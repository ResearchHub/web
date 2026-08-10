import { Metadata } from 'next';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { FeedV2GrantsPageContent } from '@/components/Funding/FeedV2GrantsPageContent';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Fund',
  description: 'Apply for funding opportunities via proposals.',
  url: '/feed-v2/fund',
});

export default function FeedV2FundPage() {
  return (
    <>
      <section className="sr-only">
        <p>
          ResearchHub provides direct funding pathways for scientific research. Browse open funding
          opportunities posted by the ResearchHub Foundation and community funders, or create a
          proposal to pitch your own research for funding consideration.
        </p>
      </section>
      <FeedV2GrantsPageContent />
    </>
  );
}
