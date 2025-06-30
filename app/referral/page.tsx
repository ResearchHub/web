import { Metadata } from 'next';
import { ReferralDashboard } from '@/components/Referral';
import { PageLayout } from '@/app/layouts/PageLayout';

export const metadata: Metadata = {
  title: 'Referral Program',
};

const ReferralPage = () => {
  return (
    <PageLayout rightSidebar={false}>
      <ReferralDashboard />
    </PageLayout>
  );
};

export default ReferralPage;
