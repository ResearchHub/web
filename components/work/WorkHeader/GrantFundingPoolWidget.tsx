'use client';

import { ArrowUpFromLine, Coins, Info } from 'lucide-react';
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
 * The breakdown is a single fixed-height line so the card matches the title
 * block beside it; the full numbers live in the info tooltip.
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
      <div className="space-y-1 border-t border-gray-200 pt-2">
        {breakdownRow(funderLabel, formatAmount(grantAmount, showUSD))}
        {breakdownRow('Community', formatAmount(raised, showUSD))}
        {breakdownRow('Allocated to proposals', formatAmount(allocated, showUSD))}
        {showHolding && breakdownRow('Ready to allocate', formatAmount(holding, showUSD), true)}
      </div>
    </div>
  );

  const nothingToDo = !canApply && !isOpen;

  return (
    <div
      data-testid="grant-funding-pool"
      className={cn('w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3', className)}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex items-center gap-1 text-xs text-gray-500">
          Funding pool
          {!isOpen && <span className="text-gray-400">· Closed</span>}
          <Tooltip content={breakdown} position="bottom" width="w-64" wrapperClassName="!h-auto">
            <button
              type="button"
              className="flex items-center text-gray-400 transition-colors hover:text-gray-600"
              aria-label="How the funding pool works"
              data-testid="grant-funding-pool-info"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
        </span>
        <span className="font-mono text-base font-semibold text-gray-900 tabular-nums leading-none">
          {formatAmount(total, showUSD)}
        </span>
      </div>

      <div
        className="mt-2 flex h-1.5 w-full overflow-hidden rounded bg-gray-100"
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
          className="h-full bg-indigo-400 transition-all duration-300"
          style={{ width: `${communityPercent}%` }}
        />
      </div>

      {/* Fixed-width labels ("Funder", "Community") so this line never wraps; the org name is in the subtitle beside it. */}
      <div className="mt-1.5 flex h-4 items-center gap-3 whitespace-nowrap text-xs text-gray-500">
        <span className="flex items-center gap-1.5" title={`${funderLabel}, original funder`}>
          <span className="h-2 w-2 shrink-0 rounded-sm bg-green-600" aria-hidden="true" />
          Funder
          <span className="font-mono text-gray-900 tabular-nums">
            {formatCompact(grantAmount, showUSD)}
          </span>
        </span>
        {hasCommunityFunding ? (
          <span className="flex items-center gap-1.5" title="Community contributions">
            <span className="h-2 w-2 rounded-sm bg-indigo-400" aria-hidden="true" />
            Community
            <span className="font-mono text-gray-900 tabular-nums">
              {formatCompact(raised, showUSD)}
            </span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-gray-200" aria-hidden="true" />
            {isOpen ? 'Be the first to add' : 'No community funding'}
          </span>
        )}
      </div>

      {nothingToDo ? (
        <p className="mt-3 text-center text-xs text-gray-500">This RFP is closed</p>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {canApply && (
            <SubmitProposalTooltip
              isPrivate={applicationVisibility === 'PRIVATE'}
              wrapperClassName="w-full"
            >
              <Button
                data-testid="grant-submit-proposal"
                variant="default"
                size="md"
                onClick={onApply}
                className="w-full gap-2"
              >
                Apply with proposal
                <ArrowUpFromLine className="h-4 w-4" />
              </Button>
            </SubmitProposalTooltip>
          )}
          {isOpen && (
            <Button
              data-testid="grant-contribute"
              variant="outlined"
              size="md"
              onClick={onContribute}
              className="w-full gap-2"
            >
              <Coins className="h-4 w-4" />
              Add to the pool
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
