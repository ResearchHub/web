'use client';

import { FC } from 'react';
import Link from 'next/link';
import { SupportedProposal } from '@/types/funder';
import { formatCurrency } from '@/utils/currency';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { Avatar } from '@/components/ui/Avatar';
import { buildWorkUrl } from '@/utils/url';
import { cn } from '@/utils/styles';

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

  const fmt = (rsc: number, usd: number) =>
    formatCurrency({
      amount: showUSD ? usd : rsc,
      showUSD,
      exchangeRate,
      shorten: true,
      skipConversion: true,
    });

  return (
    <div className={className}>
      <div className="mb-4 flex items-baseline gap-2.5">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900">Proposals funded</h2>
        {proposals.length > 0 && (
          <span className="text-xs text-gray-500">{proposals.length} total</span>
        )}
      </div>

      {proposals.length > 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
          {proposals.map((proposal) => (
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
      className={cn(
        'flex items-center gap-3 px-4 py-3 transition-colors',
        'hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl'
      )}
    >
      <Avatar
        src={proposal.createdBy.authorProfile.profileImage}
        alt={proposal.createdBy.authorProfile.fullName}
        size="sm"
        disableTooltip
        className="flex-shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-gray-900 truncate">{proposal.title}</div>
        <div className="text-xs text-gray-500 truncate">
          {proposal.createdBy.authorProfile.fullName}
        </div>
      </div>
      <span className="text-sm font-semibold text-gray-900 flex-shrink-0">{amount}</span>
    </Link>
  );
};
