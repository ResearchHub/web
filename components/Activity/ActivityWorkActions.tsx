'use client';

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useShareModalContext } from '@/contexts/ShareContext';
import { getCommentPreview } from './lib/feedEntryAdapters';
import { getWorkCardPresentation, type ActivityWork } from './lib/activityWorkContext';
import type { FeedEntry } from '@/types/feed';

interface ActivityWorkActionsProps {
  entry: FeedEntry;
  work: ActivityWork;
  /** Called when a link CTA navigates away (e.g. scroll-restore click tracking). */
  onNavigate?: () => void;
}

/**
 * Footer actions for an activity work card (votes/share + CTA), including fund modal.
 */
export const ActivityWorkActions: FC<ActivityWorkActionsProps> = ({ entry, work, onNavigate }) => {
  const router = useRouter();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { showShareModal } = useShareModalContext();
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);

  const commentPreview = getCommentPreview(entry);
  const presentation = getWorkCardPresentation(entry, work, {
    showUSD,
    exchangeRate,
    isReview: commentPreview?.isReview,
  });

  const voteCount = entry.metrics?.adjustedScore ?? entry.metrics?.votes ?? 0;
  const feedContentType = work.documentType === 'paper' ? 'PAPER' : 'POST';
  const cta = presentation.cta;

  const handleContributeSuccess = () => {
    setIsContributeModalOpen(false);
    showShareModal({
      url: window.location.href,
      docTitle: work.title,
      action: 'USER_FUNDED_PROPOSAL',
    });
    router.refresh();
  };

  const rightSideActionButton = cta ? (
    <Button
      variant="dark"
      size="sm"
      onClick={
        cta.kind === 'fund-modal'
          ? () => setIsContributeModalOpen(true)
          : () => {
              onNavigate?.();
              router.push(cta.href);
            }
      }
      className="rounded-md gap-1"
    >
      {cta.label}
      <ArrowRight size={14} aria-hidden />
    </Button>
  ) : undefined;

  return (
    <>
      <FeedItemActions
        metrics={{ votes: voteCount, adjustedScore: voteCount }}
        feedContentType={feedContentType}
        votableEntityId={work.id}
        relatedDocumentId={work.id.toString()}
        relatedDocumentContentType={work.documentType}
        relatedDocumentUnifiedDocumentId={work.unifiedDocumentId?.toString()}
        userVote={entry.userVote}
        href={work.href}
        hideCommentButton
        hideReportButton
        variant="compact"
        leadingUtilityActions
        rightSideActionButton={rightSideActionButton}
      />

      {work.fundraise && (
        <ContributeToFundraiseModal
          isOpen={isContributeModalOpen}
          onClose={() => setIsContributeModalOpen(false)}
          onContributeSuccess={handleContributeSuccess}
          fundraise={work.fundraise}
          proposalTitle={work.title}
        />
      )}
    </>
  );
};
