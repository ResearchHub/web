'use client';

import { Coins, FileUp, Info } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { SubmitProposalTooltip } from '@/components/tooltips/SubmitProposalTooltip';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import type { FundingPool, FundingPoolAmount, GrantApplicationVisibility } from '@/types/grant';
import { formatCurrency } from '@/utils/currency';
import { formatRSC } from '@/utils/number';
import { cn } from '@/utils/styles';

/** A first $100 against a $25K grant is a sliver; floor it so it shows on the bar. */
const MIN_VISIBLE_PERCENT = 4;

/** Faces shown before the stack collapses into a +N chip. Two is what the legend row fits. */
const MAX_FACES = 2;

/** Named backers in the hover breakdown, before it gets taller than the card. */
const MAX_LISTED_BACKERS = 4;

function formatAmount(amount: FundingPoolAmount, showUSD: boolean): string {
  return formatCurrency({
    amount: showUSD ? amount.usd : amount.rsc,
    showUSD,
    exchangeRate: 1,
    skipConversion: true,
  });
}

/** $850, $2.4K, $12K. The shared shortener rounds $2.4K down to $2K, which misreads. */
function formatCompact(amount: FundingPoolAmount, showUSD: boolean): string {
  if (!showUSD) return `${formatRSC({ amount: amount.rsc, shorten: true })} RSC`;
  const usd = amount.usd;
  if (usd < 1_000) return `$${Math.round(usd).toLocaleString()}`;
  if (usd < 10_000) return `$${parseFloat((usd / 1_000).toFixed(1))}K`;
  if (usd < 1_000_000) return `$${Math.round(usd / 1_000)}K`;
  return `$${parseFloat((usd / 1_000_000).toFixed(1))}M`;
}

interface GrantFundingPoolWidgetProps {
  organization: string;
  grantAmount: FundingPoolAmount;
  fundingPool: FundingPool;
  /** Whether pool contributions are currently accepted. */
  isOpen: boolean;
  /** Whether the grant is accepting proposals. */
  canApply: boolean;
  applicationVisibility?: GrantApplicationVisibility;
  /** Grant creators and moderators also see what is still waiting to be allocated. */
  canManagePool: boolean;
  onApply: () => void;
  onContribute: () => void;
  className?: string;
}

/**
 * One card for both audiences: researchers apply, funders add to the pool.
 * Sized and positioned by its parent to sit directly above the right sidebar.
 *
 * The line under the bar is the bar's legend, one side per funding source:
 * green for the funder, indigo for the community, whose share is drawn as
 * backer faces rather than a plain swatch. It sits directly above Add to pool
 * so the crowd reads as an invitation to join it. The exact split and the named
 * top backers live in the info tooltip.
 *
 * Every row is fixed height so the card stays the height it was before the
 * contributors landed: 202px with both buttons, 186px on mobile. Padding and
 * button margins were shaved to pay for the taller avatar row; re-check that
 * arithmetic before changing any spacing here.
 */
