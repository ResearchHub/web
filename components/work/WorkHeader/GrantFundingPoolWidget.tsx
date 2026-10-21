'use client';

import type { ReactNode } from 'react';
import { Coins, FileUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { FundingPoolTip } from '@/components/Funding/FundingPoolTip';
import {
  type Backer,
  BackerFaces,
  BackersTip,
  FundingBar,
  FundingCard,
  FundingTotal,
  MIN_VISIBLE_PERCENT,
  formatFundingAmount,
} from '@/components/Funding/FundingCard';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import type { FundingPool, FundingPoolAmount } from '@/types/grant';
import { cn } from '@/utils/styles';

interface GrantFundingPoolWidgetProps {
  organization: string;
  grantAmount: FundingPoolAmount;
  fundingPool: FundingPool;
  /** Whether pool contributions are currently accepted. */
  isOpen: boolean;
  /** Whether the grant is accepting proposals. */
  canApply: boolean;
  /** Grant creators and moderators also see what is still waiting to be allocated. */
  canManagePool: boolean;
  onApply: () => void;
  onContribute: () => void;
  className?: string;
}

/**
 * One card for both audiences of an RFP: researchers apply, funders add to the
 * pool. The total leads; the bar and its legend split it between the funder,
 * in green, and the backers, in indigo with their faces. The info tooltip
 * explains what a funding pool is, with what has been allocated and, for
 * managers, what is left to allocate.
 */
export function GrantFundingPoolWidget({
  organization,
  grantAmount,
  fundingPool,
  isOpen,
  canApply,
  canManagePool,
  onApply,
  onContribute,
  className,
}: GrantFundingPoolWidgetProps) {
  const { showUSD } = useCurrencyPreference();
  const format = (amount: FundingPoolAmount) => formatFundingAmount(amount, showUSD);

  const raised = fundingPool.amountRaised;
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
  const funderPercent = Math.round(100 - rawCommunityPercent);

  const funderLabel = organization || 'The funder';
  const backerCount = fundingPool.contributors.total;
  const backerNoun = backerCount === 1 ? 'backer' : 'backers';
  // Feeds ship the pool without contributors, so a pool can have money raised
  // and no faces to show for it.
  const backers: Backer[] = fundingPool.contributors.top.map((contributor) => ({
    id: contributor.id,
    name: contributor.fullName,
    image: contributor.profileImage,
    authorId: contributor.authorProfileId,
    amount: format(contributor.totalContribution),
  }));
  const hasFaces = backerCount > 0 && backers.length > 0;

  const breakdownRow = (label: ReactNode, value: string, emphasis = false) => (
    <div className="flex items-center justify-between gap-4">
      <span
        className={cn(
          'flex min-w-0 items-center gap-1.5',
          emphasis ? 'text-gray-900' : 'text-gray-500'
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          'shrink-0 font-mono tabular-nums',
          emphasis ? 'text-gray-900' : 'text-gray-700'
        )}
      >
        {value}
      </span>
    </div>
  );

  // What a funding pool is, then where its money has gone so far.
  const aboutTip = (
    <FundingPoolTip>
      <p className="text-sm font-bold tracking-tight text-gray-900">One pool, many backers</p>
      <p className="mt-1 text-xs leading-[18px] text-gray-600">
        {funderLabel} put up the first {format(grantAmount)}. Anyone can add to it, and every dollar
        funds the proposals {funderLabel} picks.
      </p>
      <div className="mt-3 space-y-1 border-t border-gray-100 pt-2.5 text-xs">
        {breakdownRow('Allocated to proposals', format(fundingPool.amountDistributed))}
        {canManagePool &&
          isOpen &&
          breakdownRow('Available to allocate', format(fundingPool.amountHolding), true)}
      </div>
    </FundingPoolTip>
  );

  const infoButton = (
    <Tooltip
      content={aboutTip}
      position="bottom"
      width="w-72"
      className="overflow-hidden !rounded-xl !p-0"
      wrapperClassName="!h-auto"
    >
      <button
        type="button"
        className="flex items-center text-white/50 transition-colors hover:text-white/80"
        aria-label="How the funding pool works"
        data-testid="grant-funding-pool-info"
      >
        <Info className="h-4 w-4" />
      </button>
    </Tooltip>
  );

  return (
    <FundingCard
      label="Funding pool"
      status={isOpen ? undefined : 'Closed'}
      aside={infoButton}
      testId="grant-funding-pool"
      className={className}
    >
      <FundingTotal amount={format(total)} />

      <FundingBar
        label={`${funderPercent}% from ${funderLabel}, ${Math.round(
          rawCommunityPercent
        )}% from the community`}
        parts={[
          {
            percent: 100 - communityPercent,
            colorClassName: 'bg-emerald-400',
            tip: (
              <div className="space-y-0.5 text-left text-xs">
                <div className="font-semibold text-gray-900">{funderLabel}</div>
                <div className="text-gray-600">
                  Put up <span className="font-mono">{format(grantAmount)}</span>, {funderPercent}%
                  of the pool
                </div>
              </div>
            ),
          },
          {
            percent: communityPercent,
            colorClassName: 'bg-indigo-300',
            tipWidth: 'w-64',
            tip: (
              <BackersTip
                heading={
                  <>
                    {backerCount} {backerNoun} added{' '}
                    <span className="font-mono">{format(raised)}</span>
                  </>
                }
                backers={hasFaces ? backers : []}
                total={backerCount}
              />
            ),
          },
        ]}
      />

      {/* The bar's legend, one row per source, each with its swatch, who, and
          how much. */}
      <dl
        className="mt-1 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-2 text-[13px]"
        data-testid="grant-funding-pool-legend"
      >
        <div className="contents">
          <span className="flex w-5 justify-center" aria-hidden="true">
            <span className="h-2 w-2 rounded-sm bg-emerald-400" />
          </span>
          <dt className="truncate text-white/80">{funderLabel}</dt>
          <dd className="font-mono font-semibold tabular-nums">{format(grantAmount)}</dd>
        </div>
        <div className="contents">
          <span className="flex w-5 justify-center" aria-hidden="true">
            <span
              className={cn(
                'h-2 w-2 rounded-sm',
                hasCommunityFunding ? 'bg-indigo-300' : 'bg-white/25'
              )}
            />
          </span>
          <dt
            className="flex min-w-0 items-center gap-2 text-white/80"
            data-testid="grant-funding-pool-backers"
          >
            <span className="truncate">
              {backerCount > 0
                ? `${backerCount} ${backerNoun}`
                : isOpen
                  ? 'Be the first backer'
                  : 'No backers'}
            </span>
            {hasFaces && <BackerFaces backers={backers} />}
          </dt>
          <dd className="font-mono font-semibold tabular-nums text-indigo-200">
            {hasCommunityFunding ? format(raised) : '—'}
          </dd>
        </div>
      </dl>

      {/* Add to pool carries the card — these links get shared at funders, so it
          stays the only filled control. Applying is the same size but outlined,
          so the two domains never read as one flow. */}
      {isOpen && (
        <Button
          data-testid="grant-contribute"
          variant="default"
          onClick={onContribute}
          className="mt-4 w-full gap-2 font-semibold"
        >
          <Coins className="h-4 w-4" />
          Add to pool
        </Button>
      )}

      {canApply && (
        <Button
          data-testid="grant-submit-proposal"
          variant="outlined"
          onClick={onApply}
          className="mt-2 w-full gap-2 !border-white !bg-white !text-gray-900 hover:!bg-gray-100"
        >
          <FileUp className="h-4 w-4" />
          Apply
        </Button>
      )}

      {!canApply && !isOpen && (
        <p className="mt-3 text-center text-xs text-white/60">This RFP is closed</p>
      )}
    </FundingCard>
  );
}
