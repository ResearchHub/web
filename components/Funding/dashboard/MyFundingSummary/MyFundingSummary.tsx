'use client';

import { FC, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Building2, ChevronRight } from 'lucide-react';
import { FundingDirectionIcon } from '@/components/Funding/FundingDirectionIcon';
import type { FundingDirection } from '@/components/Funding/fundingDirection';
import { Avatar } from '@/components/ui/Avatar';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { BaseModal } from '@/components/ui/BaseModal';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { FunderOverview, SupportedInstitution, SupportedResearcher } from '@/types/funder';
import type { EarningAmount, EarningOverview } from '@/types/user';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/utils/styles';
import { buildWorkUrl } from '@/utils/url';
import { MyFundingFundedProposalsModal } from './MyFundingFundedProposalsModal';

/** A funder who has given nothing has no giving summary to show. */
export const hasMyFundingGivingStats = (
  overview: FunderOverview | null
): overview is FunderOverview =>
  overview != null &&
  (overview.totalDeployed.usd > 0 ||
    overview.totalDeployed.rsc > 0 ||
    overview.supportedProposals.length > 0);

interface MyFundingSummaryProps {
  /** The funder's totals; null leaves the giving summary out. */
  overview: FunderOverview | null;
  /** What the user has earned; null leaves the earnings summary out. */
  earnings: EarningOverview | null;
  isLoading: boolean;
  /** The user is looking at their own numbers, not a moderator at someone else's. */
  isOwnPage: boolean;
  className?: string;
}

const LABEL = 'text-[11px] font-semibold uppercase leading-none tracking-wider text-gray-500';

/**
 * The numbers of My Funding, as two compact, independently actionable cards.
 * The page decides which cards to pass; clicking a card expands its detail
 * panel below the pair.
 */
export const MyFundingSummary: FC<MyFundingSummaryProps> = ({
  overview,
  earnings,
  isLoading,
  isOwnPage,
  className,
}) => (
  <section aria-label="Funding summary" aria-busy={isLoading} className={cn('w-full', className)}>
    {isLoading ? (
      <div className="flex flex-wrap gap-3">
        <MyFundingSummarySkeleton />
        <MyFundingSummarySkeleton />
      </div>
    ) : (
      <MyFundingSummaryContent overview={overview} earnings={earnings} isOwnPage={isOwnPage} />
    )}
  </section>
);

const MyFundingSummaryContent: FC<{
  overview: FunderOverview | null;
  earnings: EarningOverview | null;
  isOwnPage: boolean;
}> = ({ overview, earnings, isOwnPage }) => {
  const [expanded, setExpanded] = useState<'giving' | 'receiving' | null>(null);
  const toggle = (section: 'giving' | 'receiving') =>
    setExpanded((current) => (current === section ? null : section));

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3">
        {overview && (
          <MyFundingGivingCard
            overview={overview}
            isExpanded={expanded === 'giving'}
            onToggle={() => toggle('giving')}
          />
        )}
        {earnings && (
          <MyFundingReceivingCard
            earnings={earnings}
            isExpanded={expanded === 'receiving'}
            onToggle={() => toggle('receiving')}
          />
        )}
      </div>

      {expanded === 'giving' && overview && (
        <MyFundingGivingDetails overview={overview} isOwnPage={isOwnPage} />
      )}
      {expanded === 'receiving' && earnings && <MyFundingReceivingDetails earnings={earnings} />}
    </div>
  );
};

const MyFundingSummarySkeleton: FC = () => (
  <div
    aria-hidden="true"
    className="min-w-[min(100%,300px)] flex-1 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm"
  >
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5">
      <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
      <div className="space-y-2">
        <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
        <div className="h-6 w-24 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="h-5 w-5 animate-pulse rounded bg-gray-100" />
    </div>
  </div>
);

const MyFundingGivingCard: FC<{
  overview: FunderOverview;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ overview, isExpanded, onToggle }) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  const fmt = (amount: { rsc: number; usd: number }) =>
    formatCurrency({
      amount: showUSD ? amount.usd : amount.rsc,
      showUSD,
      exchangeRate,
      shorten: true,
      skipConversion: true,
    });

  return (
    <MyFundingSummaryCard
      direction="giving"
      title="Funds deployed"
      value={fmt(overview.totalDeployed)}
      valueClassName="text-primary-600"
      supporting={
        <>
          <span>Given {fmt(overview.totalGiven)}</span>
          <span aria-hidden="true">·</span>
          <span>Matched {fmt(overview.communityMatch)}</span>
        </>
      }
      isExpanded={isExpanded}
      onToggle={onToggle}
      ariaLabel="Show funds deployed details"
    />
  );
};

