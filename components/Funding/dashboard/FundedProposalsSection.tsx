'use client';

import { FC, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { SupportedProposal } from '@/types/funder';
import { formatCurrency } from '@/utils/currency';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { Avatar } from '@/components/ui/Avatar';
import { buildWorkUrl } from '@/utils/url';

interface FundedProposalsSectionProps {
  proposals: SupportedProposal[];
  className?: string;
}

export const FundedProposalsSection: FC<FundedProposalsSectionProps> = ({
  proposals,
  className,
}) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  const fmt = useCallback(
    (rsc: number, usd: number) =>
      formatCurrency({
        amount: showUSD ? usd : rsc,
        showUSD,
        exchangeRate,
        shorten: true,
        skipConversion: true,
      }),
    [showUSD, exchangeRate]
  );

  // Ranked by the amount actually on screen, so the bars always descend even
  // when the RSC and USD orderings disagree.
  const displayedAmount = useCallback(
    (proposal: SupportedProposal) =>
      showUSD ? proposal.fundedAmount.usd : proposal.fundedAmount.rsc,
    [showUSD]
  );

  const ranked = useMemo(
    () => [...proposals].sort((a, b) => displayedAmount(b) - displayedAmount(a)),
    [proposals, displayedAmount]
  );

  const total = ranked.reduce((sum, p) => sum + displayedAmount(p), 0);
  const totalRsc = proposals.reduce((sum, p) => sum + p.fundedAmount.rsc, 0);
  const totalUsd = proposals.reduce((sum, p) => sum + p.fundedAmount.usd, 0);

  return (
    <div className={className}>
      <div className="mb-4 flex items-baseline gap-2.5">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900">Proposals funded</h2>
        {proposals.length > 0 && (
          <span className="text-xs text-gray-500">
            {proposals.length} {proposals.length === 1 ? 'proposal' : 'proposals'} ·{' '}
            {fmt(totalRsc, totalUsd)}
          </span>
        )}
      </div>

      {ranked.length > 0 ? (
        <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
          {ranked.map((proposal) => (
            <ProposalRow
              key={proposal.id}
              proposal={proposal}
              amount={fmt(proposal.fundedAmount.rsc, proposal.fundedAmount.usd)}
              share={total > 0 ? (displayedAmount(proposal) / total) * 100 : 0}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 px-6 py-12 text-center">
          <p className="text-sm text-gray-500">No proposals funded yet.</p>
        </div>
      )}
    </div>
  );
};

interface ProposalRowProps {
  proposal: SupportedProposal;
  amount: string;
  /** Percentage of the funder's total, 0-100. */
  share: number;
}

const ProposalRow: FC<ProposalRowProps> = ({ proposal, amount, share }) => {
  const href = buildWorkUrl({
    id: proposal.id,
    contentType: 'preregistration',
    slug: proposal.slug,
  });

  // A share under half a percent would otherwise render as an invisible bar and
  // a misleading "0%".
  const shareLabel = share > 0 && share < 1 ? '<1%' : `${Math.round(share)}%`;
  const barWidth = share > 0 ? Math.max(share, 2) : 0;

  return (
    <Link href={href} className="group flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
      <Avatar
        src={proposal.createdBy.authorProfile.profileImage}
        alt={proposal.createdBy.authorProfile.fullName}
        size="sm"
        disableTooltip
        className="flex-shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-gray-900">{proposal.title}</div>
            <div className="truncate text-xs text-gray-500">
              {proposal.createdBy.authorProfile.fullName}
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="font-mono text-sm font-semibold text-gray-900">{amount}</div>
            <div className="text-xs text-gray-500">{shareLabel}</div>
          </div>
        </div>
        {/* Decorative — the same number is spelled out next to the amount. */}
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-100" aria-hidden>
          <div
            className="h-full rounded-full bg-primary-500 transition-colors group-hover:bg-primary-600"
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
    </Link>
  );
};
