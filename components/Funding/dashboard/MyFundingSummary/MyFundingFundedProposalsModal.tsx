'use client';

import { FC, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { BaseModal } from '@/components/ui/BaseModal';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { SupportedProposal } from '@/types/funder';
import { formatCurrency } from '@/utils/currency';
import { buildWorkUrl } from '@/utils/url';

interface MyFundingFundedProposalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposals: SupportedProposal[];
  /** The funder is the one looking, so the list is theirs to call "yours". */
  isOwnPage: boolean;
}

/**
 * The proposals behind a funder's "N proposals funded": who wrote each one
 * and how much of the funder's money went to it, the largest first.
 */
export const MyFundingFundedProposalsModal: FC<MyFundingFundedProposalsModalProps> = ({
  isOpen,
  onClose,
  proposals,
  isOwnPage,
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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <span className="flex flex-col gap-0.5">
          <span>{isOwnPage ? 'Proposals you funded' : 'Proposals funded'}</span>
          <span className="text-xs font-normal text-gray-500">
            {proposals.length} {proposals.length === 1 ? 'proposal' : 'proposals'} ·{' '}
            {fmt(totalRsc, totalUsd)} given
          </span>
        </span>
      }
    >
      <div className="space-y-2">
        {ranked.map((proposal) => (
          <ProposalRow
            key={proposal.id}
            proposal={proposal}
            amount={fmt(proposal.fundedAmount.rsc, proposal.fundedAmount.usd)}
          />
        ))}
      </div>
    </BaseModal>
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
        {/* Same eyebrow treatment as the totals, so the label reads as a
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
