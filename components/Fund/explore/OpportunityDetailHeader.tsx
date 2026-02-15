'use client';

import { FC } from 'react';
import Link from 'next/link';
import { ArrowLeft, DollarSign, Calendar, ArrowRight, Building2 } from 'lucide-react';
import { cn } from '@/utils/styles';
import { formatDeadline } from '@/utils/date';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import type { Grant } from '@/types/grant';

interface OpportunityDetailHeaderProps {
  grant: Grant;
  proposalCount: number;
  onBack: () => void;
  className?: string;
}

const formatAmount = (amount: number) => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return amount.toLocaleString();
};

export const OpportunityDetailHeader: FC<OpportunityDetailHeaderProps> = ({
  grant,
  proposalCount,
  onBack,
  className,
}) => {
  const { showUSD } = useCurrencyPreference();

  const amount = showUSD
    ? `$${formatAmount(grant.amount.usd)}`
    : `${formatAmount(grant.amount.rsc)} RSC`;

  return (
    <div className={cn('', className)}>
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to all opportunities</span>
      </button>

      {/* Main card */}
      <div className="bg-gradient-to-br from-primary-50 via-white to-white rounded-xl border border-primary-200 p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
              Funding Opportunity
            </span>
            <span
              className={cn(
                'px-2 py-0.5 text-xs font-medium rounded-full',
                grant.status === 'OPEN'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              )}
            >
              {grant.status === 'OPEN' ? 'Open' : grant.status}
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-gray-900 mb-2">{grant.title}</h1>

        {/* Organization */}
        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-4">
          <Building2 size={14} />
          <span>{grant.organization}</span>
        </div>

        {/* Description */}
        {grant.description && <p className="text-sm text-gray-600 mb-5">{grant.description}</p>}

        {/* Stats & CTA row */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-primary-100">
          <div className="flex items-center gap-5 text-sm">
            <div className="flex items-center gap-1.5">
              <DollarSign size={16} className="text-green-600" />
              <span className="font-semibold text-green-600">{amount}</span>
              <span className="text-gray-400">available</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Calendar size={16} />
              <span>{formatDeadline(grant.endDate)}</span>
            </div>
            <div className="text-gray-500">
              {proposalCount} proposal{proposalCount !== 1 ? 's' : ''} submitted
            </div>
          </div>

          <Link
            href={`/fund/new?grant=${grant.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors group"
          >
            <span>Submit Proposal</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
