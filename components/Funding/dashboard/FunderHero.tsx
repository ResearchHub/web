'use client';

import { FC, ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Tooltip } from '@/components/ui/Tooltip';
import { FunderOverview, SupportedInstitution } from '@/types/funder';
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
        'relative overflow-hidden rounded-xl border border-gray-200 bg-white px-5 py-4 tablet:py-6 tablet:px-7 shadow-sm',
        'bg-[radial-gradient(1200px_400px_at_-10%_-50%,rgba(57,113,255,.08),transparent_50%),radial-gradient(800px_320px_at_110%_-30%,rgba(57,113,255,.06),transparent_55%)]',
        className
      )}
      aria-label="Funding impact"
    >
      <div className="grid grid-cols-1 gap-4 content-md:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] content-md:gap-7">
        {/* Left — KPIs */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            You have given
          </div>
          <div className="mt-1 text-4xl tablet:text-5xl font-semibold tracking-tight text-gray-900">
            {totalGiven}
            <span className="inline-flex items-center gap-1 text-lg font-semibold text-gray-500 ml-2 align-baseline">
              total
              <Tooltip
                content={
                  <TooltipBody
                    title="Amount given"
                    body="Displayed amount is based on RSC conversion rate at the time of funding. Slight discrepancy is expected."
                  />
                }
                position="top"
                width="w-64"
                className="bg-gray-900 text-white border-gray-900 text-left"
              >
                <HelpCircle size={14} className="text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3 tablet:mt-4">
            <Stat
              label="Community match"
              value={communityMatch}
              tooltip={
                <TooltipBody
                  title="Community match"
                  body="Funds contributed by other ResearchHub members toward the proposals you've supported."
                />
              }
            />
            <div className="hidden tablet:block w-px self-stretch bg-gray-200" />
            <Stat
              label="Total deployed"
              value={totalDeployed}
              tooltip={
                <TooltipBody title="Total deployed" body="Your funding plus the community match." />
              }
            />
            <div className="hidden tablet:block w-px self-stretch bg-gray-200" />
            <Stat label="Match ratio" value={overview.matchRatio} />
          </div>
        </div>

        {/* Vertical divider — wide layout only */}
        <div className="hidden content-md:block w-px self-stretch bg-gray-200" />

        {/* Right — two stacked sections: scientists + institutions */}
        <div className="flex flex-col gap-3 tablet:gap-5">
          <Section label="Scientists supported" count={overview.supportedScientistsCount}>
            {avatarItems.length > 0 ? (
              <AvatarStack
                items={avatarItems}
                size="md"
                maxItems={7}
                spacing={-8}
                showExtraCount
                totalItemsCount={overview.supportedScientistsCount}
                showLabel={false}
                className="!flex"
              />
            ) : (
              <span className="text-xs text-gray-400">None yet</span>
            )}
          </Section>

          <Section label="Institutions supported" count={overview.supportedInstitutionCount}>
            {overview.supportedInstitutions.length > 0 ? (
              <InstitutionPills institutions={overview.supportedInstitutions} />
            ) : (
              <span className="text-xs text-gray-400">None yet</span>
            )}
          </Section>
        </div>
      </div>
    </section>
  );
};

interface StatProps {
  label: string;
  value: string;
  /** Optional explanation rendered in a tooltip next to the label. */
  tooltip?: ReactNode;
}

const Stat: FC<StatProps> = ({ label, value, tooltip }) => (
  <div className="flex flex-col gap-0.5">
    <span className="inline-flex items-center gap-1 text-[11px] leading-none text-gray-500">
      {label}
      {tooltip && (
        <Tooltip
          content={tooltip}
          position="top"
          width="w-64"
          className="bg-gray-900 text-white border-gray-900 text-left"
        >
          <HelpCircle size={11} className="text-gray-400 hover:text-gray-600 cursor-help block" />
        </Tooltip>
      )}
    </span>
    <span className="text-lg font-semibold tracking-tight text-gray-900">{value}</span>
  </div>
);

/** Shared dark-tooltip body — title + paragraph, matches FundingCreditsTooltip style. */
const TooltipBody: FC<{ title: string; body: string }> = ({ title, body }) => (
  <div className="text-left">
    <div className="text-sm font-bold text-white mb-1">{title}</div>
    <p className="text-xs text-gray-300 leading-snug">{body}</p>
  </div>
);

interface SectionProps {
  label: string;
  count: number;
  children: React.ReactNode;
}

/** Horizontal hero subsection: eyebrow over a row with a big count + visual. */
const Section: FC<SectionProps> = ({ label, count, children }) => (
  <div>
    <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</div>
    <div className="mt-1.5 flex items-center gap-4">
      <span className="text-3xl tablet:text-4xl font-semibold tracking-tight text-gray-900 leading-none">
        {count}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  </div>
);

const MAX_VISIBLE_INSTITUTIONS = 3;

const InstitutionPills: FC<{ institutions: SupportedInstitution[] }> = ({ institutions }) => {
  const visible = institutions.slice(0, MAX_VISIBLE_INSTITUTIONS);
  const extra = institutions.length - visible.length;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((inst) => (
        <span
          key={inst.id}
          className="inline-flex items-center max-w-[200px] px-2.5 py-0.5 rounded-full bg-white border border-gray-200 text-[11px] font-medium text-gray-700"
          title={inst.name}
        >
          <span className="truncate">{inst.name}</span>
        </span>
      ))}
      {extra > 0 && <span className="text-[11px] font-medium text-gray-500">+{extra} more</span>}
    </div>
  );
};
