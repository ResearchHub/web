'use client';

import { FC } from 'react';
import { Star, ArrowRight, CornerDownRight } from 'lucide-react';
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
  getFundraiseMetaLabel,
  getGrantAmount,
  getGrantMetaLabel,
  getPreviewImage,
  getQuotedGrant,
  getReviewOpportunity,
  getReviewScore,
  getTextPreview,
} from './lib/feedEntryAdapters';
import { formatTimeAgo } from '@/utils/date';
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
  const grantAmount = getGrantAmount(entry);
  const contribution = getContribution(entry);
  const commentPreview = getCommentPreview(entry);
  const documentInfo = getDocumentInfo(entry);
  const textPreview = getTextPreview(entry);
  const quotedGrant = getQuotedGrant(entry);
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

  // Contextual line beside the footer CTA.
  const cardMeta =
    documentInfo.typeLabel === 'Opportunity'
      ? getGrantMetaLabel(entry)
      : fundraise
        ? getFundraiseMetaLabel(entry)
        : null;

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
            {reviewScore != null && (
              <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                {reviewScore.toFixed(1)}
              </span>
            )}
            <FeedEntryIcon
              name={grantAmount || contribution || reviewScore != null ? null : actionIcon}
            />
            <span className="ml-auto pl-2 text-xs text-gray-400">
              {formatTimeAgo(entry.timestamp)}
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

          {/* Main document card */}
          <div className="mt-2">
            <DocumentPreviewCard
              title={title}
              href={href}
              imageSrc={previewImage}
              showPlaceholder={showThumbnail}
              authors={isReviewOfProposal ? [] : documentInfo.authors}
              institution={documentInfo.institution}
              score={documentInfo.reviewScore}
              stats={mainStats}
              meta={cardMeta}
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

      {/* Quoted parent: indented one rail so the org avatar sits under the
          proposal card's left edge. A corner-arrow icon in the caption marks
          it as referenced context. */}
      {quotedGrant && (
        <div className="mt-4 flex gap-2.5">
          <div className="w-8 flex-shrink-0" />

          <div className="flex min-w-0 flex-1 gap-2.5">
            {/* Reply arrow: left edge aligned with the proposal card's left
                edge, vertically centered on the org avatar. */}
            <div className="flex h-7 flex-shrink-0 items-center">
              <CornerDownRight size={16} className="text-gray-400" aria-hidden />
            </div>

            <div className="flex w-8 flex-shrink-0 flex-col items-center">
              {quotedGrant.imageSrc ? (
                <Avatar
                  src={quotedGrant.imageSrc}
                  alt={quotedGrant.organization}
                  size={28}
                  disableTooltip
                />
              ) : (
                <div className="mt-1 h-3 w-3 rounded-full border-2 border-gray-300 bg-white" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="pt-0.5 text-sm leading-tight text-gray-500">
                Applying to{' '}
                <span className="font-medium text-gray-900">{quotedGrant.organization}</span>
                's funding opportunity
              </div>

              <div className="mt-2.5">
                <DocumentPreviewCard
                  title={quotedGrant.title}
                  href={quotedGrant.href}
                  imageSrc={quotedGrant.imageSrc}
                  organization={quotedGrant.organization}
                  size="compact"
                  stats={[
                    { label: 'Proposals', value: String(quotedGrant.numApplicants) },
                    { label: 'Funding', value: quotedGrant.amountLabel, accent: true },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
