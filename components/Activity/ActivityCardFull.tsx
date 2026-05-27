'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { ContributionAmount } from '@/components/Funding/ContributionAmount';
import { FeedEntryIcon } from '@/components/Funding/FeedEntryIcon';
import { GrantFundingAmount } from '@/components/Funding/GrantFundingAmount';
import {
  getActionIcon,
  getActionLabel,
  getCommentPreview,
  getContribution,
  getEntryMeta,
  getGrantAmount,
  getReviewScore,
} from '@/components/Funding/lib/feedEntryAdapters';
import { formatTimeAgo } from '@/utils/date';
import type { FeedEntry } from '@/types/feed';

interface ActivityCardFullProps {
  entry: FeedEntry;
}

export const ActivityCardFull: FC<ActivityCardFullProps> = ({ entry }) => {
  const { title, author, href } = getEntryMeta(entry);
  const [reviewExpanded, setReviewExpanded] = useState(false);

  if (!title) return null;

  const actionLabel = getActionLabel(entry);
  const actionIcon = getActionIcon(entry);
  const reviewScore = getReviewScore(entry);
  const grantAmount = getGrantAmount(entry);
  const contribution = getContribution(entry);
  const commentPreview = getCommentPreview(entry);

  const titleEl = href ? (
    <Link href={href} className="text-primary-600 hover:text-primary-800">
      {title}
    </Link>
  ) : (
    <span className="text-gray-500">{title}</span>
  );

  return (
    <div className="py-4 border-b border-gray-100 last:border-b-0">
      <div className="grid grid-cols-[auto_1fr] gap-x-2.5 items-start">
        <div className="row-span-2 pt-0.5">
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
        <div className="flex flex-wrap items-center gap-x-1.5 text-sm leading-tight mb-1">
          <span className="font-medium text-gray-900">{author?.fullName || 'Unknown'}</span>
          <span className="text-gray-500">{actionLabel}</span>
          <FeedEntryIcon name={actionIcon} />
          {reviewScore != null && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-600 align-middle">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              {reviewScore.toFixed(1)}
            </span>
          )}
          {grantAmount && <GrantFundingAmount amount={grantAmount} />}
          {contribution && (
            <ContributionAmount contribution={contribution} className="text-gray-900" />
          )}
        </div>
        <span className="text-sm leading-tight">{titleEl}</span>
      </div>

      {commentPreview && !commentPreview.isReview && (
        <div className="mt-2 ml-[42px]">
          <CommentReadOnly
            content={commentPreview.content}
            contentFormat={commentPreview.format}
            maxLength={250}
            showReadMoreButton={true}
            className="text-sm"
          />
        </div>
      )}

      {commentPreview && commentPreview.isReview && (
        <div className="mt-2 ml-[42px]">
          <button
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer inline-flex items-center gap-0.5"
            onClick={() => setReviewExpanded((open) => !open)}
          >
            {reviewExpanded ? 'Hide review' : 'Read review'}
            {reviewExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {reviewExpanded && (
            <div className="mt-2">
              <CommentReadOnly
                content={commentPreview.content}
                contentFormat={commentPreview.format}
                initiallyExpanded={true}
                showReadMoreButton={false}
                className="text-sm"
              />
            </div>
          )}
        </div>
      )}

      <span className="block text-xs text-gray-400 mt-1 ml-[42px]">
        {formatTimeAgo(entry.timestamp)}
      </span>
    </div>
  );
};
