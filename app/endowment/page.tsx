'use client';

import { useStakingYieldStats } from '@/hooks/useStakingYield';
import { StatsPanel } from './components/StatsPanel';
import { YieldChart } from '@/components/charts/YieldChart';

export default function EndowmentPage() {
  const { stats, isLoading } = useStakingYieldStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ResearchHub Endowment</h1>
        <p className="mt-2 text-gray-500">
          The ResearchHub Endowment lets RSC holders fund science in perpetuity. RSC held on the
          platform automatically earns Funding Credits daily—yield that can only be spent on
          preregistered research proposals. Principal stays revocable, so a one-time deposit becomes
          an ongoing funding stream: at 30% network participation, $1M in RSC funds roughly $1.8M of
          research over 10 years without touching the original capital.{' '}
          <a
            href="https://docs.researchhub.com/researchhub/product-features/fund/researchhub-endowment"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-500 hover:underline"
          >
            Learn more
          </a>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <StatsPanel stats={stats} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-2">
          <YieldChart />
        </div>
      </div>
    </div>
  );
}
