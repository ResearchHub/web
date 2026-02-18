'use client';

import { FC } from 'react';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { formatDate, isDeadlineInFuture } from '@/utils/date';
import { FeedGrantContent } from '@/types/feed';
import { useRouter } from 'next/navigation';
import { colors } from '@/app/styles/colors';
import { StatusCard } from '@/components/ui/StatusCard';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { Clock } from 'lucide-react';

interface GrantInfoProps {
  grant: FeedGrantContent;
  className?: string;
  onFeedItemClick?: () => void;
}

export const GrantInfo: FC<GrantInfoProps> = ({ grant, className, onFeedItemClick }) => {
  const router = useRouter();
  const { showUSD } = useCurrencyPreference();

  if (!grant || !grant.grant) return null;

  // Check if RFP is active
  const isActive =
    grant.grant?.status === 'OPEN' &&
    (grant.grant?.endDate ? isDeadlineInFuture(grant.grant?.endDate) : true);
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
    router.push(`/grant/${grant.id}/${grant.slug}/applications`);
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFeedItemClick) {
      onFeedItemClick();
    }
    router.push(`/grant/${grant.id}/${grant.slug}`);
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFeedItemClick) {
      onFeedItemClick();
    }
    router.push(`/grant/${grant.id}/${grant.slug}/applications`);
  };

  const budgetAmount = grant.grant.amount?.rsc || 0;
  const applicantCount = applicants.length;

  return (
    <StatusCard variant={isActive ? 'active' : 'inactive'} className={className}>
      <div className="flex items-center justify-between gap-3">
        {/* Left: Amount + Deadline + Applicants */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <CurrencyBadge
            amount={Math.round(budgetAmount)}
            variant="text"
            size="md"
            showText={true}
            currency={showUSD ? 'USD' : 'RSC'}
            className="p-0 gap-0"
            textColor={isActive ? 'text-primary-700' : 'text-gray-600'}
            fontWeight="font-bold"
            showExchangeRate={false}
            iconColor={isActive ? colors.primary[600] : colors.gray[500]}
            iconSize={18}
            shorten={false}
          />

          {/* Close date */}
          {deadline && isActive && (
            <div className="hidden sm:!flex items-center gap-1.5 text-xs text-gray-500">
              <Clock size={14} className="text-gray-400" />
              <span className="whitespace-nowrap">Closes {deadline}</span>
            </div>
          )}

          {/* Status badges */}
          {isActive && (
            <span className="text-xs font-medium text-primary-700 bg-primary-100 px-2 py-0.5 rounded-full">
              Open
            </span>
          )}
          {!isActive && (
            <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
              Closed
            </span>
          )}

          {/* Applicants section */}
          {applicantCount > 0 && (
            <div
              className="cursor-pointer hidden sm:!flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
              onClick={handleApplicantsClick}
            >
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
              <span className="text-xs text-gray-600 whitespace-nowrap">
                {applicantCount} {applicantCount === 1 ? 'Applicant' : 'Applicants'}
              </span>
            </div>
          )}
        </div>

        {/* Right: CTA Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outlined"
            size="sm"
            onClick={handleDetailsClick}
            className="!py-1.5 !px-2.5 text-gray-600 hover:text-gray-800"
          >
            <span className="text-xs font-medium">Details</span>
          </Button>
          {isActive && (
            <Button
              variant="default"
              size="sm"
              onClick={handleApplyClick}
              className="bg-primary-600 hover:bg-primary-700 text-white !py-1.5 !px-2.5"
            >
              <span className="text-xs font-medium">Apply</span>
            </Button>
          )}
        </div>
      </div>
    </StatusCard>
  );
};
