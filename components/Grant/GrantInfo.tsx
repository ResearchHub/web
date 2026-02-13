'use client';

import { FC } from 'react';
import { Button } from '@/components/ui/Button';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { formatDate } from '@/utils/date';
import { isGrantActive } from './lib/grantUtils';
import { FeedGrantContent } from '@/types/feed';
import { useRouter } from 'next/navigation';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { ArrowRight } from 'lucide-react';

interface GrantInfoProps {
  grant: FeedGrantContent;
  className?: string;
  onFeedItemClick?: () => void;
}

// Helper to format currency
const formatCurrency = (amount: number, showUSD: boolean): string => {
  if (showUSD) {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  }
  // RSC formatting
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M RSC`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K RSC`;
  }
  return `${amount.toLocaleString()} RSC`;
};

export const GrantInfo: FC<GrantInfoProps> = ({ grant, className, onFeedItemClick }) => {
  const router = useRouter();
  const { showUSD } = useCurrencyPreference();

  if (!grant || !grant.grant) return null;

  // Check if RFP is active
  const isActive = isGrantActive(grant.grant?.status, grant.grant?.endDate);
  const deadline = grant.grant.endDate ? formatDate(grant.grant.endDate) : undefined;

  const applicants =
    grant.grant.applicants?.map((applicant) => ({
      profile: {
        profileImage: applicant.profileImage,
        fullName:
          applicant.firstName && applicant.lastName
            ? `${applicant.firstName} ${applicant.lastName}`
            : applicant.firstName || 'Applicant',
        id: applicant.id,
      },
      amount: 0,
    })) || [];

  const handleApplicantsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFeedItemClick) {
      onFeedItemClick();
    }
    router.push(`/opportunity/${grant.id}/${grant.slug}/applications`);
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFeedItemClick) {
      onFeedItemClick();
    }
    router.push(`/opportunity/${grant.id}/${grant.slug}/applications`);
  };

  const budgetAmount = grant.grant.amount?.rsc || 0;
  const applicantCount = applicants.length;

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3">
        {/* Stats Section */}
        <div className="flex items-center gap-4 sm:gap-8 min-w-0 flex-1">
          {/* Funding Amount */}
          <div className="flex flex-col flex-shrink-0">
            <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide mb-0.5">
              Funding
            </span>
            <span
              className={`text-base sm:text-lg font-bold ${isActive ? 'text-green-600' : 'text-gray-500'}`}
            >
              {formatCurrency(Math.round(budgetAmount), showUSD)}
            </span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-gray-200" />

          {/* Deadline */}
          {deadline && (
            <div className="hidden sm:flex flex-col flex-shrink-0">
              <span className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Deadline</span>
              <span className="text-base font-semibold text-gray-800">{deadline}</span>
            </div>
          )}

          {/* Divider */}
          {deadline && <div className="hidden sm:block w-px h-8 bg-gray-200" />}

          {/* Applicants with AvatarStack */}
          <div
            className={`hidden sm:flex flex-col flex-shrink-0 ${applicantCount > 0 ? 'cursor-pointer' : ''}`}
            onClick={applicantCount > 0 ? handleApplicantsClick : undefined}
          >
            <span className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Applicants</span>
            <div className="flex items-center gap-2">
              {applicantCount > 0 ? (
                <>
                  <AvatarStack
                    items={applicants.map((applicant) => ({
                      src: applicant.profile.profileImage || '',
                      alt: applicant.profile.fullName,
                      tooltip: applicant.profile.fullName,
                      authorId: applicant.profile.id,
                    }))}
                    size="xs"
                    maxItems={3}
                    spacing={-6}
                    showExtraCount={false}
                    totalItemsCount={applicantCount}
                    extraCountLabel="Applicants"
                    showLabel={false}
                  />
                  <span className="text-base font-semibold text-gray-800">{applicantCount}</span>
                </>
              ) : (
                <span className="text-base font-semibold text-gray-800">0</span>
              )}
            </div>
          </div>

          {/* Mobile: Status badge */}
          <div className="sm:hidden flex-shrink-0">
            {isActive ? (
              <span className="text-xs font-medium text-primary-700 bg-primary-100 px-2 py-0.5 rounded-full">
                Open
              </span>
            ) : (
              <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                Closed
              </span>
            )}
          </div>
        </div>

        {/* Right: CTA Button */}
        <div className="flex items-center flex-shrink-0">
          <Button
            variant="default"
            size="sm"
            onClick={isActive ? handleApplyClick : undefined}
            disabled={!isActive}
            className={`!py-2 !px-5 ${isActive ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          >
            <span className="text-sm font-semibold flex items-center gap-1.5">
              {isActive ? 'Apply now' : 'Closed'}
              {isActive && <ArrowRight size={16} />}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};
