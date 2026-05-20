'use client';

import { useStakingYieldStats } from '@/hooks/useStakingYield';
import { StatsPanel } from './components/StatsPanel';
import { YieldChart } from '@/components/charts/YieldChart';
export default function EndowmentPage() {
  const { stats, isLoading } = useStakingYieldStats();

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-2 flex">
          <StatsPanel stats={stats} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-3 flex">
          <YieldChart />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 px-6 pt-4 pb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">How it Works</h2>
        <video
          className="w-full rounded-lg"
          controls
          preload="metadata"
          src="https://assets.prod.researchhub.com/videos/researchHub-endowments.MP4#t=2"
        />
      </div>
    </div>
  );
}
