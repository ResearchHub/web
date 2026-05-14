'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { PeerReviewModal } from '@/components/modals/PeerReviewModal';
import { formatTimestamp } from '@/utils/date';
import { cn } from '@/utils/styles';
import type { PostCardReview } from '../lib/postCard';

interface ReviewPostCardProps {
  data: PostCardReview;
  /**
   * When true (and `data.relatedWork` is set), renders a small "From: <title>"
   * link pointing to the reviewed document. Off by default so the
   * document-scoped surfaces don't duplicate context the viewer already has.
   */
  showRelatedWork?: boolean;
  /**
   * When true, renders a small "Peer review" badge in the top-right of the
   * card so the viewer can tell review cards apart from post cards at a
   * glance. Intended for mixed feeds (e.g. the funder dashboard) — surfaces
   * that only show one variant can leave this off.
   */
  showTypeBadge?: boolean;
  className?: string;
}

/**
 * Renders a 1–5 star row. No numeric score on purpose — the stars are the
 * scale on the card; the precise score still shows in `PeerReviewModal`.
 */
const ScoreStars: FC<{ score: number }> = ({ score }) => {
  const rounded = Math.round(score);
  return (
    <div className="flex items-center gap-0.5" aria-label={`Score: ${score.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={cn(
            i <= rounded ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
          )}
        />
      ))}
    </div>
  );
};

const PeerReviewBadge: FC = () => (
  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
    <Star size={10} className="fill-amber-400 text-amber-400" />
    Peer review
  </span>
);

/**
 * Pure "peer review" card: reviewer header + stars + snippet with a
 * "Read more" affordance that opens the full review body in
 * `PeerReviewModal`. Same outer shape as `EmbeddedPostCard` so they sit
 * comfortably side-by-side in the same carousel.
 */
export const ReviewPostCard: FC<ReviewPostCardProps> = ({
  data,
  showRelatedWork = false,
  showTypeBadge = false,
  className,
}) => {
  const { author, createdDate, snippet, score, relatedWork, reviewContent, reviewContentFormat } =
    data;
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const authorLabel = author.fullName || 'Reviewer';
  const dateLabel = formatTimestamp(createdDate, false);

  return (
    <>
      <article
        className={cn(
          'flex h-full flex-col rounded-xl border border-gray-200 bg-white p-3',
          className
        )}
      >
        <header className="flex min-w-0 items-center gap-2">
          <Avatar
            src={author.profileImage}
            alt={authorLabel}
            size="xs"
            authorId={author.authorProfileId}
          />
          <span className="truncate text-sm font-medium text-gray-900">{authorLabel}</span>
          <span className="shrink-0 whitespace-nowrap text-xs text-gray-500">· {dateLabel}</span>
          {showTypeBadge && (
            <div className="ml-auto">
              <PeerReviewBadge />
            </div>
          )}
        </header>

        {score != null && (
          <div className="mt-2">
            <ScoreStars score={score} />
          </div>
        )}

        <div className="mt-2 flex-1">
          {snippet && (
            <p className="m-0 line-clamp-4 text-sm leading-snug text-gray-700">{snippet}</p>
          )}
          {/*
            Mirrors the "Read more" affordance used by CommentReadOnly (same
            color, weight, size). Clicking opens the full review in
            PeerReviewModal instead of expanding inline — the card has no
            room to grow.
          */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsReviewModalOpen(true);
            }}
            className={cn(
              'inline-flex cursor-pointer items-center text-[14px] text-blue-600 hover:text-blue-800 hover:underline',
              snippet && 'mt-1'
            )}
          >
            Read more
          </button>
        </div>

        {showRelatedWork && relatedWork && (
          <Link
            href={relatedWork.href}
            className="mt-2 block truncate text-xs text-gray-500 hover:text-gray-700 hover:underline"
            title={relatedWork.title}
          >
            From: <span className="font-medium text-gray-700">{relatedWork.title}</span>
          </Link>
        )}
      </article>

      <PeerReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        reviewer={{
          id: author.authorProfileId,
          fullName: author.fullName,
          profileImage: author.profileImage,
        }}
        score={score}
        content={reviewContent}
        contentFormat={reviewContentFormat}
        workTitle={relatedWork?.title}
      />
    </>
  );
};
