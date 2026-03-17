'use client';

import { FC, useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Star, MessageCircle, Bell } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { formatTimeAgo } from '@/utils/date';
import { buildWorkUrl } from '@/utils/url';
import { formatCurrency } from '@/utils/currency';
import { parseContent, extractTextFromTipTap } from '@/components/Comment/lib/commentContentUtils';
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

function getFundraiseContributionContent(entry: FeedEntry) {
  const rawContentType = entry.raw?.content_type?.toUpperCase();
  if (!rawContentType?.endsWith('FUNDRAISECONTRIBUTION')) {
    return undefined;
  }

  return entry.raw?.content_object as
    | {
        proposal_title?: string;
        proposal_slug?: string;
        unified_document_id?: number | string;
      }
    | undefined;
}

function getActionLabel(entry: FeedEntry): string {
  if (getFundraiseContributionContent(entry)) {
    return 'contributed to';
  }
  if (entry.contentType === 'COMMENT') {
    const comment = (entry.content as FeedCommentContent).comment;
    return COMMENT_ACTION_LABELS[comment?.commentType] || 'commented on';
  }
  if (entry.contentType === 'BOUNTY') return 'contributed to';
  return DOC_ACTION_LABELS[entry.contentType] || 'contributed';
}

function getEntryMeta(entry: FeedEntry) {
  const content = entry.content;
  const author = content.createdBy;
  const fundraiseContribution = getFundraiseContributionContent(entry);

  if (fundraiseContribution) {
    return {
      title: fundraiseContribution.proposal_title || (content as FeedPostContent).title,
      author,
      href: fundraiseContribution.unified_document_id
        ? buildWorkUrl({
            id: fundraiseContribution.unified_document_id,
            slug: fundraiseContribution.proposal_slug,
            contentType: 'preregistration',
          })
        : undefined,
    };
  }

  if (entry.contentType === 'COMMENT' || entry.contentType === 'BOUNTY') {
    const work = entry.relatedWork;
    return {
      title: work?.title,
      author,
      href: work
        ? buildWorkUrl({ id: work.id, slug: work.slug, contentType: work.contentType })
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

function getCommentPreview(entry: FeedEntry): string | undefined {
  if (entry.contentType !== 'COMMENT') return undefined;
  const comment = (entry.content as FeedCommentContent).comment;
  if (!comment?.content) return undefined;

  try {
    const parsed = parseContent(comment.content, 'TIPTAP');
    const text = extractTextFromTipTap(parsed).trim();
    return text.length > 120 ? text.slice(0, 120) + '...' : text;
  } catch {
    return undefined;
  }
}

function getFundingAmount(entry: FeedEntry): number | undefined {
  if (entry.contentType !== 'GRANT') return undefined;
  const grant = (entry.content as FeedGrantContent).grant;
  return grant?.amount?.usd || undefined;
}

function getActionIcon(entry: FeedEntry): React.ReactNode {
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

interface ActivityCardProps {
  entry: FeedEntry;
}

const EXPAND_LEFT = 200;
const PAD_Y = 12;
const HOVER_DELAY = 1000;
const MOUSE_MOVE_THRESHOLD = 3;

export const ActivityCard: FC<ActivityCardProps> = ({ entry }) => {
  const { title, author, href } = getEntryMeta(entry);
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({ display: 'none' });
  const [visible, setVisible] = useState(false);
  const overAvatar = useRef(false);
  const entryPos = useRef<{ x: number; y: number } | null>(null);
  const mouseMoved = useRef(false);

  useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);

  const showOverlay = useCallback((e: React.MouseEvent) => {
    if (overAvatar.current) return;
    entryPos.current = { x: e.clientX, y: e.clientY };
    mouseMoved.current = false;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      if (!mouseMoved.current) return;
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const sidebar = el.closest('[data-activity-sidebar]');
      const sidebarRect = sidebar?.getBoundingClientRect();
      const rightEdge = sidebarRect
        ? window.innerWidth - sidebarRect.right
        : window.innerWidth - rect.right;
      setOverlayStyle({
        position: 'fixed',
        top: rect.top - PAD_Y,
        right: rightEdge,
        width: rect.width + EXPAND_LEFT,
        zIndex: 9999,
      });
      setVisible(true);
    }, HOVER_DELAY);
  }, []);

  const onCardMouseMove = useCallback((e: React.MouseEvent) => {
    if (mouseMoved.current || !entryPos.current) return;
    const dx = e.clientX - entryPos.current.x;
    const dy = e.clientY - entryPos.current.y;
    if (Math.abs(dx) > MOUSE_MOVE_THRESHOLD || Math.abs(dy) > MOUSE_MOVE_THRESHOLD) {
      mouseMoved.current = true;
    }
  }, []);

  const hideOverlay = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    entryPos.current = null;
    mouseMoved.current = false;
    setVisible(false);
  }, []);

  if (!title) return null;

  const actionLabel = getActionLabel(entry);
  const actionIcon = getActionIcon(entry);
  const commentPreview = getCommentPreview(entry);
  const reviewScore = getReviewScore(entry);
  const fundingAmount = getFundingAmount(entry);

  const titleEl = href ? (
    <Link href={href} className="text-indigo-600 hover:text-indigo-800">
      {title}
    </Link>
  ) : (
    <span className="text-gray-500">{title}</span>
  );

  const headerBlock = (showTitle: boolean) => (
    <div className="grid grid-cols-[auto_1fr] gap-x-2.5 items-start">
      <div
        className="row-span-3 pt-0.5"
        onMouseEnter={() => {
          overAvatar.current = true;
          if (hoverTimer.current) {
            clearTimeout(hoverTimer.current);
            hoverTimer.current = null;
          }
          setVisible(false);
        }}
        onMouseLeave={() => {
          overAvatar.current = false;
        }}
      >
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
      </span>
      {showTitle && <span className="text-sm leading-tight line-clamp-2">{titleEl}</span>}
    </div>
  );

  return (
    <div
      ref={cardRef}
      className="py-3 first:pt-0 last:pb-0"
      onMouseEnter={showOverlay}
      onMouseMove={onCardMouseMove}
      onMouseLeave={hideOverlay}
    >
      {headerBlock(true)}
      <span className="block text-xs text-gray-400 mt-1 ml-[42px]">
        {formatTimeAgo(entry.timestamp)}
      </span>

      {visible && (
        <div style={overlayStyle} onMouseEnter={() => setVisible(true)} onMouseLeave={hideOverlay}>
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 animate-in fade-in zoom-in-95 duration-150">
            {headerBlock(true)}

            {commentPreview && (
              <p className="text-xs text-gray-500 leading-relaxed mt-1.5 ml-[42px] line-clamp-4">
                {commentPreview}
              </p>
            )}

            <p className="text-xs text-gray-400 mt-1 ml-[42px]">{formatTimeAgo(entry.timestamp)}</p>
          </div>
        </div>
      )}
    </div>
  );
};
