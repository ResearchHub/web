'use client';

import { FC } from 'react';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { ContributorsButton } from '@/components/ui/ContributorsButton';
import { Button } from '@/components/ui/Button';
import { formatDate, isDeadlineInFuture } from '@/utils/date';
import { FeedGrantContent } from '@/types/feed';
import { useRouter } from 'next/navigation';
import { colors } from '@/app/styles/colors';
import { cn } from '@/utils/styles';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';

interface GrantInfoProps {
  grant: FeedGrantContent;
  className?: string;
}

export const GrantInfo: FC<GrantInfoProps> = ({ grant, className }) => {
  const router = useRouter();
  const { showUSD } = useCurrencyPreference();

  if (!grant || !grant.grant) return null;

  // Check if RFP is active
  const isActive =
    grant.grant?.status === 'OPEN' &&
    (grant.grant?.endDate ? isDeadlineInFuture(grant.grant?.endDate) : true);
  const deadline = grant.grant.endDate ? formatDate(grant.grant.endDate) : undefined;

  // Prepare applicants data for ContributorsButton
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
      return <span className="text-lg text-gray-500 font-semibold">Closed</span>;
    }
    if (deadline) {
      return (
        <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
          <span className="text-lg">{deadline}</span>
        </div>
      );
    }
    return null;
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/grant/${grant.id}/${grant.slug}`);
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/grant/${grant.id}/${grant.slug}/applications`);
  };

  const handleApplicantsClick = () => {
    router.push(`/grant/${grant.id}/${grant.slug}/applications`);
  };

  const budgetAmount = grant.grant.amount?.rsc || 0;

  return (
    <div className="bg-primary-50 rounded-lg p-4 border border-primary-100 cursor-default">
      <div className={cn('p-3 bg-white rounded-lg border border-gray-200', className)}>
        {/* Top Section: Total Budget and Deadline */}
        <div className="flex flex-row flex-wrap items-start justify-between mb-3">
          {/* Total Budget */}
          <div className="text-left sm:!order-1 order-2 flex sm:!block justify-between w-full sm:!w-auto items-center">
            <span className="text-gray-500 text-base mb-1 inline-block">Total Budget</span>
            <div className="flex items-center flex-wrap min-w-0 truncate font-semibold">
              <CurrencyBadge
                amount={Math.round(budgetAmount)}
                variant="text"
                size="xl"
                showText={true}
                currency={showUSD ? 'USD' : 'RSC'}
                className="p-0 gap-0"
                textColor="text-gray-700"
                showExchangeRate={false}
                iconColor={colors.gray[700]}
                iconSize={24}
                shorten
              />
            </div>
          </div>

          {/* Deadline */}
          <div className="flex-shrink-0 whitespace-nowrap text-left sm:!text-right sm:!order-2 order-1 sm:!block flex justify-between w-full sm:!w-auto items-center">
            <div className="block text-gray-500 text-base mb-1">Deadline</div>
            {getStatusDisplay()}
          </div>
        </div>

        {/* Bottom Section: Applicants and CTA Buttons */}
        <div className="flex items-center justify-between gap-3 border-t border-primary-200 pt-3">
          {/* Applicants */}
          {applicants.length > 0 && (
            <div className={cn('flex justify-center mobile:!justify-end')}>
              <ContributorsButton
                contributors={applicants}
                onContribute={handleApplicantsClick}
                label="Applicants"
                size="md"
                disableContribute={false}
                variant="count"
                customOnClick={handleApplicantsClick}
              />
            </div>
          )}

          {applicants.length === 0 && <div className="flex-shrink-0"></div>}

          {/* CTA Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="md"
              onClick={handleDetailsClick}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Details
            </Button>
            {isActive && (
              <Button
                variant="default"
                size="md"
                onClick={handleApplyClick}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                Apply
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