export function GrantFundingPoolWidget({
  organization,
  grantAmount,
  fundingPool,
  isOpen,
  canApply,
  applicationVisibility,
  canManagePool,
  onApply,
  onContribute,
  className,
}: GrantFundingPoolWidgetProps) {
  const { showUSD } = useCurrencyPreference();

  const raised = fundingPool.amountRaised;
  const allocated = fundingPool.amountDistributed;
  const holding = fundingPool.amountHolding;

  const total: FundingPoolAmount = {
    usd: (grantAmount.usd ?? 0) + (raised.usd ?? 0),
    rsc: (grantAmount.rsc ?? 0) + (raised.rsc ?? 0),
  };

  const grantShare = showUSD ? grantAmount.usd : grantAmount.rsc;
  const raisedShare = showUSD ? raised.usd : raised.rsc;
  const totalShare = grantShare + raisedShare;
  const hasCommunityFunding = raisedShare > 0;
  const rawCommunityPercent = totalShare > 0 ? (raisedShare / totalShare) * 100 : 0;
  const communityPercent = hasCommunityFunding
    ? Math.max(MIN_VISIBLE_PERCENT, rawCommunityPercent)
    : 0;
  const showHolding = canManagePool && isOpen;

  const funderLabel = organization || 'The funder';

  const backerCount = fundingPool.contributors.total;
  const topBackers = fundingPool.contributors.top;
  // Feeds ship the pool without contributors, so a pool can have money raised
  // and no faces to show for it.
  const hasFaces = backerCount > 0 && topBackers.length > 0;
  const backerNoun = backerCount === 1 ? 'backer' : 'backers';

  const breakdownRow = (label: string, value: string, emphasis = false) => (
    <div className="flex items-center justify-between gap-4">
      <span className={emphasis ? 'text-gray-900' : 'text-gray-500'}>{label}</span>
      <span className={cn('font-mono tabular-nums', emphasis ? 'text-gray-900' : 'text-gray-700')}>
        {value}
      </span>
    </div>
  );

  const breakdown = (
    <div className="space-y-2 text-left text-xs">
      <p className="text-sm leading-snug text-gray-800">
        Community contributions are pooled and awarded to the strongest proposals by {funderLabel}.
      </p>
      {hasFaces && (
        <div className="space-y-1.5 border-t border-gray-200 pt-2">
          <p className="font-medium text-gray-900">
            {backerCount > MAX_LISTED_BACKERS
              ? `Top backers of ${backerCount}`
              : backerCount === 1
                ? 'Backer'
                : 'Backers'}
          </p>
          {topBackers.slice(0, MAX_LISTED_BACKERS).map((backer) => (
            <div key={backer.id} className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-1.5">
                <Avatar src={backer.profileImage} alt={backer.fullName} size="xxs" disableTooltip />
                <span className="truncate text-gray-700">{backer.fullName}</span>
              </span>
              <span className="shrink-0 font-mono text-gray-900 tabular-nums">
                {formatAmount(backer.totalContribution, showUSD)}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-1 border-t border-gray-200 pt-2">
        {breakdownRow(funderLabel, formatAmount(grantAmount, showUSD))}
        {breakdownRow('Community', formatAmount(raised, showUSD))}
        {breakdownRow('Allocated to proposals', formatAmount(allocated, showUSD))}
        {showHolding && breakdownRow('Available to allocate', formatAmount(holding, showUSD), true)}
      </div>
    </div>
  );

  const nothingToDo = !canApply && !isOpen;

  return (
    // Raised white panel, matching the FundingPowerCard that sits above the
    // sidebar rail — at lg+ this widget occupies that same column, and on
    // mobile the card keeps the thin funding bar from reading as a stray
    // page rule.
    <div
      data-testid="grant-funding-pool"
      className={cn(
        'w-full rounded-lg border border-gray-200 bg-white px-4 py-3.5 shadow-sm',
        className
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
          Funding pool
          {!isOpen && <span className="font-normal text-gray-400">· Closed</span>}
          <Tooltip content={breakdown} position="bottom" width="w-64" wrapperClassName="!h-auto">
            <button
              type="button"
              className="flex items-center text-gray-400 transition-colors hover:text-gray-600"
              aria-label="How the funding pool works"
              data-testid="grant-funding-pool-info"
            >
              <Info className="h-4 w-4" />
            </button>
          </Tooltip>
        </span>
        <span className="font-mono text-base font-semibold text-gray-900 tabular-nums leading-none">
          {formatAmount(total, showUSD)}
        </span>
      </div>

      <div
        className="mt-1.5 flex h-1.5 w-full overflow-hidden rounded-full bg-gray-100"
        role="img"
        aria-label={`${Math.round(100 - rawCommunityPercent)}% from ${funderLabel}, ${Math.round(
          rawCommunityPercent
        )}% from the community`}
      >
        <span
          className="h-full bg-green-600 transition-all duration-300"
          style={{ width: `${100 - communityPercent}%` }}
        />
        <span
          className="h-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${communityPercent}%` }}
        />
      </div>

      {/* Legend for the bar above: green is the funder, indigo is the community.
          The backers' side spends its label budget on faces instead of the word
          — the +N chip carries the indigo, so the pairing still reads — because
          in RSC the two amounts alone take 123px of the 270px this row gets at
          the narrowest card width. Fixed h-6, the height of one avatar, so the
          card never grows as backers arrive. */}
      <div
        className="mt-2 flex h-6 items-center justify-between gap-2 text-xs"
        data-testid="grant-funding-pool-legend"
      >
        <span className="flex shrink-0 items-center gap-1.5 text-gray-500">
          <span className="h-2 w-2 shrink-0 rounded-sm bg-green-600" aria-hidden="true" />
          Funder
          <span className="font-mono font-semibold text-gray-900 tabular-nums">
            {formatCompact(grantAmount, showUSD)}
          </span>
        </span>

        <span className="flex min-w-0 items-center gap-2" data-testid="grant-funding-pool-backers">
          {hasFaces ? (
            <AvatarStack
              className="shrink-0"
              items={topBackers.slice(0, MAX_FACES).map((backer) => ({
                src: backer.profileImage,
                alt: backer.fullName,
                tooltip: backer.fullName,
                authorId: backer.authorProfileId,
              }))}
              size="xs"
              maxItems={MAX_FACES}
              spacing={-6}
              showExtraCount
              totalItemsCount={backerCount}
              extraCountLabel={`${backerCount - MAX_FACES} more ${backerNoun}`}
              extraCountClassName="bg-indigo-500"
              extraCountLabelClassName="text-white"
              showLabel={false}
            />
          ) : (
            <span
              className={cn(
                'h-2 w-2 shrink-0 rounded-sm',
                hasCommunityFunding ? 'bg-indigo-500' : 'bg-gray-200'
              )}
              aria-hidden="true"
            />
          )}
          {hasCommunityFunding ? (
            <span className="shrink-0 font-mono font-semibold text-indigo-600 tabular-nums">
              {formatCompact(raised, showUSD)}
            </span>
          ) : (
            <span className="min-w-0 truncate text-gray-500">
              {isOpen ? 'Be the first to back' : 'No backers'}
            </span>
          )}
        </span>
      </div>

      {/* Add to pool carries the card — these links get shared at funders, so it
          stays the only filled control. Applying is the same size but outlined,
          so the two domains never read as one flow. */}
      {isOpen && (
        <Button
          data-testid="grant-contribute"
          variant="default"
          size="lg"
          onClick={onContribute}
          className="mt-2 w-full gap-2 font-semibold shadow-sm max-sm:!h-10 max-sm:!px-4 max-sm:!text-sm"
        >
          <Coins className="h-5 w-5 max-sm:!h-4 max-sm:!w-4" />
          Add to pool
        </Button>
      )}

      {canApply && (
        <div className="mt-1.5">
          <SubmitProposalTooltip
            isPrivate={applicationVisibility === 'PRIVATE'}
            wrapperClassName="w-full"
          >
            <Button
              data-testid="grant-submit-proposal"
              variant="outlined"
              size="lg"
              onClick={onApply}
              className="w-full gap-2 max-sm:!h-10 max-sm:!px-4 max-sm:!text-sm"
            >
              <FileUp className="h-5 w-5 max-sm:!h-4 max-sm:!w-4" />
              Submit proposal
            </Button>
          </SubmitProposalTooltip>
        </div>
      )}

      {nothingToDo && <p className="mt-3 text-center text-xs text-gray-500">This RFP is closed</p>}
    </div>
  );
}
