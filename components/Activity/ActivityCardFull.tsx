'use client';

import { FC } from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { Button } from '@/components/Editor/components/ui/Button/Button';
import { ContributionAmount } from './ContributionAmount';
import { DocumentPreviewCard } from './DocumentPreviewCard';
import { FeedEntryIcon } from './FeedEntryIcon';
import { GrantFundingAmount } from './GrantFundingAmount';
import { PeerReviewOpportunityCard } from './PeerReviewOpportunityCard';
import {
  getActionIcon,
  getActionLabel,
  getCommentPreview,
  getContribution,
  getDocumentInfo,
  getEntryMeta,
  getFundraiseAmounts,
  getGrantAmount,
  getPreviewImage,
  getReviewEarning,
  getReviewOpportunity,
  getReviewScore,
  getTextPreview,
} from './lib/feedEntryAdapters';
import { formatTimeAgo, formatTimeAgoShort } from '@/utils/date';
import type { FeedEntry } from '@/types/feed';

interface ActivityCardFullProps {
  entry: FeedEntry;
  /** Hide the expandable "Read review" toggle (used on the compact home feed). */
  hideReviewToggle?: boolean;
  /** Hide comment/body text below the document title (used on the compact home feed). */
  hideBodyText?: boolean;
  /** Show a thumbnail in the document card, falling back to a placeholder. */
  showThumbnail?: boolean;
  /** Render open peer-review bounties with the opportunity card treatment. */
  highlightReviewOpportunities?: boolean;
}

export const ActivityCardFull: FC<ActivityCardFullProps> = ({
  entry,
  hideReviewToggle = false,
  hideBodyText = false,
  showThumbnail = false,
  highlightReviewOpportunities = false,
}) => {
  const { title, author, href } = getEntryMeta(entry);
  const router = useRouter();

  if (!title) return null;

  const reviewOpportunity = highlightReviewOpportunities ? getReviewOpportunity(entry) : null;

  if (reviewOpportunity) {
    return (
      <PeerReviewOpportunityCard opportunity={reviewOpportunity} showThumbnail={showThumbnail} />
    );
  }

  const previewImage = getPreviewImage(entry);
  const actionLabel = getActionLabel(entry);
  const actionIcon = getActionIcon(entry);
  const reviewScore = getReviewScore(entry);
  const reviewEarning = getReviewEarning(entry);
  const grantAmount = getGrantAmount(entry);
  const contribution = getContribution(entry);
  const commentPreview = getCommentPreview(entry);
  const documentInfo = getDocumentInfo(entry);
  const textPreview = getTextPreview(entry);
  const isReviewOfProposal = !!commentPreview?.isReview && documentInfo.typeLabel === 'Proposal';

  const showCommentPreview = !hideBodyText && commentPreview;

  const fundraise = documentInfo.typeLabel === 'Proposal' ? getFundraiseAmounts(entry) : null;

  // Build stats for the main document card
  const mainStats = (() => {
    if (documentInfo.typeLabel === 'Opportunity' && grantAmount) {
      const usdVal = `$${Math.round(grantAmount.usd).toLocaleString()}`;
      return [{ label: 'Available', value: usdVal, accent: true }];
    }
    if (fundraise) {
      return [
        {
          label: 'Raising',
          value: `$${Math.round(fundraise.goalUsd).toLocaleString()}`,
          accent: true,
        },
      ];
    }
    return undefined;
  })();

  return (
    <div className="py-4 border-b border-gray-100 last:border-b-0">
      {/* Main row: avatar rail + content. */}
      <div className="flex gap-2.5">
        <div className="flex w-8 flex-shrink-0 flex-col items-center">
          <div className="pt-0.5">
            <AuthorTooltip authorId={author?.id} placement="bottom">
              <Avatar
                src={author?.profileImage}
                alt={author?.fullName || 'User'}
                size={32}
                authorId={author?.id}
                disableTooltip
              />
            </AuthorTooltip>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2.5 flex flex-wrap items-center gap-x-1.5 pt-1 text-sm leading-tight">
            <span className="font-medium text-gray-900">{author?.fullName || 'Unknown'}</span>
            <span className="text-gray-500">{actionLabel}</span>
            {grantAmount && <GrantFundingAmount amount={grantAmount} />}
            {contribution && <ContributionAmount contribution={contribution} />}
            {reviewEarning && <ContributionAmount contribution={reviewEarning} showSign={false} />}
            {reviewScore != null && (
              <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                {reviewScore.toFixed(1)}
              </span>
            )}
            <FeedEntryIcon
              name={
                grantAmount || contribution || reviewEarning || reviewScore != null
                  ? null
                  : actionIcon
              }
            />
            <span className="ml-auto whitespace-nowrap pl-2 text-xs text-gray-400">
              <span className="tablet:!hidden">{formatTimeAgoShort(entry.timestamp)}</span>
              <span className="hidden tablet:!inline">{formatTimeAgo(entry.timestamp)}</span>
            </span>
          </div>

          {/* Inline comment / review / update preview */}
          {showCommentPreview && (
            <div className="mt-2">
              <CommentReadOnly
                content={commentPreview.content}
                contentFormat={commentPreview.format}
                maxLength={250}
                showReadMoreButton={true}
                className="text-sm"
              />
            </div>
          )}

          {/* Proposal one-liner */}
          {!hideBodyText && textPreview && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{textPreview}</p>
          )}

          {/* Main document card — full-bleed on mobile (pulled out of the
              avatar-rail indent), indented under the action text on tablet+. */}
          <div className="mt-5 -ml-[42px] tablet:!ml-0">
            <DocumentPreviewCard
              title={title}
              href={href}
              imageSrc={previewImage}
              showPlaceholder={showThumbnail}
              authors={isReviewOfProposal ? [] : documentInfo.authors}
              institution={documentInfo.institution}
              score={documentInfo.reviewScore}
              stats={mainStats}
              voteCount={entry.metrics?.adjustedScore ?? entry.metrics?.votes ?? 0}
              userVote={entry.userVote}
              progress={
                fundraise && fundraise.goalUsd > 0
                  ? fundraise.raisedUsd / fundraise.goalUsd
                  : undefined
              }
              action={
                documentInfo.ctaHref ? (
                  <Button
                    variant="primary"
                    buttonSize="small"
                    onClick={() => router.push(documentInfo.ctaHref!)}
                    className="rounded-md border border-white/40"
                  >
                    {documentInfo.ctaLabel}
                    <ArrowRight size={14} aria-hidden />
                  </Button>
                ) : undefined
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
