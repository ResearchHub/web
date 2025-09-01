'use client';

import { FC } from 'react';
import { Trophy, MessageSquareReply, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons/Icon';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { formatCurrency } from '@/utils/currency';
import { Bounty } from '@/types/bounty';
import { Work } from '@/types/work';
import { calculateTotalAwardedAmount, isOpenBounty } from './lib/bountyUtil';
import { useWork } from '@/contexts/WorkContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useUser } from '@/contexts/UserContext';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { dedupeAvatars } from '@/utils/avatarUtil';
import { formatDistanceToNow } from 'date-fns';

interface BountyInlineBannerProps {
  bounty: Bounty;
  work?: Work | null; // Optional work prop for when WorkContext is not available
  showContributeButton?: boolean;
  onAddSolution: (e: React.MouseEvent) => void;
  onContribute?: (e: React.MouseEvent) => void;
  onAward?: (e: React.MouseEvent) => void;
  showCreatorActions?: boolean;
  showSupportAndCTAButtons?: boolean;
  showRequirementsButton?: boolean;
  onViewRequirements?: (e: React.MouseEvent) => void;
}

export const BountyInlineBanner: FC<BountyInlineBannerProps> = ({
  bounty,
  work: workProp,
  showContributeButton = true,
  onAddSolution,
  onContribute,
  onAward,
  showCreatorActions = true,
  showSupportAndCTAButtons = true,
  showRequirementsButton = false,
  onViewRequirements,
}) => {
  // Try to use WorkContext if available, otherwise use prop
  let work = workProp;
  try {
    const workContext = useWork();
    work = workContext.work || workProp;
  } catch (error) {
    // WorkContext not available, use prop
  }

  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { user } = useUser();

  const isOpen = isOpenBounty(bounty);
  const hasSolutions = bounty.solutions && bounty.solutions.length > 0;
  const solutionsCount = bounty.solutions ? bounty.solutions.length : 0;
  const isAuthor = user?.authorProfile?.id === bounty.createdBy?.authorProfile?.id;

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!bounty.expirationDate) return null;
    const expirationDate = new Date(bounty.expirationDate);
    const now = new Date();
    const daysRemaining = Math.ceil(
      (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysRemaining < 0) return 'Expired';
    if (daysRemaining === 0) return 'Expires today';
    if (daysRemaining === 1) return '1 day remaining';
    return `${daysRemaining} days remaining`;
  };

  const timeRemaining = getDaysRemaining();

  // Extract contributor avatars
  const contributorAvatars =
    bounty.contributions?.map((contribution) => ({
      src: contribution.createdBy?.authorProfile?.profileImage || '/images/default-avatar.png',
      alt: contribution.createdBy?.authorProfile?.fullName || 'Contributor',
      tooltip: contribution.createdBy?.authorProfile?.fullName,
      authorId: contribution.createdBy?.authorProfile?.id,
    })) || [];

  const dedupedContributorAvatars = dedupeAvatars(contributorAvatars);

  if (!showSupportAndCTAButtons) {
    return null;
  }

  const awardButton =
    showCreatorActions && isAuthor && isOpen && onAward ? (
      <Button
        onClick={onAward}
        size="sm"
        variant="outlined"
        className="flex items-center justify-center gap-2 text-amber-600 border-amber-500 hover:bg-amber-50 text-sm font-medium px-4 py-2 w-full sm:w-auto sm:min-w-[140px]"
      >
        <Trophy size={16} />
        Award bounty
      </Button>
    ) : null;

  // Open bounty banner
  if (isOpen) {
    return (
      <div
        className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border-y border-orange-200 md:border-x md:rounded-b-lg py-3 px-4"
        onClick={(e) => e.stopPropagation()}
        role="presentation"
        aria-hidden="true"
        tabIndex={-1}
      >
        <div className="flex flex-col gap-3">
          {/* Top section - Bounty info */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left side - Bounty amount with metadata */}
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg flex-shrink-0 flex items-center justify-center">
                <Icon name="solidEarn" size={24} color="#f97316" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-orange-500">
                  Earn{' '}
                  {formatCurrency({
                    amount: parseFloat(bounty.totalAmount),
                    showUSD,
                    exchangeRate,
                    shorten: false,
                  })}{' '}
                  {showUSD ? 'USD' : 'RSC'}
                </h3>
                <div className="flex items-center gap-2 text-xs">
                  {timeRemaining && (
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-gray-500" />
                      <span
                        className={`font-medium ${
                          timeRemaining === 'Expires today' || timeRemaining === '1 day remaining'
                            ? 'text-orange-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {timeRemaining}
                      </span>
                    </div>
                  )}
                  {timeRemaining && dedupedContributorAvatars.length > 0 && (
                    <span className="text-gray-400">•</span>
                  )}
                  {dedupedContributorAvatars.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <AvatarStack
                        items={dedupedContributorAvatars}
                        size="xxs"
                        maxItems={3}
                        spacing={-6}
                        showExtraCount={true}
                      />
                      <span className="text-gray-500">
                        {dedupedContributorAvatars.length}{' '}
                        {dedupedContributorAvatars.length === 1 ? 'supporter' : 'supporters'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex gap-2">
              {showRequirementsButton && onViewRequirements && (
                <Button
                  onClick={onViewRequirements}
                  size="sm"
                  variant="outlined"
                  className="flex items-center justify-center gap-1.5 text-gray-600 border-gray-300 hover:bg-gray-50 text-sm font-medium px-3 py-2"
                >
                  <FileText size={14} />
                  Requirements
                </Button>
              )}

              <Button
                variant="default"
                size="sm"
                className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white border-0 text-sm font-medium px-3 py-2"
                onClick={onAddSolution}
              >
                <MessageSquareReply size={14} />
                {work?.postType === 'QUESTION'
                  ? 'Add answer'
                  : bounty.bountyType === 'REVIEW'
                    ? 'Add Review'
                    : 'Add Solution'}
              </Button>

              {showContributeButton && !isAuthor && onContribute && (
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={onContribute}
                  className="flex items-center justify-center gap-1.5 text-orange-500 border-orange-500 hover:bg-orange-50 text-sm font-medium px-3 py-2"
                >
                  <ResearchCoinIcon outlined size={14} />
                  Support
                </Button>
              )}

              {awardButton && (
                <Button
                  onClick={awardButton.props.onClick}
                  size="sm"
                  variant="outlined"
                  className="flex items-center justify-center gap-1.5 text-amber-600 border-amber-500 hover:bg-amber-50 text-sm font-medium px-3 py-2"
                >
                  <Trophy size={14} />
                  Award
                </Button>
              )}
            </div>
          </div>

          {/* Mobile CTAs - Full width at bottom */}
          <div className="flex md:hidden gap-2 w-full">
            {/* If requirements button is shown, prioritize it with the main action */}
            {showRequirementsButton && onViewRequirements ? (
              <>
                <Button
                  onClick={onViewRequirements}
                  size="sm"
                  variant="outlined"
                  className="flex-1 flex items-center justify-center gap-1.5 text-gray-600 border-gray-300 hover:bg-gray-50 text-sm font-medium px-3 py-2"
                >
                  <FileText size={14} />
                  <span className="hidden sm:inline">Requirements</span>
                  <span className="sm:hidden">Details</span>
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white border-0 text-sm font-medium px-3 py-2"
                  onClick={onAddSolution}
                >
                  <MessageSquareReply size={14} />
                  {work?.postType === 'QUESTION'
                    ? 'Answer'
                    : bounty.bountyType === 'REVIEW'
                      ? 'Review'
                      : 'Solve'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white border-0 text-sm font-medium px-3 py-2"
                  onClick={onAddSolution}
                >
                  <MessageSquareReply size={14} />
                  {work?.postType === 'QUESTION'
                    ? 'Answer'
                    : bounty.bountyType === 'REVIEW'
                      ? 'Review'
                      : 'Solve'}
                </Button>

                {showContributeButton && !isAuthor && onContribute && (
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={onContribute}
                    className="flex-1 flex items-center justify-center gap-1.5 text-orange-500 border-orange-500 hover:bg-orange-50 text-sm font-medium px-3 py-2"
                  >
                    <ResearchCoinIcon outlined size={14} />
                    Support
                  </Button>
                )}

                {!showContributeButton && awardButton && (
                  <Button
                    onClick={awardButton.props.onClick}
                    size="sm"
                    variant="outlined"
                    className="flex-1 flex items-center justify-center gap-1.5 text-amber-600 border-amber-500 hover:bg-amber-50 text-sm font-medium px-3 py-2"
                  >
                    <Trophy size={14} />
                    Award
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Closed bounty banner
  return (
    <div
      className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 border-y border-gray-300 md:border-x md:rounded-b-lg px-4 py-3"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left side - Closed bounty info */}
        <div className="flex items-center gap-3">
          <Trophy className="text-gray-500 h-5 w-5" />
          <div>
            <h3 className="text-base font-medium text-gray-700">Bounty Closed</h3>
            <p className="text-xs text-gray-600 mt-0.5">
              {hasSolutions
                ? `${solutionsCount} ${solutionsCount === 1 ? 'solution' : 'solutions'} submitted • ${formatCurrency(
                    {
                      amount: calculateTotalAwardedAmount(bounty),
                      showUSD,
                      exchangeRate,
                      shorten: false,
                    }
                  )} ${showUSD ? 'USD' : 'RSC'} awarded`
                : 'This bounty has been closed'}
            </p>
          </div>
        </div>

        {/* Right side - Award button for author */}
        {awardButton && <div className="flex items-center gap-2 flex-shrink-0">{awardButton}</div>}
      </div>
    </div>
  );
};