const MyFundingReceivingCard: FC<{
  earnings: EarningOverview;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ earnings, isExpanded, onToggle }) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  const fmt = (amount: EarningAmount) =>
    formatCurrency({
      amount: showUSD ? amount.rscUsdSnapshot + amount.usd : amount.rsc,
      showUSD,
      exchangeRate,
      shorten: true,
      skipConversion: true,
    });

  const reviews = getMyFundingEarningAmount([
    earnings.bySource.TIP_REVIEW,
    earnings.bySource.BOUNTY_PAYOUT,
  ]);
  const fundraises = getMyFundingEarningAmount([
    earnings.bySource.FUNDRAISE_PAYOUT,
    earnings.bySource.USD_FUNDRAISE_PAYOUT,
  ]);

  return (
    <MyFundingSummaryCard
      direction="receiving"
      title="Funds received"
      value={fmt(earnings.totalEarned)}
      valueClassName="text-emerald-600"
      supporting={
        <>
          <span>Peer reviews {fmt(reviews)}</span>
          <span aria-hidden="true">·</span>
          <span>Proposals {fmt(fundraises)}</span>
        </>
      }
      isExpanded={isExpanded}
      onToggle={onToggle}
      ariaLabel="Show funds received details"
    />
  );
};

interface MyFundingSummaryCardProps {
  direction: FundingDirection;
  title: string;
  value: string;
  valueClassName: string;
  supporting: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  ariaLabel: string;
}

const MyFundingSummaryCard: FC<MyFundingSummaryCardProps> = ({
  direction,
  title,
  value,
  valueClassName,
  supporting,
  isExpanded,
  onToggle,
  ariaLabel,
}) => (
  <button
    type="button"
    onClick={onToggle}
    aria-expanded={isExpanded}
    aria-label={isExpanded ? `Hide ${title.toLowerCase()} details` : ariaLabel}
    className={cn(
      'group min-w-[min(100%,300px)] flex-1 rounded-2xl border bg-white p-3 text-left shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
      isExpanded
        ? 'border-primary-300 bg-primary-50/30'
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
    )}
  >
    <span className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5">
      <FundingDirectionIcon direction={direction} className="h-10 w-10" iconClassName="h-5 w-5" />
      <span className="min-w-0">
        <span className={cn(LABEL, 'block')}>{title}</span>
        <span
          className={cn(
            'mt-1 block truncate font-mono text-2xl font-semibold leading-none tracking-tight',
            valueClassName
          )}
        >
          {value}
        </span>
        <span className="mt-1 flex min-w-0 items-center gap-1 text-xs text-gray-500">
          {supporting}
        </span>
      </span>
      <ChevronRight
        className={cn(
          'h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:text-gray-700',
          isExpanded ? 'rotate-90 text-primary-600' : 'group-hover:translate-x-0.5'
        )}
        aria-hidden="true"
      />
    </span>
  </button>
);

