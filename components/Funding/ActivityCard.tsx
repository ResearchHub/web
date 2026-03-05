'use client';

import { FC, useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { formatTimeAgo } from '@/utils/date';
import { buildWorkUrl } from '@/utils/url';
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
  GRANT: 'opened funding opportunity',
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
  return DOC_ACTION_LABELS[entry.contentType] || 'contributed';
}

function getEntryMeta(entry: FeedEntry) {
  const content = entry.content;
  const author = content.createdBy;

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

function getReviewScore(entry: FeedEntry): number | undefined {
  if (entry.contentType !== 'COMMENT') return undefined;
  const commentContent = entry.content as FeedCommentContent;
  if (commentContent.comment?.commentType !== 'REVIEW') return undefined;
  return commentContent.review?.score || commentContent.comment.reviewScore || undefined;
}

function ReviewStars({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={11}
          className={i <= score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      ))}
    </span>
  );
}

interface ActivityCardProps {
  entry: FeedEntry;
}

const EXPAND_LEFT = 200;
const PAD_Y = 12;

export const ActivityCard: FC<ActivityCardProps> = ({ entry }) => {
  const { title, author, href } = getEntryMeta(entry);
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({ display: 'none' });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);

  const showOverlay = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
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
    }, 500);
  }, []);

  const hideOverlay = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setVisible(false);
  }, []);

  if (!title) return null;

  const actionLabel = getActionLabel(entry);
  const commentPreview = getCommentPreview(entry);
  const reviewScore = getReviewScore(entry);

  const titleEl = href ? (
    <Link href={href} className="text-indigo-600 hover:text-indigo-800">
      {title}
    </Link>
  ) : (
    <span className="text-gray-500">{title}</span>
  );

  const inlineAvatar = (
    <span className="inline-block align-middle mr-1.5">
      <Avatar
        src={author?.profileImage}
        alt={author?.fullName || 'User'}
        size={20}
        authorId={author?.id}
        disableTooltip
      />
    </span>
  );

  return (
    <div
      ref={cardRef}
      className="py-3 first:pt-0 last:pb-0"
      onMouseEnter={showOverlay}
      onMouseLeave={hideOverlay}
    >
      <span className="block text-sm leading-snug line-clamp-2">
        {inlineAvatar}
        <span className="font-medium text-gray-900">{author?.fullName || 'Unknown'}</span>{' '}
        <span className="text-gray-600">{actionLabel}</span> {titleEl}
      </span>
      <span className="block text-xs text-gray-400 mt-0.5">{formatTimeAgo(entry.timestamp)}</span>

      {/* Fixed overlay -- escapes all overflow clipping */}
      {visible && (
        <div style={overlayStyle} onMouseEnter={() => setVisible(true)} onMouseLeave={hideOverlay}>
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 animate-in fade-in zoom-in-95 duration-150">
            <span className="block text-sm leading-snug">
              {inlineAvatar}
              <span className="font-medium text-gray-900">
                {author?.fullName || 'Unknown'}
              </span>{' '}
              <span className="text-gray-600">{actionLabel}</span> {titleEl}
            </span>

            {reviewScore && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <ReviewStars score={reviewScore} />
                <span className="text-xs text-gray-500">{reviewScore}/5</span>
              </div>
            )}

            {commentPreview && (
              <p className="text-xs text-gray-500 leading-relaxed mt-1.5 line-clamp-4">
                {commentPreview}
              </p>
            )}

            <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(entry.timestamp)}</p>
          </div>
        </div>
      )}
    </div>
  );
};
