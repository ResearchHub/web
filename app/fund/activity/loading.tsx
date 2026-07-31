import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingBannerSkeleton } from '@/components/Funding/FundingBannerSkeleton';
import { ActivityCardSkeleton } from '@/components/Activity/ActivityCardSkeleton';
import { FundSidebar } from '@/components/Funding/FundSidebar';

export default function FundActivityLoading() {
  return (
    <PageLayout topBanner={<FundingBannerSkeleton showTabs />} rightSidebar={<FundSidebar />}>
      <div>
        {[...Array(6)].map((_, i) => (
          <ActivityCardSkeleton key={i} />
        ))}
      </div>
    </PageLayout>
  );
}
