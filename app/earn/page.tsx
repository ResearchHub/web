import { Metadata } from 'next';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { PageLayout } from '@/app/layouts/PageLayout';
import { EarnSidebarPlaceholder } from '@/components/Earn/EarnSidebarPlaceholder';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { EarnDashboard, EARN_BOUNTIES_ANCHOR } from '@/components/Earn/EarnDashboard';
import { ReviewsPageContent } from './ReviewsPageContent';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Earn ResearchCoin',
  description: 'Earn ResearchCoin by holding it for yield or peer-reviewing science.',
  url: '/earn',
});

export default async function EarnPage() {
  return (
    <PageLayout rightSidebar={<EarnSidebarPlaceholder />}>
      <section className="sr-only">
        <p>
          ResearchHub offers two ways to earn ResearchCoin in one place. You can hold ResearchCoin
          to earn daily yield through the ResearchHub Endowment, where your balance accrues funding
          credits used to fund science, or you can complete paid peer reviews on papers and
          proposals that need expert evaluation.
        </p>
        <p>
          "ResearchHub compensates researchers for peer-reviewing scientific preprints. Unlike
          traditional academic peer review, which is typically unpaid and can take months, reviews
          on ResearchHub are paid $150 each after quality check from established researchers, with
          turn-around times of around 10 days.
        </p>
        <p>
          Browse open peer-review bounties below to find papers or proposals in your field of
          expertise. Each listing includes the paper, reward amount, and submission deadline. When
          you find a match, submit a structured review following our peer review guidelines. Reviews
          are evaluated by the requesting author or our editorial team, and approved submissions
          receive compensation promptly.
        </p>
        <p>
          Quality peer review is essential to the scientific process, and we believe reviewers
          deserve to be compensated accordingly. By attaching real compensation to reviews,
          ResearchHub incentivizes faster, more thorough feedback — feedback that helps authors
          strengthen their work and helps readers assess new research. Reviewers also build a public
          track record of contributions that strengthens their academic profile over time.
        </p>
        <p>
          Whether you are a graduate student engaging with the latest research, a postdoc building
          your review track record, or an experienced scientist who wants fair compensation for work
          you would do regardless, ResearchHub makes peer review worth your time. Browse the open
          bounties to get started. Researchers are not required to use any peer reviews and funding
          opportunities never use peer reviews to gatekeep. Instead, peer reviews on ResearchHub are
          to provide the audience of authors, funders, and users with context about the research and
          ways it can improve.
        </p>
      </section>
      <EarnDashboard />

      <div id={EARN_BOUNTIES_ANCHOR} className="scroll-mt-4 mt-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <RadiatingDot ring color="bg-emerald-500" />
          Open peer-review bounties
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Pick a paper or proposal in your field and earn ResearchCoin for your review.
        </p>
        <ReviewsPageContent />
      </div>
    </PageLayout>
  );
}
