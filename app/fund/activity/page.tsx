import { Metadata } from 'next';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { PageLayout } from '@/app/layouts/PageLayout';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { MarketplaceCards } from '@/components/Funding/MarketplaceCards';
import { FundingHeroPanel } from '@/components/Funding/FundingHeroPanel';
import { OpenFundingOpportunityCTA } from '../OpenFundingOpportunityCTA';
import { FundActivityPageContent } from './FundActivityPageContent';
import { FundSidebar } from '@/components/Funding/FundSidebar';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Activity',
  description: 'Recent activity across funding opportunities and proposals.',
  url: '/fund/activity',
});

export default async function FundActivityPage() {
  return (
    <PageLayout
      topBanner={
        <HeroHeader
          title="Activity"
          subtitle={
            <p className="text-sm sm:text-base text-gray-500">
              Recent activity across funding opportunities and proposals.
            </p>
          }
          cta={<FundingHeroPanel primaryCta={<OpenFundingOpportunityCTA />} />}
          alignTop
        >
          <MarketplaceCards selected="activity" />
        </HeroHeader>
      }
      rightSidebar={<FundSidebar />}
    >
      <FundActivityPageContent />
    </PageLayout>
  );
}
