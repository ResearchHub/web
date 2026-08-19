'use client';

import { FC, ReactNode, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Tooltip } from '@/components/ui/Tooltip';
import { FunderOverview, SupportedInstitution, SupportedResearcher } from '@/types/funder';
import { formatCurrency } from '@/utils/currency';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { cn } from '@/utils/styles';
import { Avatar } from '@/components/ui/Avatar';
import { BaseModal } from '@/components/ui/BaseModal';

interface FunderHeroProps {
  overview: FunderOverview;
  className?: string;
}

export const FunderHero: FC<FunderHeroProps> = ({ overview, className }) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
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

  // No authorId: Avatar turns that into a <Link>, which can't live inside the
  // row's button. Profile links live in the modal instead.
  const avatarItems = overview.supportedResearchers.map((r) => ({
    src: r.authorProfile.profileImage,
    alt: r.authorProfile.fullName,
  }));

  const scientistCount = overview.supportedScientistsCount;
  const institutionCount = overview.supportedInstitutionCount;
  const hasSupporters = scientistCount > 0 || institutionCount > 0;

  return (
    <section
      className={cn(
        'rounded-xl border border-gray-200 bg-white px-5 py-4 tablet:py-6 tablet:px-7 shadow-sm',
        className
      )}
      aria-label="Funding impact"
    >
      {/* One row at every width — stacking these was costing three rows on phones.
          justify-evenly keeps the phone layout (where cells size to their content)
          off the card's edges; from tablet up the cells are equal thirds and the
          spacing is moot. */}
      <div className="flex items-stretch justify-evenly gap-2 tablet:gap-7">
        <Kpi
          hero
          label="Total deployed"
          shortLabel="Deployed"
          value={totalDeployed}
          tooltip={
            <TooltipBody
              title="Total deployed"
              body="Your funding plus the amount the community matched."
            />
          }
        />

        <Divider />

        <Kpi label="You have given" shortLabel="Given" value={totalGiven} />

        <Divider />

        <Kpi
          label="Community matched"
          shortLabel="Matched"
          value={communityMatch}
          tooltip={
            <TooltipBody
              title="Community matched"
              body="Funds contributed by other ResearchHub members toward the proposals you've supported."
            />
          }
        />
      </div>

      {/* Side by side when both fit, wrapping to their own lines when not. */}
      {hasSupporters && (
        <div className="mt-5 flex flex-wrap gap-x-10 gap-y-4 border-t border-gray-200 pt-4">
          {scientistCount > 0 && (
            <SupporterRow
              label={
                <>
                  <span className="font-mono">{scientistCount}</span>{' '}
                  {scientistCount === 1 ? 'scientist' : 'scientists'} supported
                </>
              }
              onShowAll={() => setIsScientistsOpen(true)}
              className="shrink-0"
            >
              <AvatarStack
                items={avatarItems}
                size="md"
                maxItems={7}
                spacing={-8}
                showExtraCount
                disableTooltip
                totalItemsCount={scientistCount}
                showLabel={false}
                className="!flex"
              />
            </SupporterRow>
          )}

          {institutionCount > 0 && (
            <SupporterRow
              label={
                <>
                  <span className="font-mono">{institutionCount}</span>{' '}
                  {institutionCount === 1 ? 'institution' : 'institutions'} supported
                </>
              }
              onShowAll={() => setIsInstitutionsOpen(true)}
              className="min-w-[240px] flex-1"
            >
              <InstitutionChips institutions={overview.supportedInstitutions} />
            </SupporterRow>
          )}
        </div>
      )}

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

const Divider: FC<{ className?: string }> = ({ className }) => (
  <div className={cn('w-px shrink-0 self-stretch bg-gray-200', className)} />
);

interface KpiProps {
  label: string;
  /** Shown below tablet, where three full labels can't fit on one row. */
  shortLabel: string;
  value: string;
  hero?: boolean;
  tooltip?: ReactNode;
}

/**
 * From tablet up each cell takes an equal third and centers itself, so the
 * three sit evenly across the card rather than being pushed to the left, middle
 * and right edges. Below that the cells size to their content — equal thirds
 * are too narrow for the values on a phone and they collide.
 */
const KPI_CELL = 'min-w-0 tablet:flex-1';

/**
 * All three amounts share one size until the card reaches its full desktop
 * width, where the hero becomes the largest number on the row again. Mixing
 * sizes in a row this tight reads as a rendering bug, and `text-2xl` is as
 * large as three values can go before they collide on a phone.
 */
const KPI_VALUE =
  'whitespace-nowrap font-mono font-semibold leading-none tracking-tight text-2xl tablet:text-4xl';

const Kpi: FC<KpiProps> = ({ label, shortLabel, value, hero, tooltip }) => {
  const content = (
    <div className={cn('flex w-full flex-col items-center gap-1', tooltip && 'cursor-help')}>
      <span className="text-[11px] font-semibold uppercase leading-none tracking-wider text-gray-500">
        <span className="tablet:hidden">{shortLabel}</span>
        <span className="hidden tablet:inline">{label}</span>
      </span>
      <span className={cn(KPI_VALUE, hero ? 'text-primary-600' : 'text-gray-900 lg:text-2xl')}>
        {value}
      </span>
    </div>
  );

  if (!tooltip) return <div className={KPI_CELL}>{content}</div>;

  return (
    <Tooltip
      content={tooltip}
      position="top"
      width="w-64"
      className="bg-gray-900 text-white border-gray-900 text-left"
      wrapperClassName={KPI_CELL}
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

interface SupporterRowProps {
  label: ReactNode;
  onShowAll: () => void;
  className?: string;
  children: ReactNode;
}

/** Eyebrow heading over a row of avatars or chips, all opening a modal. */
const SupporterRow: FC<SupporterRowProps> = ({ label, onShowAll, className, children }) => (
  <div className={className}>
    <div className="text-[11px] font-semibold uppercase leading-none tracking-wider text-gray-500">
      {label}
    </div>
    {/* min-height matches the avatar stack so chips sit on the same line as the faces. */}
    <button
      type="button"
      onClick={onShowAll}
      className="group mt-2.5 flex min-h-10 w-full flex-wrap items-center gap-2 text-left"
    >
      {children}
    </button>
  </div>
);

const MAX_VISIBLE_INSTITUTIONS = 5;
/** Tablet and below the chips get a much narrower row, so the preview is shorter. */
const MAX_VISIBLE_INSTITUTIONS_COMPACT = 3;

const InstitutionChips: FC<{ institutions: SupportedInstitution[] }> = ({ institutions }) => {
  const remainingCompact = Math.max(0, institutions.length - MAX_VISIBLE_INSTITUTIONS_COMPACT);
  const remainingDesktop = Math.max(0, institutions.length - MAX_VISIBLE_INSTITUTIONS);

  return (
    <>
      {institutions.slice(0, MAX_VISIBLE_INSTITUTIONS).map((inst, index) => (
        <span
          key={inst.id}
          className={cn(
            'max-w-[220px] truncate rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 transition-colors group-hover:border-gray-300 group-hover:bg-gray-100',
            index >= MAX_VISIBLE_INSTITUTIONS_COMPACT && 'hidden lg:!inline'
          )}
          title={inst.name}
        >
          {inst.name}
        </span>
      ))}

      {/* Always in the row, same as the old "View all". The count swaps at lg
          so it matches how many chips are actually hidden. */}
      <span className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-xs font-medium text-primary-600 group-hover:text-primary-700">
        <span className="lg:!hidden">
          {remainingCompact > 0 ? `+${remainingCompact} more` : 'See all'}
        </span>
        <span className="hidden lg:!inline">
          {remainingDesktop > 0 ? `+${remainingDesktop} more` : 'See all'}
        </span>
        <ChevronRight className="h-3.5 w-3.5" />
      </span>
    </>
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
        <Link
          key={r.id}
          href={`/author/${r.authorProfile.id}`}
          className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50"
        >
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
        </Link>
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
