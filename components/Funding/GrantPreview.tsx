'use client';

import { FC, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FeedEntry, FeedGrantContent } from '@/types/feed';
import { Button } from '@/components/ui/Button';
import {
  Calendar,
  Building2,
  ArrowRight,
  DollarSign,
  FileText,
  LayoutList,
  MessageSquare,
  Activity,
} from 'lucide-react';
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
  status: string;
  isActive: boolean;
  amount: {
    usd: number;
    rsc: number;
  };
  endDate?: string;
  organization?: string;
  applicantCount: number;
}

interface GrantPreviewProps {
  grant: GrantPreviewData;
  className?: string;
  /** Show as compact card (for "All" view) */
  compact?: boolean;
  /** Whether the details section is expanded */
  showDetails?: boolean;
  /** Callback to toggle the details section */
  onToggleDetails?: () => void;
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
    status: grantData.status,
    isActive: grantData.isActive,
    amount: grantData.amount,
    endDate: grantData.endDate,
    organization: grantData.organization,
    applicantCount: grantData.applicants?.length || 0,
  };
}

type GrantDetailTab = 'proposals' | 'details' | 'conversation' | 'activity';

const GRANT_DETAIL_TABS: {
  id: GrantDetailTab;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: 'proposals', label: 'Proposals', icon: FileText },
  { id: 'details', label: 'Details', icon: LayoutList },
  { id: 'conversation', label: 'Conversation', icon: MessageSquare },
  { id: 'activity', label: 'Activity', icon: Activity },
];

export const GrantPreview: FC<GrantPreviewProps> = ({ grant, className, compact = false }) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const [activeTab, setActiveTab] = useState<GrantDetailTab>('proposals');

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
          {/* Header badges */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-primary-500 uppercase tracking-wide">
              Funding Opportunity
            </span>
            {isOpen ? (
              <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                Open
              </span>
            ) : (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                Closed
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-lg font-bold text-gray-900 mb-1.5 leading-snug">{grant.title}</h1>

          {/* Organization */}
          {grant.organization && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
              <Building2 size={14} className="text-gray-400" />
              <span>{grant.organization}</span>
            </div>
          )}

          {/* Text preview */}
          {grant.textPreview && (
            <p className="text-sm text-gray-600 mb-0 line-clamp-2">{grant.textPreview}</p>
          )}
        </div>

        {/* Action row: compact stats + Submit Proposal */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 mt-3">
          {/* Compact stats */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <DollarSign size={12} className="text-green-500" />
              <span className="font-semibold text-green-600">
                {formatCurrency({
                  amount,
                  showUSD,
                  exchangeRate,
                  shorten: true,
                  skipConversion: true,
                })}
              </span>
              <span>available</span>
            </span>
            {timeRemaining && isOpen && (
              <>
                <span className="text-gray-300">·</span>
                <span className="flex items-center gap-1">
                  <Calendar size={11} className="text-gray-400" />
                  <span>Ends in {timeRemaining}</span>
                </span>
              </>
            )}
            <span className="text-gray-300">·</span>
            <span>
              {grant.applicantCount} {grant.applicantCount === 1 ? 'proposal' : 'proposals'}
            </span>
          </div>

          {/* Submit Proposal CTA */}
          {isOpen && (
            <Link href={`${href}/applications`}>
              <Button variant="default" size="sm" className="gap-1.5 text-xs px-3 py-1.5 h-auto">
                Submit Proposal
                <ArrowRight size={13} />
              </Button>
            </Link>
          )}
        </div>

        {/* Full-width detail tabs */}
        <div className="flex border-t border-gray-100 bg-gray-50/60">
          {GRANT_DETAIL_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-3 transition-all duration-150 border-t-[2.5px] select-none',
                  isActive
                    ? 'border-primary-500 bg-white text-primary-600'
                    : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-white/60'
                )}
              >
                <tab.icon
                  size={15}
                  strokeWidth={isActive ? 2.5 : 1.75}
                  className={isActive ? 'text-primary-500' : 'text-gray-400'}
                />
                <span
                  className={cn(
                    'text-[11px] font-medium leading-none',
                    isActive ? 'text-primary-700' : 'text-gray-400'
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
