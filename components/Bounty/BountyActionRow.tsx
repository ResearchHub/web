'use client';

import { FC, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, Trophy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  ENABLE_BOUNTY_BACKING,
  getBountyDisplayAmount,
  isActiveBounty,
  isOpenBounty,
} from '@/components/Bounty/lib/bountyUtil';
import { ContributeBountyModal } from '@/components/modals/ContributeBountyModal';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Button } from '@/components/ui/Button';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { Tooltip } from '@/components/ui/Tooltip';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatCurrency } from '@/utils/currency';
import { getRemainingDays } from '@/utils/date';
import { cn } from '@/utils/styles';
import { buildWorkUrl } from '@/utils/url';
import type { Bounty, BountyContribution } from '@/types/bounty';
import type { ContentType, Work } from '@/types/work';

interface BountyActionRowProps {
  bounty: Bounty;
  /** The comment that carries the bounty. */
  commentId: number;
  /** The work the bounty is on, for the Solve link; the page's own route otherwise. */
  relatedWork?: Work;
  relatedDocumentId?: number;
  relatedDocumentContentType?: ContentType;
  /**
   * The viewer may award it: both the bounty's creator and the Foundation or a
   * moderator. The button also needs the bounty active and `onAward`.
   */
  canAward?: boolean;
  onAward?: (bountyId: number) => void;
  /** The viewer created the bounty, so isn't offered to back it. */
  isAuthor?: boolean;
  showContributeButton?: boolean;
  onContributeSuccess?: () => void;
  /** Amount and status only, e.g. for a removed comment: no Award, Support or Solve. */
  hideActions?: boolean;
}

/**
 * A bounty's action row: its amount and status on the left, then Award, Support
 * and Solve on the right for whoever they apply to.
 */
