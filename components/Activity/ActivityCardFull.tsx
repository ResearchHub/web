'use client';

import { FC, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Star, MessageCircle, Bell, Coins, ChevronDown, ChevronUp } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { ActivityEmbed, extractFirstEmbed } from '@/components/Activity/ActivityEmbed';
import { formatTimeAgo } from '@/utils/date';
import { buildWorkUrl } from '@/utils/url';
import { formatCurrency } from '@/utils/currency';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
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
  if (entry.contentType === 'USDFUNDRAISECONTRIBUTION' || entry.contentType === 'PURCHASE')
    return 'Funded Proposal';
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

  if (entry.contentType === 'USDFUNDRAISECONTRIBUTION' || entry.contentType === 'PURCHASE') {
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
  if (entry.contentType === 'USDFUNDRAISECONTRIBUTION' || entry.contentType === 'PURCHASE')
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

function getContribution(entry: FeedEntry): { amount: number; currency: string } | undefined {
  if (entry.contentType !== 'USDFUNDRAISECONTRIBUTION' && entry.contentType !== 'PURCHASE')
    return undefined;
  const post = entry.content as FeedPostContent;
  if (!post.fundraiseContribution?.amount) return undefined;
  return {
    amount: post.fundraiseContribution.amount,
    currency: post.fundraiseContribution.currency || 'USD',
  };
}

function getCommentContent(entry: FeedEntry) {
  if (entry.contentType !== 'COMMENT') return null;
  const commentContent = entry.content as FeedCommentContent;
  const { comment } = commentContent;
  if (!comment?.content) return null;
  const isReview = comment.commentType === 'REVIEW';
  const isAuthorUpdate = comment.commentType === 'AUTHOR_UPDATE';
  const embed = isAuthorUpdate
    ? extractFirstEmbed(
        typeof comment.content === 'string' ? comment.content : JSON.stringify(comment.content)
      )
    : null;
  return { content: comment.content, format: comment.contentFormat, isReview, embed };
}

function normalizeUrl(raw: string): string {
  return raw.replace(/[.,;:!?)\]]+$/, '').replace(/\/+$/, '');
}

const CommentTextWithLinkChip: FC<{ embedUrl?: string; children: React.ReactNode }> = ({
  embedUrl,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!embedUrl || !ref.current) return;
    const target = normalizeUrl(embedUrl);
    let host: string;
    try {
      host = new URL(embedUrl).hostname.replace(/^www\./, '');
    } catch {
      return;
    }

    const transform = () => {
      const anchors = ref.current?.querySelectorAll<HTMLAnchorElement>('a[href]');
      if (!anchors) return;
      anchors.forEach((a) => {
        if (a.dataset.chipped) return;
        const href = a.getAttribute('href') || '';
        if (normalizeUrl(href) !== target) return;
        a.dataset.chipped = '1';
        a.textContent = '';
        a.className =
          'inline-flex items-center gap-1 max-w-[240px] align-middle px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-xs text-gray-600 hover:bg-gray-100 no-underline';
        a.style.textDecoration = 'none';
        const span = document.createElement('span');
        span.className = 'truncate';
        span.textContent = host;
        a.appendChild(span);
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.setAttribute('class', 'w-3 h-3 shrink-0');
        svg.innerHTML =
          '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>';
        a.appendChild(svg);
      });
    };

    transform();
    const observer = new MutationObserver(transform);
    observer.observe(ref.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [embedUrl]);

  return <div ref={ref}>{children}</div>;
};

interface ActivityCardFullProps {
  entry: FeedEntry;
}

export const ActivityCardFull: FC<ActivityCardFullProps> = ({ entry }) => {
  const { title, author, href } = getEntryMeta(entry);
  const [reviewExpanded, setReviewExpanded] = useState(false);
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  if (!title) return null;

  const actionLabel = getActionLabel(entry);
  const actionIcon = getActionIcon(entry);
  const reviewScore = getReviewScore(entry);
  const fundingAmount = getFundingAmount(entry);
  const contribution = getContribution(entry);
  const commentData = getCommentContent(entry);

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
          {contribution && (
            <span className="ml-1.5 text-xs font-medium font-mono text-gray-900">
              +
              {formatCurrency({
                amount: contribution.amount,
                showUSD: contribution.currency === 'USD' ? true : showUSD,
                exchangeRate,
                skipConversion: contribution.currency === 'USD',
                shorten: true,
              })}
            </span>
          )}
        </span>
        <span className="text-sm leading-tight">{titleEl}</span>
      </div>

      {commentData && !commentData.isReview && (
        <div className="mt-2 ml-[42px]">
          <CommentTextWithLinkChip embedUrl={commentData.embed?.url}>
            <CommentReadOnly
              content={commentData.content}
              contentFormat={commentData.format}
              maxLength={250}
              showReadMoreButton={true}
              className="text-sm"
            />
          </CommentTextWithLinkChip>
          {commentData.embed && (
            <div className="mt-3">
              <ActivityEmbed embed={commentData.embed} />
            </div>
          )}
        </div>
      )}

      {commentData && commentData.isReview && (
        <div className="mt-2 ml-[42px]">
          <button
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer inline-flex items-center gap-0.5"
            onClick={() => setReviewExpanded(!reviewExpanded)}
          >
            {reviewExpanded ? 'Hide review' : 'Read review'}
            {reviewExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {reviewExpanded && (
            <div className="mt-2">
              <CommentReadOnly
                content={commentData.content}
                contentFormat={commentData.format}
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
