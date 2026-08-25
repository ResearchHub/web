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

  // Ranked by the amount actually on screen, so the rows always descend even
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

  const totalRsc = proposals.reduce((sum, p) => sum + p.fundedAmount.rsc, 0);
  const totalUsd = proposals.reduce((sum, p) => sum + p.fundedAmount.usd, 0);

  return (
    <div className={className}>
      <div className="mb-4 flex items-baseline gap-2.5">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900">Proposals you funded</h2>
        {proposals.length > 0 && (
          <span className="text-xs text-gray-500">
            {proposals.length} {proposals.length === 1 ? 'proposal' : 'proposals'} ·{' '}
            {fmt(totalRsc, totalUsd)} given
          </span>
        )}
      </div>

      {ranked.length > 0 ? (
        <div className="space-y-2">
          {ranked.map((proposal) => (
            <ProposalRow
              key={proposal.id}
              proposal={proposal}
              amount={fmt(proposal.fundedAmount.rsc, proposal.fundedAmount.usd)}
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
}

const ProposalRow: FC<ProposalRowProps> = ({ proposal, amount }) => {
  const href = buildWorkUrl({
    id: proposal.id,
    contentType: 'preregistration',
    slug: proposal.slug,
  });

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
    >
      <Avatar
        src={proposal.createdBy.authorProfile.profileImage}
        alt={proposal.createdBy.authorProfile.fullName}
        size="sm"
        disableTooltip
        className="flex-shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-gray-900">{proposal.title}</div>
        <div className="truncate text-xs text-gray-500">
          {proposal.createdBy.authorProfile.fullName}
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        {/* Same eyebrow treatment as the hero KPIs, so the label reads as a
            field name rather than part of the proposal's own metadata. */}
        <div className="whitespace-nowrap text-[11px] font-semibold uppercase leading-none tracking-wider text-gray-500">
          Amount funded
        </div>
        <div className="mt-1.5 font-mono text-sm font-semibold leading-none text-gray-900 tablet:text-base">
          {amount}
        </div>
      </div>
    </Link>
  );
};