export const BountyActionRow: FC<BountyActionRowProps> = ({
  bounty,
  commentId,
  relatedWork,
  relatedDocumentId,
  relatedDocumentContentType,
  canAward = false,
  onAward,
  isAuthor = false,
  showContributeButton = false,
  onContributeSuccess,
  hideActions = false,
}) => {
  const params = useParams();
  const router = useRouter();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);

  const isOpen = isOpenBounty(bounty);
  const isActive = isActiveBounty(bounty);

  // Calculate display amount (handles Foundation bounties with flat $150 USD)
  const { amount: displayBountyAmount } = getBountyDisplayAmount(bounty, exchangeRate, showUSD);

  const bountyLabel = bounty.bountyType === 'REVIEW' ? 'Peer Review' : 'Bounty';

  const statusInfo = (() => {
    if (bounty.status === 'OPEN' && isActive) {
      const days = getRemainingDays(bounty.expirationDate ?? null);
      const remaining =
        days !== null
          ? days < 1
            ? '< 1 day remaining'
            : `${Math.floor(days)} day${Math.floor(days) === 1 ? '' : 's'} remaining`
          : null;
      return { label: 'Open', color: 'bg-green-500', remaining, urgent: days !== null && days < 3 };
    }
    if (bounty.status === 'ASSESSMENT') {
      return { label: 'Assessment', color: 'bg-orange-500', remaining: null, urgent: false };
    }
    return { label: 'Completed', color: 'bg-gray-400', remaining: null, urgent: false };
  })();

  const getAddButtonText = () => {
    if (relatedWork?.postType === 'QUESTION') return 'Answer';
    if (bounty.bountyType === 'REVIEW') return 'Add Review';
    return 'Solve';
  };

  const contributors =
    bounty.contributions?.map((c: BountyContribution) => ({
      src: c.createdBy?.authorProfile?.profileImage || '',
      alt: c.createdBy?.authorProfile?.fullName || 'Anonymous',
      tooltip: c.createdBy?.authorProfile?.fullName || 'Anonymous',
      authorId: c.createdBy?.authorProfile?.id || undefined,
    })) ?? [];

  const handleOpenContributeModal = (e: React.MouseEvent | undefined) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsContributeModalOpen(true);
  };

  // Handle CTA button click (Add Review/Add Solution)
  const handleSolution = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent card click navigation

    // Attempt to derive the work details from the feed entry first
    let workId: string | number | undefined;
    let workSlug: string | undefined;
    let workContentType: string | undefined;
    let workPostType: string | undefined;

    if (relatedWork) {
      workId = relatedWork.id;
      workSlug = relatedWork.slug;
      workContentType = relatedWork.contentType;
      workPostType = relatedWork.postType;
    } else {
      // Fallback to next/router params (works when rendered on a work page)
      const { id: paramId, slug: paramSlug } = params;
      workId = paramId as string | number | undefined;
      workSlug = paramSlug as string | undefined;
      workContentType = relatedDocumentContentType;
    }

    if (!workId || !workContentType) {
      console.error('BountyActionRow: Unable to determine destination for CTA', {
        workId,
        workSlug,
        workContentType,
        bountyId: bounty.id,
      });
      return;
    }

    // Determine which tab to redirect to based on postType
    const targetTab = workPostType === 'QUESTION' ? 'conversation' : 'reviews';

    if (workPostType === 'QUESTION') {
      workContentType = 'question';
    }

    const workUrl = buildWorkUrl({
      id: workId.toString(),
      contentType: workContentType as any,
      slug: workSlug,
      tab: targetTab,
    });

    router.push(`${workUrl}?focus=true`);
  };

  const handleAwardBounty = (e: React.MouseEvent | undefined) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!bounty.id) {
      toast.error(
        'Bounty ID is missing. Please try again. If the problem persists, please contact support.'
      );
      return;
    }
    onAward?.(bounty.id);
  };

  const showBackingUI = ENABLE_BOUNTY_BACKING && showContributeButton;

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-6 min-w-0">
          <div className="flex flex-col leading-tight whitespace-nowrap">
            <span className="text-xs text-gray-500 uppercase tracking-wide">{bountyLabel}</span>
            <span className="font-mono font-semibold text-primary-600 text-xl">
              {formatCurrency({
                amount: Math.round(displayBountyAmount),
                showUSD,
                exchangeRate,
                skipConversion: showUSD,
                shorten: true,
              })}
            </span>
          </div>

          {showBackingUI && contributors.length > 0 && (
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Backers</span>
              <AvatarStack
                items={contributors}
                size="xs"
                maxItems={3}
                spacing={-6}
                showLabel={false}
                disableTooltip={false}
                showExtraCount={true}
                totalItemsCount={bounty.contributions?.length ?? 0}
                extraCountLabel="Backers"
              />
            </div>
          )}

          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</span>
            <div className="flex items-center gap-1.5">
              <RadiatingDot color={statusInfo.color} size="sm" isRadiating={isActive} />
              {bounty.status === 'ASSESSMENT' ? (
                <Tooltip
                  content="Editors are reviewing any submissions and will award top reviews."
                  position="top"
                >
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap border-b border-dashed border-gray-400 cursor-help">
                    {statusInfo.label}
                  </span>
                </Tooltip>
              ) : (
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  {statusInfo.label}
                </span>
              )}
              {statusInfo.remaining && (
                <span
                  className={cn(
                    'text-xs whitespace-nowrap',
                    statusInfo.urgent ? 'text-amber-600 font-medium' : 'text-gray-500'
                  )}
                >
                  ({statusInfo.remaining})
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!hideActions && canAward && isActive && onAward && (
            <Button
              onClick={handleAwardBounty}
              size="sm"
              variant="secondary"
              className="text-sm font-medium gap-2 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
            >
              <Trophy size={16} />
              Award bounty
            </Button>
          )}
          {!hideActions && showBackingUI && isActive && !isAuthor && (
            <Button
              variant="outlined"
              size="sm"
              onClick={handleOpenContributeModal}
              className="text-primary-600 gap-2 border-primary-600 hover:bg-primary-50 rounded-md text-[13px]"
            >
              <ResearchCoinIcon outlined size={16} />
              Support
            </Button>
          )}
          {!hideActions && isOpen && (
            <Button
              variant="dark"
              size="sm"
              className="flex-shrink-0 gap-1"
              onClick={handleSolution}
            >
              {getAddButtonText()}
              <ArrowRight size={14} />
            </Button>
          )}
        </div>
      </div>

      {ENABLE_BOUNTY_BACKING && (
        <ContributeBountyModal
          isOpen={isContributeModalOpen}
          onClose={() => setIsContributeModalOpen(false)}
          onContributeSuccess={() => onContributeSuccess?.()}
          commentId={commentId}
          documentId={relatedDocumentId || 0}
          contentType={relatedDocumentContentType || 'paper'}
          bountyTitle={'Bounty'}
          bountyType={bounty.bountyType}
          expirationDate={bounty.expirationDate}
        />
      )}
    </>
  );
};
