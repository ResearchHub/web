'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Star, MessageCircle, Bell, Coins } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { formatTimeAgo } from '@/utils/date';
import { buildWorkUrl } from '@/utils/url';
import { formatCurrency } from '@/utils/currency';
import type {
  FeedEntry,
  FeedPostContent,
  FeedPaperContent,
  FeedGrantContent,
  FeedCommentContent,
} from '@/types/feed';
import type { ContentType } from '@/types/work';
import type { CommentType } from '@/types/comment';

const COMMENT_ACTION_LABELS: Record<CommentType, string> = {
  GENERIC_COMMENT: 'commented on',
  REVIEW: 'peer reviewed',
  AUTHOR_UPDATE: 'posted an update on',
  ANSWER: 'answered on',
  BOUNTY: 'contributed to',
};

const DOC_ACTION_LABELS: Record<string, string> = {
  GRANT: 'opened funding',
  PREREGISTRATION: 'submitted proposal',
  POST: 'posted discussion',
  PAPER: 'published preprint',
};

const CONTENT_TYPE_MAP: Record<string, ContentType> = {
  GRANT: 'funding_request',
  PREREGISTRATION: 'preregistration',
  POST: 'post',
  PAPER: 'paper',
};

function getActionLabel(entry: FeedEntry): string {
  if (entry.contentType === 'COMMENT') {
    const comment = (entry.content as FeedCommentContent).comment;
    return COMMENT_ACTION_LABELS[comment?.commentType] || 'commented on';
  }
  if (entry.contentType === 'BOUNTY') return 'contributed to';
  if (entry.contentType === 'USDFUNDRAISECONTRIBUTION') return 'Funded Proposal';
  return DOC_ACTION_LABELS[entry.contentType] || 'contributed';
}

function getEntryMeta(entry: FeedEntry) {
  const content = entry.content;
  const author = content.createdBy;

  if (entry.contentType === 'COMMENT' || entry.contentType === 'BOUNTY') {
    const work = entry.relatedWork;
    const isReview =
      entry.contentType === 'COMMENT' &&
      (content as FeedCommentContent).comment?.commentType === 'REVIEW';
    return {
      title: work?.title,
      author,
      href: work
        ? buildWorkUrl({
            id: work.id,
            slug: work.slug,
            contentType: work.contentType,
            tab: isReview ? 'reviews' : undefined,
          })
        : undefined,
    };
  }

  if (entry.contentType === 'USDFUNDRAISECONTRIBUTION') {
    const post = content as FeedPostContent;
    return {
      title: post.title,
      author,
      href: post.unifiedDocumentId
        ? buildWorkUrl({
            id: post.unifiedDocumentId,
            slug: post.slug,
            contentType: 'preregistration',
          })
        : undefined,
    };
  }

  const titled = content as FeedPostContent | FeedPaperContent | FeedGrantContent;
  return {
    title: titled.title,
    author,
    href: CONTENT_TYPE_MAP[entry.contentType]
      ? buildWorkUrl({
          id: titled.id,
          slug: titled.slug,
          contentType: CONTENT_TYPE_MAP[entry.contentType],
        })
      : undefined,
  };
}

function getFundingAmount(entry: FeedEntry): number | undefined {
  if (entry.contentType !== 'GRANT') return undefined;
  const grant = (entry.content as FeedGrantContent).grant;
  return grant?.amount?.usd || undefined;
}

function getActionIcon(entry: FeedEntry): React.ReactNode {
  if (entry.contentType === 'USDFUNDRAISECONTRIBUTION')
    return <Coins size={14} className="inline -mt-0.5 ml-1 text-gray-600" />;
  if (entry.contentType !== 'COMMENT') return null;
  const commentType = (entry.content as FeedCommentContent).comment?.commentType;
  if (commentType === 'AUTHOR_UPDATE')
    return <Bell size={14} className="inline -mt-0.5 ml-1 text-gray-600" />;
  if (commentType === 'GENERIC_COMMENT' || commentType === 'ANSWER')
    return <MessageCircle size={14} className="inline -mt-0.5 ml-1 text-gray-600" />;
  return null;
}

function getReviewScore(entry: FeedEntry): number | undefined {
  if (entry.contentType !== 'COMMENT') return undefined;
  const commentContent = entry.content as FeedCommentContent;
  if (commentContent.comment?.commentType !== 'REVIEW') return undefined;
  return commentContent.review?.score || commentContent.comment.reviewScore || undefined;
}

function getContributionAmount(entry: FeedEntry): number | undefined {
  if (entry.contentType !== 'USDFUNDRAISECONTRIBUTION') return undefined;
  const post = entry.content as FeedPostContent;
  return post.fundraiseContribution?.amount || undefined;
}

interface ActivityCardProps {
  entry: FeedEntry;
}

export const ActivityCard: FC<ActivityCardProps> = ({ entry }) => {
  const { title, author, href } = getEntryMeta(entry);

  if (!title) return null;

  const actionLabel = getActionLabel(entry);
  const actionIcon = getActionIcon(entry);
  const reviewScore = getReviewScore(entry);
  const fundingAmount = getFundingAmount(entry);
  const contributionAmount = getContributionAmount(entry);

  const titleEl = href ? (
    <Link href={href} className="text-indigo-600 hover:text-indigo-800">
      {title}
    </Link>
  ) : (
    <span className="text-gray-500">{title}</span>
  );

  const headerBlock = (showTitle: boolean) => (
    <div className="grid grid-cols-[auto_1fr] gap-x-2.5 items-start">
      <div className="row-span-3 pt-0.5">
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
      <span className="text-sm font-medium text-gray-900 leading-tight truncate">
        {author?.fullName || 'Unknown'}
      </span>
      <span className="text-sm leading-tight mb-1">
        <span className="text-gray-500">{actionLabel}</span>
        {actionIcon}
        {reviewScore && (
          <span className="inline-flex items-center gap-1 ml-1.5 text-xs text-gray-600 align-middle">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            {reviewScore.toFixed(1)}
          </span>
        )}
        {fundingAmount && (
          <span className="ml-1.5 text-xs font-medium text-gray-900">
            {formatCurrency({
              amount: fundingAmount,
              showUSD: true,
              exchangeRate: 1,
              skipConversion: true,
              shorten: true,
            })}
          </span>
        )}
        {contributionAmount != null && (
          <span className="ml-1.5 text-xs font-medium font-mono text-green-700">
            +
            {formatCurrency({
              amount: contributionAmount,
              showUSD: true,
              exchangeRate: 1,
              skipConversion: true,
              shorten: true,
            })}
          </span>
        )}
      </span>
      {showTitle && <span className="text-sm leading-tight line-clamp-2">{titleEl}</span>}
    </div>
  );

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      {headerBlock(true)}
      <span className="block text-xs text-gray-400 mt-1 ml-[42px]">
        {formatTimeAgo(entry.timestamp)}
      </span>
    </div>
  );
};
