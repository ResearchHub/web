'use client';

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useShareModalContext } from '@/contexts/ShareContext';
import { ActivityCardHeader } from './ActivityCardHeader';
import { WorkPreviewCard } from './WorkPreviewCard';
import { getActivityHeaderMessage, getCommentPreview } from './lib/feedEntryAdapters';
import { getActivityWorkContext, getWorkCardPresentation } from './lib/activityWorkContext';
import type { FeedEntry } from '@/types/feed';

interface ActivityCardFullProps {
  entry: FeedEntry;
}

export const ActivityCardFull: FC<ActivityCardFullProps> = ({ entry }) => {
  const work = getActivityWorkContext(entry);
  const router = useRouter();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { showShareModal } = useShareModalContext();
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);

  if (!work) return null;

  const message = getActivityHeaderMessage(entry);
  const commentPreview = getCommentPreview(entry);
  const presentation = getWorkCardPresentation(entry, work, {
    showUSD,
    exchangeRate,
    isReview: commentPreview?.isReview,
  });

  const showComment = presentation.showComment && !!commentPreview;
  const voteCount = entry.metrics?.adjustedScore ?? entry.metrics?.votes ?? 0;
  const isReviewOfProposal = !!commentPreview?.isReview && work.documentType === 'preregistration';
  const feedContentType = work.documentType === 'paper' ? 'PAPER' : 'POST';

  const handleFundClick = () => {
    setIsContributeModalOpen(true);
  };

  const handleContributeSuccess = () => {
    setIsContributeModalOpen(false);
    showShareModal({
      url: window.location.href,
      docTitle: work.title,
      action: 'USER_FUNDED_PROPOSAL',
    });
    router.refresh();
  };

  const action = (() => {
    const cta = presentation.cta;
    if (!cta) return undefined;

    return (
      <Button
        variant="dark"
        size="sm"
        onClick={cta.kind === 'fund-modal' ? handleFundClick : () => router.push(cta.href)}
        className="rounded-md gap-1"
      >
        {cta.label}
        <ArrowRight size={14} aria-hidden />
      </Button>
    );
  })();

  return (
    <article className="py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex gap-2.5">
        <div className="flex w-8 flex-shrink-0 flex-col items-center">
          <div className="pt-0.5">
            <Avatar
              src={message.actor.profileImage}
              alt={message.actor.fullName || 'User'}
              size={32}
              authorId={message.actor.id}
            />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <ActivityCardHeader entry={entry} />

          {showComment && commentPreview && (
            <div className="mt-2">
              <CommentReadOnly
                content={commentPreview.content}
                contentFormat={commentPreview.format}
                maxLength={250}
                showReadMoreButton
                showLinkPreviews={false}
                className="text-sm"
              />
            </div>
          )}

          <div className="mt-5 -ml-[42px] tablet:!ml-0">
            <WorkPreviewCard
              title={work.title}
              href={work.href}
              imageSrc={work.imageUrl}
              showPlaceholder
              authors={isReviewOfProposal ? [] : presentation.authors}
              organization={presentation.organization}
              institution={presentation.institution}
              score={presentation.score}
              stats={presentation.stats}
              progress={presentation.progress}
              actions={
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
                  rightSideActionButton={action}
                />
              }
            />
          </div>
        </div>
      </div>

      {work.fundraise && (
        <ContributeToFundraiseModal
          isOpen={isContributeModalOpen}
          onClose={() => setIsContributeModalOpen(false)}
          onContributeSuccess={handleContributeSuccess}
          fundraise={work.fundraise}
          proposalTitle={work.title}
        />
      )}
    </article>
  );
};
