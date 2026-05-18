'use client';

import { FC, ReactNode, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie } from '@fortawesome/pro-solid-svg-icons';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Tooltip } from '@/components/ui/Tooltip';
import { FunderOverview, SupportedInstitution, SupportedResearcher } from '@/types/funder';
import { formatCurrency } from '@/utils/currency';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { cn } from '@/utils/styles';
import { Avatar } from '@/components/ui/Avatar';
import { BaseModal } from '@/components/ui/BaseModal';
import { FundingBreakdownModal } from './FundingBreakdownModal';

interface FunderHeroProps {
  overview: FunderOverview;
  className?: string;
}

export const FunderHero: FC<FunderHeroProps> = ({ overview, className }) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isScientistsOpen, setIsScientistsOpen] = useState(false);
  const [isInstitutionsOpen, setIsInstitutionsOpen] = useState(false);

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
          <button
            type="button"
            onClick={() => setIsBreakdownOpen(true)}
            className="mt-1 flex items-center gap-2 group text-left"
          >
            <span className="text-4xl tablet:text-5xl font-semibold tracking-tight text-primary-600 border-b-[3px] border-transparent group-hover:border-primary-600 transition-all">
              {totalGiven}
            </span>
            <FontAwesomeIcon
              icon={faChartPie}
              className="h-5 w-5 text-primary-400 group-hover:text-primary-600 transition-colors mt-1"
              aria-hidden
            />
          </button>

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
          </div>
        </div>

        {/* Vertical divider — wide layout only */}
        <div className="hidden content-md:block w-px self-stretch bg-gray-200" />

        {/* Right — two stacked sections: scientists + institutions */}
        <div className="flex flex-col gap-3 tablet:gap-5">
          <Section label="Scientists supported" count={overview.supportedScientistsCount}>
            {avatarItems.length > 0 ? (
              <button
                type="button"
                onClick={() => setIsScientistsOpen(true)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <AvatarStack
                  items={avatarItems}
                  size="md"
                  maxItems={7}
                  spacing={-8}
                  showExtraCount
                  disableTooltip
                  totalItemsCount={overview.supportedScientistsCount}
                  showLabel={false}
                  className="!flex"
                />
              </button>
            ) : (
              <span className="text-xs text-gray-400">None yet</span>
            )}
          </Section>

          <Section label="Institutions supported" count={overview.supportedInstitutionCount}>
            {overview.supportedInstitutions.length > 0 ? (
              <InstitutionPills
                institutions={overview.supportedInstitutions}
                onShowAll={() => setIsInstitutionsOpen(true)}
              />
            ) : (
              <span className="text-xs text-gray-400">None yet</span>
            )}
          </Section>
        </div>
      </div>

      <FundingBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        overview={overview}
      />

      <ScientistsModal
        isOpen={isScientistsOpen}
        onClose={() => setIsScientistsOpen(false)}
        researchers={overview.supportedResearchers}
      />

      <InstitutionsModal
        isOpen={isInstitutionsOpen}
        onClose={() => setIsInstitutionsOpen(false)}
        institutions={overview.supportedInstitutions}
      />
    </section>
  );
};

interface StatProps {
  label: string;
  value: string;
  tooltip?: ReactNode;
}

const Stat: FC<StatProps> = ({ label, value, tooltip }) => {
  const content = (
    <div className={cn('flex flex-col gap-0.5', tooltip && 'cursor-help')}>
      <span className="text-[11px] leading-none text-gray-500">{label}</span>
      <span className="text-lg font-semibold tracking-tight text-gray-900">{value}</span>
    </div>
  );

  if (!tooltip) return content;

  return (
    <Tooltip
      content={tooltip}
      position="top"
      width="w-64"
      className="bg-gray-900 text-white border-gray-900 text-left"
    >
      {content}
    </Tooltip>
  );
};

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

const InstitutionPills: FC<{ institutions: SupportedInstitution[]; onShowAll?: () => void }> = ({
  institutions,
  onShowAll,
}) => {
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
      {extra > 0 && (
        <button
          type="button"
          onClick={onShowAll}
          className="text-[11px] font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          +{extra} more
        </button>
      )}
    </div>
  );
};

const ScientistsModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  researchers: SupportedResearcher[];
}> = ({ isOpen, onClose, researchers }) => (
  <BaseModal isOpen={isOpen} onClose={onClose} title="Scientists supported" size="md">
    <div className="space-y-1">
      {researchers.map((r) => (
        <div key={r.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50">
          <Avatar
            src={r.authorProfile.profileImage}
            alt={r.authorProfile.fullName}
            size="sm"
            disableTooltip
            className="flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">
              {r.authorProfile.fullName}
            </div>
            {r.authorProfile.headline && (
              <div className="text-xs text-gray-500 truncate">{r.authorProfile.headline}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  </BaseModal>
);

const InstitutionsModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  institutions: SupportedInstitution[];
}> = ({ isOpen, onClose, institutions }) => (
  <BaseModal isOpen={isOpen} onClose={onClose} title="Institutions supported" size="md">
    <div className="space-y-1">
      {institutions.map((inst) => (
        <div key={inst.id} className="px-2 py-2 rounded-lg hover:bg-gray-50">
          <div className="text-sm font-medium text-gray-900">{inst.name}</div>
          {inst.city && (
            <div className="text-xs text-gray-500">
              {inst.city}
              {inst.countryCode ? `, ${inst.countryCode}` : ''}
            </div>
          )}
        </div>
      ))}
    </div>
  </BaseModal>
);
