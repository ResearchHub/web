import { Metadata } from 'next';
import { ReferralDashboard } from '@/components/Referral';
import { PageLayout } from '@/app/layouts/PageLayout';
import { getReferralMetadata } from '@/lib/metadata-helpers';

export const metadata = getReferralMetadata({
  url: '/referral',
  isJoinPage: false,
});

const ReferralPage = () => {
  return (
    <PageLayout rightSidebar={false}>
      <ReferralDashboard />
    </PageLayout>
  );
};

export default ReferralPage;
