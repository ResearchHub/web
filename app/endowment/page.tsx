'use client';

import { useStakingYieldStats } from '@/hooks/useStakingYield';
import { StatsPanel } from './components/StatsPanel';
import { YieldChart } from '@/components/charts/YieldChart';
export default function EndowmentPage() {
  const { stats, isLoading } = useStakingYieldStats();

  return (
    <div>
      <div className="bg-white rounded-lg border border-gray-200 px-6 pt-4 pb-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
        <p className="text-sm text-gray-900">
          <span className="font-semibold text-gray-900">
            Turn RSC holdings into perpetual research funding.
          </span>{' '}
          RSC held on the platform automatically earns Funding Credits daily—yield that can only be
          spent on preregistered research proposals. Principal stays revocable, so a one-time
          deposit becomes an ongoing funding stream: at 30% network participation, $1M in RSC funds
          roughly $1.8M of research over 10 years without touching the original capital.
        </p>
        <a
          href="https://docs.researchhub.com/researchhub/product-features/fund/researchhub-endowment"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-3 text-sm text-primary-500 hover:underline"
        >
          Learn how the endowment works <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 flex">
          <StatsPanel stats={stats} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-3 flex">
          <YieldChart />
        </div>
      </div>
    </div>
  );
}
