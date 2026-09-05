'use client';

import Image from 'next/image';
import { Check, PauseCircle, Star } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/styles';
import { computeAllocations, getProposalMedia } from '../lib/proposals';
import type { Allocation, JudgmentPolicy } from '../lib/types';

const formatUsd = (amount: number) => `$${amount.toLocaleString('en-US')}`;

interface AllocationRowProps {
  readonly allocation: Allocation;
  readonly minReviewScore: number;
}

const AllocationRow = ({ allocation, minReviewScore }: AllocationRowProps) => {
  const { proposal, funded, amountUsd } = allocation;
  const media = getProposalMedia(proposal.postId);

  return (
    <div className="border-t border-gray-100 px-4 py-3.5 first:border-t-0">
      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            'relative h-14 w-[76px] shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200',
            !funded && 'opacity-55'
          )}
        >
          {media?.imageUrl && (
            <Image src={media.imageUrl} alt="" fill className="object-cover" sizes="76px" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Avatar
                src={media?.piAvatarUrl}
                alt={proposal.principalInvestigator}
                size="xxs"
                disableTooltip
              />
              <span className="truncate text-sm font-semibold text-gray-900">
                {proposal.principalInvestigator}
              </span>
            </div>
            <div className="mt-1 truncate text-xs text-gray-500">{proposal.shortTitle}</div>
            <div className="mt-1 font-mono text-[11px] text-gray-400">
              {proposal.claimId} · {proposal.studyId}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div
              className={cn('text-sm font-semibold', funded ? 'text-gray-900' : 'text-amber-600')}
            >
              {funded ? formatUsd(amountUsd) : 'Held'}
            </div>
            <div className="flex items-center justify-end gap-1 text-xs text-gray-500">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {proposal.reviewScore.toFixed(1)}
              <span className="text-gray-400">
                ({proposal.reviewCount} {proposal.reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-2.5 flex gap-2 text-[13px] leading-relaxed text-gray-600">
        {funded ? (
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
        ) : (
          <PauseCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
        )}
        <span>
          {funded && proposal.rationale}
          {allocation.heldReason === 'score' && (
            <>
              Held at {proposal.reviewScore.toFixed(1)} against your {minReviewScore.toFixed(1)}{' '}
              bar. {proposal.holdNote ?? proposal.rationale}
            </>
          )}
          {allocation.heldReason === 'budget' && (
            <>Clears your bar, but the budget is fully committed. First in line if you top up.</>
          )}
        </span>
      </p>
    </div>
  );
};

interface AllocationsBlockProps {
  readonly policy: JudgmentPolicy;
}

/**
 * What the AI spent, and why. The numbers are derived from the guardrail policy
 * rather than hardcoded, so the summary always reconciles with the controls the
 * funder actually set.
 */
export const AllocationsBlock = ({ policy }: AllocationsBlockProps) => {
  const outcome = computeAllocations(policy);

  return (
    <div className="max-w-[620px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-gray-200 bg-gray-50 px-4 py-3 text-sm">
        <span className="font-semibold text-gray-900">
          {formatUsd(policy.totalBudgetUsd)} committed
        </span>
        <span className="text-gray-300">·</span>
        <span className="font-semibold text-gray-900">
          {formatUsd(outcome.totalAllocatedUsd)} allocated
        </span>
        <span className="text-gray-300">·</span>
        <span className="text-gray-600">
          {outcome.funded.length} funded, {outcome.held.length} held
        </span>
        {outcome.unallocatedUsd > 0 && (
          <>
            <span className="text-gray-300">·</span>
            <span className="text-amber-600">{formatUsd(outcome.unallocatedUsd)} unallocated</span>
          </>
        )}
      </div>

      <div>
        {outcome.allocations.map((allocation) => (
          <AllocationRow
            key={allocation.proposal.postId}
            allocation={allocation}
            minReviewScore={policy.minReviewScore}
          />
        ))}
      </div>

      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2.5 text-xs text-gray-500">
        Scores are averages across AI and human peer reviews on ResearchHub.
      </div>
    </div>
  );
};
