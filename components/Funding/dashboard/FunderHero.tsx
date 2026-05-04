'use client';

import { FC } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { FundingChart } from '@/components/Funding/FundingChart';
import { FunderOverview } from '@/types/funder';
import { FundingPoint } from '@/types/fundingImpactData';
import { formatCurrency } from '@/utils/currency';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { cn } from '@/utils/styles';

interface FunderHeroProps {
  overview: FunderOverview;
  fundingOverTime: FundingPoint[];
  className?: string;
}

export const FunderHero: FC<FunderHeroProps> = ({ overview, fundingOverTime, className }) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  const fmt = (rsc: number, usd: number) =>
    formatCurrency({
      amount: showUSD ? usd : rsc,
      showUSD,
      exchangeRate,
      shorten: true,
      skipConversion: true,
    });

  const totalGiven = fmt(overview.totalGiven.rsc, overview.totalGiven.usd);
  const communityMatch = fmt(overview.communityMatch.rsc, overview.communityMatch.usd);
  const totalDeployed = fmt(overview.totalDeployed.rsc, overview.totalDeployed.usd);

  const avatarItems = overview.supportedResearchers.map((r) => ({
    src: r.authorProfile.profileImage,
    alt: r.authorProfile.fullName,
    authorId: r.authorProfile.id,
  }));

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-xl border border-gray-200 bg-white px-5 py-6 tablet:px-7 shadow-sm',
        'bg-[radial-gradient(1200px_400px_at_-10%_-50%,rgba(57,113,255,.08),transparent_50%),radial-gradient(800px_320px_at_110%_-30%,rgba(57,113,255,.06),transparent_55%)]',
        className
      )}
      aria-label="Funding impact"
    >
      <div className="grid grid-cols-1 gap-7 content-md:grid-cols-[minmax(0,1fr)_1px_minmax(0,1.05fr)] content-md:gap-7">
        {/* Left column — KPIs + scientists row */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            You have given
          </div>
          <div className="mt-1 text-4xl tablet:text-5xl font-semibold tracking-tight text-gray-900">
            {totalGiven}
            <span className="text-lg font-semibold text-gray-500 ml-2">total</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
            <Stat label="Community match" value={communityMatch} />
            <div className="hidden tablet:block w-px self-stretch bg-gray-200" />
            <Stat label="Total deployed" value={totalDeployed} />
            <div className="hidden tablet:block w-px self-stretch bg-gray-200" />
            <Stat label="Match ratio" value={overview.matchRatio} />
          </div>

          {/* Scientists row */}
          <div className="mt-5 flex items-center gap-3.5 rounded-xl border border-gray-200 bg-white px-3.5 py-3">
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-semibold tracking-tight text-gray-900">
                {overview.supportedScientistsCount}
              </span>
              <span className="mt-1 text-[11px] text-gray-500">
                scientists · {overview.supportedInstitutionCount} institutions
              </span>
            </div>
            <div className="hidden sm:block w-px self-stretch bg-gray-200" />
            {avatarItems.length > 0 && (
              <AvatarStack
                items={avatarItems}
                size="sm"
                maxItems={7}
                spacing={-8}
                showExtraCount
                totalItemsCount={overview.supportedScientistsCount}
                showLabel={false}
              />
            )}
            <Button variant="ghost" size="sm" className="ml-auto !text-primary-600 font-semibold">
              See all
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>

        {/* Vertical divider — only on wide layout */}
        <div className="hidden content-md:block w-px self-stretch bg-gray-200" />

        {/* Right column — chart */}
        <div className="flex flex-col">
          <div className="flex justify-end gap-3 text-xs text-gray-500 whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary-600" />
              Your funding
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-indigo-300" />+ Community match
            </span>
          </div>
          <div className="mt-3 w-full">
            {fundingOverTime.length > 0 ? (
              <FundingChart data={fundingOverTime} stacked showLegend={false} />
            ) : (
              <div className="flex h-[220px] items-center justify-center text-sm text-gray-400">
                No funding data yet
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

interface StatProps {
  label: string;
  value: string;
}

const Stat: FC<StatProps> = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[11px] text-gray-500">{label}</span>
    <span className="text-lg font-semibold tracking-tight text-gray-900">{value}</span>
  </div>
);
