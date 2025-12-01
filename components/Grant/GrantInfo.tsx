'use client';

import { FC } from 'react';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { formatDate, isDeadlineInFuture } from '@/utils/date';
import { FeedGrantContent } from '@/types/feed';
import { useRouter } from 'next/navigation';
import { colors } from '@/app/styles/colors';
import { cn } from '@/utils/styles';
import { StatusCard } from '@/components/ui/StatusCard';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';

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

  // Get status display for deadline
  const getStatusDisplay = () => {
    if (!isActive) {
      return <div className="text-sm text-gray-500 font-bold">Closed</div>;
    }
    if (deadline) {
      return (
        <div className="flex items-center gap-1 text-gray-700 font-bold">
          <span className="text-base">{deadline}</span>
        </div>
      );
    }
    return null;
  };

  const handleApplicantsClick = () => {
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

  return (
    <StatusCard variant={isActive ? 'active' : 'inactive'} className={className}>
      {/* Top Section: Funding Amount and Deadline */}
      <div className="flex flex-row flex-wrap items-start justify-between mb-2">
        {/* Funding Amount */}
        <div className="text-left sm:!order-1 order-2 flex sm:!block justify-between w-full sm:!w-auto items-center">
          <span className="text-gray-500 text-sm mb-0.5 inline-block">Funding Amount</span>
          <div className="flex items-center flex-wrap min-w-0 truncate font-semibold">
            <CurrencyBadge
              amount={Math.round(budgetAmount)}
              variant="text"
              size="xl"
              showText={true}
              currency={showUSD ? 'USD' : 'RSC'}
              className="p-0 gap-0"
              textColor="text-gray-700"
              fontWeight="font-bold"
              showExchangeRate={false}
              iconColor={colors.gray[700]}
              iconSize={24}
              shorten
            />
          </div>
        </div>

        {/* Deadline */}
        <div className="flex-shrink-0 whitespace-nowrap text-left sm:!text-right sm:!order-2 order-1 sm:!block flex justify-between w-full sm:!w-auto items-center">
          {isActive && <div className="block text-gray-500 text-sm mb-0.5">Deadline</div>}
          {getStatusDisplay()}
        </div>
      </div>

      {/* Bottom Section: Applicants and CTA Buttons */}
      <div
        className={cn(
          'flex items-center justify-between gap-2 border-t pt-2',
          isActive ? 'border-primary-200' : 'border-gray-200'
        )}
      >
        {/* Applicants */}
        {applicants.length > 0 && (
          <div
            className="cursor-pointer flex-shrink-0 flex items-center"
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
              showExtraCount={applicants.length > 3}
              totalItemsCount={applicants.length}
              extraCountLabel="Applicants"
              showLabel={false}
            />
          </div>
        )}

        {applicants.length === 0 && <div className="flex-shrink-0"></div>}

        {/* CTA Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleDetailsClick}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Details
          </Button>
          {isActive && (
            <Button
              variant="default"
              size="sm"
              onClick={handleApplyClick}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              Apply
            </Button>
          )}
        </div>
      </div>
    </StatusCard>
  );
};
