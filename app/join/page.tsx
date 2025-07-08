import { Metadata } from 'next';
import { JoinPageContent } from '@/app/join/JoinPageContent';
import { PageLayout } from '@/app/layouts/PageLayout';

export const metadata: Metadata = {
  title: 'Join ResearchHub',
  description:
    'Join ResearchHub and accelerate science together. Get invited by a friend and earn bonus rewards.',
};

export default function JoinPage() {
  return (
    <PageLayout rightSidebar={false}>
      <JoinPageContent />
    </PageLayout>
  );
}
