'use client';

import { useStakingYieldStats } from '@/hooks/useStakingYield';
import { StatsPanel } from './components/StatsPanel';
import { ApyChart } from './components/ApyChart';

export default function EndowmentPage() {
  const { stats, isLoading } = useStakingYieldStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ResearchHub Endowment</h1>
        <p className="mt-2 text-gray-500">
          ResearchHub Endowment yield overview and historical performance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <StatsPanel stats={stats} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-2">
          <ApyChart />
        </div>
      </div>
    </div>
  );
}
