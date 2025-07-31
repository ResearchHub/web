import { Metadata } from 'next';
import { JoinPageContent } from '@/components/Referral/JoinPageContent';
import { PageLayout } from '@/app/layouts/PageLayout';
import { getReferralMetadata } from '@/lib/metadata-helpers';

export const metadata = getReferralMetadata({
  url: '/referral/join',
  isJoinPage: true,
});

export default function JoinPage() {
  return (
    <PageLayout rightSidebar={false}>
      <JoinPageContent />
    </PageLayout>
  );
}
