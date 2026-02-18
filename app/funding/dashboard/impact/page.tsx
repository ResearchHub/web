'use client';

import { useSearchParams } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useImpactData } from '@/app/funding/dashboard/lib/useImpactData';
import { parseUserId } from '@/app/funding/dashboard/lib/dashboardUtils';
import { MilestonesCard } from '@/components/Funding/MilestonesCard';
import { FundingChart } from '@/components/Funding/FundingChart';

export default function ImpactPage() {
  const searchParams = useSearchParams();
  const userId = parseUserId(searchParams.get('user_id'));

  const { data, isLoading, error } = useImpactData(userId);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center gap-2 py-8 text-gray-500 justify-center">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      );
    }

    if (!data) return null;

    return (
      <>
        <MilestonesCard milestones={data.milestones} />
        <FundingChart data={data.fundingOverTime} />
      </>
    );
  };

  return (
    <PageLayout rightSidebar={false}>
      <div className="space-y-8 pb-12">
        <header className="pl-1 tablet:!pl-0">
          <h2 className="text-2xl font-bold text-gray-900">Your impact story</h2>
          <p className="text-gray-600 mt-1">
            A scoreboard of what your funding is enabling—and how it&apos;s growing.
          </p>
        </header>
        {renderContent()}
      </div>
    </PageLayout>
  );
}
