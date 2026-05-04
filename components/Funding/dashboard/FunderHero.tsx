'use client';

import { FC } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { FunderOverview } from '@/types/funder';
import { formatCurrency } from '@/utils/currency';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { cn } from '@/utils/styles';

interface FunderHeroProps {
  overview: FunderOverview;
  className?: string;
}

export const FunderHero: FC<FunderHeroProps> = ({ overview, className }) => {
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
      <div className="grid grid-cols-1 gap-7 content-md:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] content-md:gap-7">
        {/* Left — KPIs */}
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
        </div>

        {/* Vertical divider — wide layout only */}
        <div className="hidden content-md:block w-px self-stretch bg-gray-200" />

        {/* Right — supported scientists */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Supported scientists
            </div>
            <Button variant="ghost" size="sm" className="!text-primary-600 font-semibold !-mr-2">
              See all
              <ChevronRight size={14} />
            </Button>
          </div>
          <div className="mt-1 text-4xl tablet:text-5xl font-semibold tracking-tight text-gray-900">
            {overview.supportedScientistsCount}
            <span className="text-lg font-semibold text-gray-500 ml-2">
              {overview.supportedScientistsCount === 1 ? 'scientist' : 'scientists'}
              {overview.supportedInstitutionCount > 0 &&
                ` · ${overview.supportedInstitutionCount} ${overview.supportedInstitutionCount === 1 ? 'institution' : 'institutions'}`}
            </span>
          </div>

          {avatarItems.length > 0 ? (
            <div className="mt-5">
              <AvatarStack
                items={avatarItems}
                size="md"
                maxItems={9}
                spacing={-8}
                showExtraCount
                totalItemsCount={overview.supportedScientistsCount}
                showLabel={false}
              />
            </div>
          ) : (
            <div className="mt-5 text-sm text-gray-400">No supported scientists yet</div>
          )}
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
