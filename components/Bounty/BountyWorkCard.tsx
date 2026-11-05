'use client';

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Info } from 'lucide-react';
import {
  ActivityTimestamp,
  ActivityWorkActions,
  ActivityWorkMetadata,
  WorkPreviewCard,
} from '@/components/Activity';
import {
  getActivityBounty,
  getActivityWork,
  getWorkCardPresentation,
  type WorkCardStat,
} from '@/components/Activity/lib/activityWork.utils';
import { BountyDetailsModal } from '@/components/Bounty/BountyInfo';
import { getBountyDisplayAmount } from '@/components/Bounty/lib/bountyUtil';
import { Button } from '@/components/ui/Button';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { formatCurrency } from '@/utils/currency';
import { getRemainingDays, isDeadlineInFuture } from '@/utils/date';
import { cn } from '@/utils/styles';
import { buildWorkUrl } from '@/utils/url';
import type { Bounty } from '@/types/bounty';
import type { FeedEntry } from '@/types/feed';

interface BountyWorkCardProps {
  entry: FeedEntry;
  /** Fired when the user opens the work, for feed click analytics. */
  onNavigate?: () => void;
}

interface BountyStatus {
  label: string;
  isActive: boolean;
  urgent: boolean;
}

/**
 * A bounty is worth acting on while it is open and unexpired; one in assessment
 * is still live but closed to new submissions.
 */
function resolveStatus(bounty: Bounty): BountyStatus {
  if (bounty.status === 'ASSESSMENT') {
    return { label: 'In assessment', isActive: true, urgent: false };
  }

  if (bounty.status !== 'OPEN') {
    return { label: 'Ended', isActive: false, urgent: false };
  }

  if (bounty.expirationDate && !isDeadlineInFuture(bounty.expirationDate)) {
    return { label: 'Ended', isActive: false, urgent: false };
  }

  const days = getRemainingDays(bounty.expirationDate ?? null);
  if (days == null) {
    return { label: 'Open', isActive: true, urgent: false };
  }

  const whole = Math.floor(days);
  return {
    label: days < 1 ? '< 1 day left' : `${whole} day${whole === 1 ? '' : 's'} left`,
    isActive: true,
    urgent: days < 3,
  };
}

/**
 * Bounty card for the peer review feed. Shares the activity feed's work-card
 * language (frosted image card over an action footer) while keeping the
 * details and submission CTAs that turn a reader into a reviewer.
 */
export const BountyWorkCard: FC<BountyWorkCardProps> = ({ entry, onNavigate }) => {
  const router = useRouter();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { updateLastClickedEntryId } = useNavigation();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const work = getActivityWork(entry);
  const bounty = getActivityBounty(entry);

  if (!work || !bounty) return null;

  const entryId = String(entry.id);
  const isReviewBounty = bounty.bountyType === 'REVIEW';
  const isQuestion = (entry.content as { postType?: string }).postType === 'QUESTION';
  const status = resolveStatus(bounty);

  const { amount: displayAmount } = getBountyDisplayAmount(bounty, exchangeRate, showUSD);

  // This feed is bounties-only, so the reward is derived directly from the
  // bounty rather than inferred from `activityAction` the way an activity row
  // has to.
  const stats: WorkCardStat[] = [
    {
      label: isReviewBounty ? 'Peer Review' : 'Bounty',
      value: formatCurrency({
        amount: Math.round(displayAmount),
        showUSD,
        exchangeRate,
        skipConversion: true,
        shorten: true,
      }),
      accent: true,
      accentColor: isReviewBounty ? 'orange' : 'emerald',
    },
  ];

  const presentation = {
    ...getWorkCardPresentation(entry, work, { showUSD, exchangeRate }),
    stats,
    // A proposal's base presentation carries its fundraise total and progress
    // bar; the reward is the only figure that matters on this feed.
    progress: undefined,
  };

  const ctaLabel = isQuestion ? 'Answer' : isReviewBounty ? 'Add Review' : 'Solve';

  const handleNavigate = () => {
    updateLastClickedEntryId(entryId);
    onNavigate?.();
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDetailsOpen(true);
  };

  const handleAddSolutionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleNavigate();

    const url = buildWorkUrl({
      id: work.id,
      slug: work.slug,
      contentType: isQuestion ? 'question' : work.documentType,
      tab: isQuestion ? 'conversation' : 'reviews',
    });
    router.push(`${url}?focus=true`);
  };

  return (
    <article data-entry-id={entryId}>
      <WorkPreviewCard work={work} brand={presentation.brand} onNavigate={handleNavigate}>
        <WorkPreviewCard.Overlay position="top-right">
          <span
            className={cn(
              'rounded-md border px-2 py-0.5 text-[11px] font-semibold shadow-sm',
              status.urgent
                ? 'border-amber-300/80 bg-amber-50/95 text-amber-800'
                : 'border-gray-200/80 bg-white/95 text-gray-900'
            )}
          >
            {status.label}
          </span>
        </WorkPreviewCard.Overlay>
        <WorkPreviewCard.Metadata>
          <ActivityWorkMetadata work={work} presentation={presentation} />
        </WorkPreviewCard.Metadata>
        <WorkPreviewCard.Actions>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <ActivityWorkActions entry={entry} work={work} />
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              <Button
                variant="outlined"
                size="sm"
                className="flex-shrink-0 gap-1.5 rounded-lg text-[13px] text-gray-600 hover:text-gray-800"
                onClick={handleDetailsClick}
              >
                <Info size={14} />
                <span className="hidden sm:inline">Details</span>
              </Button>
              {status.isActive ? (
                <Button
                  variant="dark"
                  size="sm"
                  className="flex-shrink-0 gap-1"
                  onClick={handleAddSolutionClick}
                >
                  {ctaLabel}
                  <ArrowRight size={14} />
                </Button>
              ) : (
                <span className="flex-shrink-0 text-sm text-gray-400">Ended</span>
              )}
            </div>
          </div>
        </WorkPreviewCard.Actions>
      </WorkPreviewCard>
      <ActivityTimestamp timestamp={entry.timestamp} className="mt-3" />

      <BountyDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        content={bounty.comment?.content}
        contentFormat={bounty.comment?.contentFormat}
        bountyType={bounty.bountyType}
        displayAmount={displayAmount}
        showUSD={showUSD}
        deadlineLabel={status.label}
        onAddSolutionClick={handleAddSolutionClick}
        buttonText={ctaLabel}
        isActive={status.isActive}
      />
    </article>
  );
};
