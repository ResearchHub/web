'use client';

import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FeedEntry, FeedGrantContent } from '@/types/feed';
import { Button } from '@/components/ui/Button';
import { Calendar, Building2, ArrowRight } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { formatCurrency } from '@/utils/currency';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { cn } from '@/utils/styles';

interface GrantPreviewProps {
  grant: FeedEntry;
  className?: string;
  /** Show as compact card (for "All" view) */
  compact?: boolean;
}

export const GrantPreview: FC<GrantPreviewProps> = ({ grant, className, compact = false }) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  const content = grant.content as FeedGrantContent;
  const grantData = content.grant;

  if (!grantData) return null;

  const isOpen = grantData.status === 'OPEN' && grantData.isActive;
  const amount = showUSD ? grantData.amount.usd : grantData.amount.rsc;
  const applicantCount = grantData.applicants?.length || 0;

  // Time remaining
  const timeRemaining = grantData.endDate
    ? formatDistanceToNowStrict(new Date(grantData.endDate), { addSuffix: false })
    : null;

  const href = `/grant/${content.id}/${content.slug}`;

  if (compact) {
    return (
      <Link
        href={href}
        className={cn(
          'block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow',
          className
        )}
      >
        <div className="flex items-start gap-3">
          {/* Image */}
          <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            {content.previewImage ? (
              <Image src={content.previewImage} alt={content.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <span className="text-primary-400 text-xl">$</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">{content.title}</h3>
            <p className="text-sm font-semibold text-primary-600">
              {formatCurrency({
                amount,
                showUSD,
                exchangeRate,
                shorten: true,
                skipConversion: true,
              })}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className={cn('bg-white rounded-xl border-2 border-primary-100 p-6', className)}>
      {/* Header badges */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
          Funding Opportunity
        </span>
        {isOpen && (
          <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
            Open
          </span>
        )}
        {!isOpen && (
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            Closed
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold text-gray-900 mb-2">{content.title}</h1>

      {/* Organization */}
      {grantData.organization && (
        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
          <Building2 size={14} className="text-gray-400" />
          <span>{grantData.organization}</span>
        </div>
      )}

      {/* Description */}
      {content.textPreview && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{content.textPreview}</p>
      )}

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4">
        {/* Amount */}
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-primary-600">
            {formatCurrency({
              amount,
              showUSD,
              exchangeRate,
              shorten: false,
              skipConversion: true,
            })}
          </span>
          <span className="text-sm text-gray-500">available</span>
        </div>

        {/* Time remaining */}
        {timeRemaining && isOpen && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Calendar size={14} className="text-gray-400" />
            <span>Ends in {timeRemaining}</span>
          </div>
        )}

        {/* Applicants */}
        <div className="text-sm text-gray-600">
          {applicantCount} {applicantCount === 1 ? 'proposal' : 'proposals'} submitted
        </div>
      </div>

      {/* CTA */}
      {isOpen && (
        <Link href={`${href}/applications`}>
          <Button variant="default" size="md" className="gap-2">
            Submit Proposal
            <ArrowRight size={16} />
          </Button>
        </Link>
      )}
    </div>
  );
};
