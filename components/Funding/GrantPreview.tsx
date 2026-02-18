'use client';

import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FeedEntry, FeedGrantContent } from '@/types/feed';
import { Button } from '@/components/ui/Button';
import { ArrowRight, DollarSign } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { formatCurrency } from '@/utils/currency';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { cn } from '@/utils/styles';

export interface GrantPreviewData {
  id: number;
  slug: string;
  title: string;
  previewImage?: string;
  textPreview?: string;
  description?: string;
  status: string;
  isActive: boolean;
  amount: {
    usd: number;
    rsc: number;
  };
  endDate?: string;
  startDate?: string;
  organization?: string;
  applicantCount: number;
}

interface GrantPreviewProps {
  grant: GrantPreviewData;
  className?: string;
  /** Show as compact card (for "All" view) */
  compact?: boolean;
}

/**
 * Helper to transform a FeedEntry into GrantPreviewData
 */
export function transformFeedEntryToGrantPreviewData(entry: FeedEntry): GrantPreviewData | null {
  const content = entry.content as FeedGrantContent;
  const grantData = content.grant;

  if (!grantData) return null;

  return {
    id: content.id,
    slug: content.slug,
    title: content.title,
    previewImage: content.previewImage,
    textPreview: content.textPreview,
    description: grantData.description,
    status: grantData.status,
    isActive: grantData.isActive,
    amount: grantData.amount,
    endDate: grantData.endDate,
    startDate: grantData.startDate,
    organization: grantData.organization,
    applicantCount: grantData.applicants?.length || 0,
  };
}

export const GrantPreview: FC<GrantPreviewProps> = ({ grant, className, compact = false }) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  const isOpen = grant.status === 'OPEN' && grant.isActive;
  const amount = showUSD ? grant.amount.usd : grant.amount.rsc;

  // Time remaining
  const timeRemaining = grant.endDate
    ? formatDistanceToNowStrict(new Date(grant.endDate), { addSuffix: false })
    : null;

  const href = `/grant/${grant.id}/${grant.slug}`;

  if (compact) {
    return (
      <Link
        href={href}
        className={cn(
          'group block bg-white rounded-xl border border-gray-200 p-4 hover:border-primary-200 hover:shadow-lg transition-all duration-200',
          className
        )}
      >
        <div className="flex items-start gap-3">
          {/* Image */}
          <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 ring-2 ring-gray-100 group-hover:ring-primary-100 transition-all">
            {grant.previewImage ? (
              <Image src={grant.previewImage} alt={grant.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 flex items-center justify-center">
                <DollarSign size={24} className="text-primary-400" />
              </div>
            )}
            {isOpen && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1.5 group-hover:text-primary-700 transition-colors">
              {grant.title}
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-primary-600">
                {formatCurrency({
                  amount,
                  showUSD,
                  exchangeRate,
                  shorten: true,
                  skipConversion: true,
                })}
              </span>
              {isOpen && <span className="text-xs text-green-600 font-medium">• Open</span>}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className={className}>
      {/* Grant preview card */}
      <div className="relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Left gradient accent - image or default gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-2 overflow-hidden">
          {grant.previewImage ? (
            <Image
              src={grant.previewImage}
              alt=""
              fill
              className="object-cover"
              style={{ objectPosition: 'left center' }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-[#e8f4fc] via-[#d4e8f8] to-[#c5dff4]" />
          )}
        </div>

        {/* Main content */}
        <div className="pl-6 pr-6 pt-5 pb-0">
          {/* Status badge */}
          <div className="mb-2">
            {isOpen ? (
              <span className="inline-flex items-center text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                Accepting Proposals
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                Closed
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-lg font-bold text-gray-900 mb-1.5 leading-snug">{grant.title}</h1>

          {/* Organization */}
          {grant.organization && <p className="text-sm text-gray-500 mb-2">{grant.organization}</p>}

          {/* Description */}
          {(grant.description || grant.textPreview) && (
            <p className="text-sm text-gray-600 mb-0 line-clamp-2">
              {grant.description || grant.textPreview}
            </p>
          )}
        </div>

        {/* Info columns + CTA */}
        <div className="flex items-center px-6 py-4 mt-3 border-t border-gray-100 bg-gray-50/50 gap-4">
          {/* Funding Available */}
          <div className="flex flex-col gap-1 flex-1">
            <span className="text-xs text-gray-500 font-medium">Funding Available</span>
            <span className="text-sm font-bold text-gray-900">
              {formatCurrency({
                amount,
                showUSD,
                exchangeRate,
                shorten: true,
                skipConversion: true,
              })}
            </span>
          </div>

          {/* Timeline */}
          <div className="flex flex-col gap-1 flex-1 border-l border-gray-200 pl-4">
            <span className="text-xs text-gray-500 font-medium">Timeline</span>
            <span className="text-sm font-bold text-gray-900">
              {isOpen ? (timeRemaining ? `Ends in ${timeRemaining}` : 'Immediate') : 'Ended'}
            </span>
          </div>

          {/* Allocation of funds */}
          <div className="flex flex-col gap-1 flex-1 border-l border-gray-200 pl-4">
            <span className="text-xs text-gray-500 font-medium">Allocation of Funds</span>
            <span className="text-sm font-bold text-gray-900">One or many</span>
          </div>

          {/* Submit Proposal CTA */}
          {isOpen && (
            <div className="border-l border-gray-200 pl-4 flex-shrink-0">
              <Link href={`${href}/applications`}>
                <Button variant="default" size="sm" className="gap-1.5 text-xs px-4 py-2.5 h-auto">
                  Submit Proposal
                  <ArrowRight size={13} />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
