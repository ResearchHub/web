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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
        <p className="text-sm text-gray-900">
          <span className="font-semibold text-gray-900">
            ResearchHub Endowment turns your RSC holdings into a continuous stream of research
            funding.
          </span>{' '}
          By holding RSC on the platform, you automatically earn Funding Credits—a currency that can
          only be used to fund preregistered research proposals. Funding Credits are distributed
          daily, with transparent updates on the My Wallet page. There are no lockup periods — you
          may withdraw your principal any time. Yield rates vary based on platform participation.
          See below for current and historical performance metrics.
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
    </div>
  );
}
