import { Suspense } from 'react';
import { Metadata } from 'next';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { EarnHeroBanner } from '@/components/Earn/EarnHeroBanner';
import { ReviewsPageContent } from './ReviewsPageContent';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Earn for Peer Reviews',
  description: 'Earn ResearchCoin for peer-reviewing papers.',
  url: '/earn',
});

export default async function EarnPage() {
  return (
    <PageLayout
      topBanner={<EarnHeroBanner />}
      rightSidebar={
        <Suspense fallback={<ActivitySidebarSkeleton />}>
          <FundingSidebarServer scope="peer_reviews" />
        </Suspense>
      }
    >
      <section className="sr-only">
        <p>
          ResearchHub compensates researchers for peer-reviewing scientific preprints. Unlike
          traditional academic peer review, which is typically unpaid and can take months, reviews
          on ResearchHub are bounty-based — each paper carries a specific reward, and accepted
          reviews earn ResearchCoin (RSC).
        </p>
        <p>
          Browse open peer-review bounties below to find papers in your field of expertise. Each
          listing includes the paper, reward amount, and submission deadline. When you find a match,
          submit a structured review following our peer review guidelines. Reviews are evaluated by
          the requesting author or our editorial team, and approved submissions receive compensation
          promptly.
        </p>
        <p>
          Quality peer review is essential to the scientific process, and we believe reviewers
          deserve to be treated accordingly. By attaching real compensation to reviews, ResearchHub
          incentivizes faster, more thorough feedback — feedback that helps authors strengthen their
          work and helps readers assess new research. Reviewers also build a public track record of
          contributions that strengthens their academic profile over time.
        </p>
        <p>
          Whether you are a graduate student engaging with the latest research, a postdoc building
          your review track record, or an experienced scientist who wants fair compensation for work
          you would do regardless, ResearchHub makes peer review worth your time. Browse the open
          bounties to get started.
        </p>
      </section>
      <ReviewsPageContent />
    </PageLayout>
  );
}
