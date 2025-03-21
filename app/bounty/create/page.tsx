'use client';

import { BountyForm } from '@/components/Bounty/BountyForm';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { ResearchCoinRightSidebar } from '@/components/ResearchCoin/ResearchCoinRightSidebar';

export default function CreateBountyPage() {
  const router = useRouter();

  const handleSubmitSuccess = () => {
    router.push('/bounties'); // Redirect to bounties list after successful creation
  };

  return (
    <PageLayout rightSidebar={<ResearchCoinRightSidebar />}>
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create a Bounty</h1>
          <p className="mt-2 text-gray-600">
            Engage the world's brightest minds by offering ResearchCoin for peer reviews or answers
            to your research questions.
          </p>
        </div>
        <BountyForm onSubmitSuccess={handleSubmitSuccess} className="w-full" />
      </div>
    </PageLayout>
  );
}