const MyFundingGivingDetails: FC<{ overview: FunderOverview; isOwnPage: boolean }> = ({
  overview,
  isOwnPage,
}) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const [open, setOpen] = useState<'proposals' | 'scientists' | 'institutions' | null>(null);

  const valueFor = (amount: { rsc: number; usd: number }) => (showUSD ? amount.usd : amount.rsc);
  const fmt = (amount: { rsc: number; usd: number }) =>
    formatCurrency({
      amount: valueFor(amount),
      showUSD,
      exchangeRate,
      shorten: true,
      skipConversion: true,
    });
  const formatValue = (value: number) =>
    formatCurrency({
      amount: value,
      showUSD,
      exchangeRate,
      shorten: true,
      skipConversion: true,
    });

  const proposalCount = overview.supportedProposals.length;
  const scientistCount = overview.supportedScientistsCount;
  const institutionCount = overview.supportedInstitutionCount;
  const close = () => setOpen(null);
  const visibleProposals = overview.supportedProposals.slice(0, 3);

  return (
    <>
      <section className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="space-y-5">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Funding impact</h3>
            <div className="grid gap-5 tablet:grid-cols-2">
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Funding breakdown
                </h4>
                <div className="mt-3 flex items-center gap-4">
                  <MyFundingDonutChart
                    given={valueFor(overview.totalGiven)}
                    matched={valueFor(overview.communityMatch)}
                    totalLabel={fmt(overview.totalDeployed)}
                    formatValue={formatValue}
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 tablet:border-l tablet:border-t-0 tablet:pl-5 tablet:pt-0">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Research supported
                </h4>
                <div className="mt-3 space-y-3">
                  {scientistCount > 0 ? (
                    <button
                      type="button"
                      onClick={() => setOpen('scientists')}
                      aria-haspopup="dialog"
                      className="flex items-center gap-2 text-left text-xs text-gray-600 hover:text-gray-900"
                    >
                      <AvatarStack
                        items={overview.supportedResearchers.map((researcher) => ({
                          src: researcher.authorProfile.profileImage,
                          alt: researcher.authorProfile.fullName,
                          authorId: researcher.authorProfile.id,
                        }))}
                        size="xs"
                        maxItems={4}
                        totalItemsCount={scientistCount}
                        showExtraCount
                        extraCountLabel="more scientists"
                        showLabel={false}
                      />
                      <span>
                        {scientistCount} {scientistCount === 1 ? 'scientist' : 'scientists'}{' '}
                        supported
                      </span>
                    </button>
                  ) : (
                    <div className="text-xs text-gray-500">No scientists supported yet</div>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpen('institutions')}
                    disabled={institutionCount === 0}
                    aria-haspopup="dialog"
                    className={cn(
                      'text-left text-xs',
                      institutionCount > 0
                        ? 'text-gray-600 hover:text-gray-900'
                        : 'cursor-default text-gray-400'
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>
                        {institutionCount} supported{' '}
                        {institutionCount === 1 ? 'institution' : 'institutions'}
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h3 className="text-sm font-semibold text-gray-900">Proposals funded</h3>
              {proposalCount > 3 && (
                <button
                  type="button"
                  onClick={() => setOpen('proposals')}
                  className="text-xs font-medium text-gray-600 hover:text-gray-900"
                >
                  View all
                </button>
              )}
            </div>
            {visibleProposals.length > 0 ? (
              <div className="space-y-1.5">
                {visibleProposals.map((proposal) => (
                  <MyFundingFundedProposalRow
                    key={proposal.id}
                    proposal={proposal}
                    amount={fmt(proposal.fundedAmount)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No proposals funded yet.</p>
            )}
          </div>
        </div>
      </section>

      <MyFundingFundedProposalsModal
        isOpen={open === 'proposals'}
        onClose={close}
        proposals={overview.supportedProposals}
        isOwnPage={isOwnPage}
      />
      <MyFundingScientistsModal
        isOpen={open === 'scientists'}
        onClose={close}
        researchers={overview.supportedResearchers}
      />
      <MyFundingInstitutionsModal
        isOpen={open === 'institutions'}
        onClose={close}
        institutions={overview.supportedInstitutions}
      />
    </>
  );
};

const MyFundingReceivingDetails: FC<{ earnings: EarningOverview }> = ({ earnings }) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const fmt = (amount: EarningAmount) =>
    formatCurrency({
      amount: showUSD ? amount.rscUsdSnapshot + amount.usd : amount.rsc,
      showUSD,
      exchangeRate,
      shorten: true,
      skipConversion: true,
    });

  const reviews = getMyFundingEarningAmount([
    earnings.bySource.TIP_REVIEW,
    earnings.bySource.BOUNTY_PAYOUT,
  ]);
  const fundraises = getMyFundingEarningAmount([
    earnings.bySource.FUNDRAISE_PAYOUT,
    earnings.bySource.USD_FUNDRAISE_PAYOUT,
  ]);

  return (
    <section className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Earnings breakdown</h3>
      <div className="mt-3 grid gap-2 tablet:grid-cols-3">
        <MyFundingDetailMetric
          label="Lifetime earnings"
          value={fmt(earnings.totalEarned)}
          emphasis
        />
        <MyFundingDetailMetric label="Peer review earnings" value={fmt(reviews)} />
        <MyFundingDetailMetric label="Proposal earnings" value={fmt(fundraises)} />
      </div>
    </section>
  );
};

const MyFundingDonutChart: FC<{
  given: number;
  matched: number;
  totalLabel: string;
  formatValue: (value: number) => string;
}> = ({ given, matched, totalLabel, formatValue }) => {
  const total = given + matched;
  const givenPercent = total > 0 ? (given / total) * 100 : 0;
  const matchedPercent = total > 0 ? (matched / total) * 100 : 0;

  return (
    <div className="flex shrink-0 items-center gap-3">
      <div className="relative h-24 w-24">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          role="img"
          aria-label={`Given ${formatValue(given)}, matched ${formatValue(matched)}`}
        >
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="currentColor"
            strokeWidth="16"
            className="text-gray-100"
          />
          {total > 0 && (
            <>
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="currentColor"
                strokeWidth="16"
                pathLength="100"
                strokeDasharray={`${givenPercent} ${100 - givenPercent}`}
                transform="rotate(-90 50 50)"
                className="text-primary-500"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="currentColor"
                strokeWidth="16"
                pathLength="100"
                strokeDasharray={`${matchedPercent} ${100 - matchedPercent}`}
                transform={`rotate(${givenPercent * 3.6 - 90} 50 50)`}
                className="text-indigo-500"
              />
            </>
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center px-2 text-center">
          <span className="truncate font-mono text-xs font-semibold text-gray-800">
            {totalLabel}
          </span>
        </div>
      </div>
      <div className="space-y-2 text-xs text-gray-600">
        <MyFundingDonutLegend color="bg-primary-500" label="Given" value={formatValue(given)} />
        <MyFundingDonutLegend color="bg-indigo-500" label="Matched" value={formatValue(matched)} />
      </div>
    </div>
  );
};

const MyFundingDonutLegend: FC<{ color: string; label: string; value: string }> = ({
  color,
  label,
  value,
}) => (
  <div className="flex items-center gap-1.5 whitespace-nowrap">
    <span className={cn('h-2.5 w-2.5 rounded-full', color)} aria-hidden="true" />
    <span>{label}</span>
    <span className="font-mono font-medium text-gray-900">{value}</span>
  </div>
);

const MyFundingDetailMetric: FC<{ label: string; value: string; emphasis?: boolean }> = ({
  label,
  value,
  emphasis = false,
}) => (
  <div className="rounded-lg border border-gray-100 px-3 py-2.5">
    <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</div>
    <div
      className={cn(
        'mt-1 font-mono tabular-nums',
        emphasis ? 'text-base font-semibold text-gray-900' : 'text-sm font-medium text-gray-800'
      )}
    >
      {value}
    </div>
  </div>
);

const MyFundingFundedProposalRow: FC<{
  proposal: FunderOverview['supportedProposals'][number];
  amount: string;
}> = ({ proposal, amount }) => (
  <Link
    href={buildWorkUrl({
      id: proposal.id,
      contentType: 'preregistration',
      slug: proposal.slug,
    })}
    className="group flex items-center gap-2.5 rounded-lg border border-gray-100 px-2.5 py-2 transition-colors hover:border-gray-200 hover:bg-gray-50"
  >
    <Avatar
      src={proposal.createdBy.authorProfile.profileImage}
      alt={proposal.createdBy.authorProfile.fullName}
      size="xs"
      disableTooltip
      className="shrink-0"
    />
    <span className="min-w-0 flex-1">
      <span className="block truncate text-xs font-medium text-gray-900">{proposal.title}</span>
      <span className="block truncate text-[11px] text-gray-500">
        {proposal.createdBy.authorProfile.fullName}
      </span>
    </span>
    <span className="shrink-0 text-right">
      <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        Funded
      </span>
      <span className="font-mono text-xs font-semibold text-gray-900">{amount}</span>
    </span>
    <ChevronRight
      className="h-3.5 w-3.5 shrink-0 text-gray-400 transition-colors group-hover:text-gray-700"
      aria-hidden="true"
    />
  </Link>
);

function getMyFundingEarningAmount(amounts: (EarningAmount | undefined)[]): EarningAmount {
  return amounts.reduce<EarningAmount>(
    (acc, amount) => ({
      rsc: acc.rsc + (amount?.rsc ?? 0),
      rscUsdSnapshot: acc.rscUsdSnapshot + (amount?.rscUsdSnapshot ?? 0),
      usd: acc.usd + (amount?.usd ?? 0),
    }),
    { rsc: 0, rscUsdSnapshot: 0, usd: 0 }
  );
}

const MyFundingScientistsModal: FC<{
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
          className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50"
        >
          <Avatar
            src={r.authorProfile.profileImage}
            alt={r.authorProfile.fullName}
            size="sm"
            disableTooltip
            className="flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-gray-900">
              {r.authorProfile.fullName}
            </div>
            {r.authorProfile.headline && (
              <div className="truncate text-xs text-gray-500">{r.authorProfile.headline}</div>
            )}
          </div>
        </Link>
      ))}
    </div>
  </BaseModal>
);

const MyFundingInstitutionsModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  institutions: SupportedInstitution[];
}> = ({ isOpen, onClose, institutions }) => (
  <BaseModal isOpen={isOpen} onClose={onClose} title="Institutions supported" size="md">
    <div className="space-y-1">
      {institutions.map((inst) => (
        <div key={inst.id} className="rounded-lg px-2 py-2 hover:bg-gray-50">
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
