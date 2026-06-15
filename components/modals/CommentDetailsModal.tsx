'use client';

import { FC } from 'react';
import Link from 'next/link';
import { MessageSquare, Star } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { ReviewScoreStars } from '@/components/Activity/ReviewScoreStars';
import type { ContentFormat } from '@/types/comment';
import type { CommentContent } from '@/components/Comment/lib/types';

interface CommentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: CommentContent;
  contentFormat?: ContentFormat;
  isReview?: boolean;
  reviewScore?: number;
  workTitle?: string;
  workHref?: string;
  createdDate?: string;
  updatedDate?: string;
}

export const CommentDetailsModal: FC<CommentDetailsModalProps> = ({
  isOpen,
  onClose,
  content,
  contentFormat,
  isReview = false,
  reviewScore,
  workTitle,
  workHref,
  createdDate,
  updatedDate,
}) => (
  <BaseModal
    isOpen={isOpen}
    onClose={onClose}
    size="lg"
    title={
      <div className="flex min-w-0 items-center gap-2 pr-6">
        {isReview ? (
          <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-700">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            Peer Review
          </div>
        ) : (
          <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-gray-700">
            <MessageSquare size={12} />
            Comment
          </div>
        )}
        {workTitle && workHref && (
          <Link
            href={workHref}
            onClick={onClose}
            className="min-w-0 truncate text-sm font-medium text-gray-900 hover:text-primary-600"
            title={workTitle}
          >
            {workTitle}
          </Link>
        )}
      </div>
    }
  >
    {isReview && reviewScore != null && reviewScore > 0 && (
      <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-4">
        <span className="shrink-0 text-xs uppercase tracking-wide text-gray-500">
          Overall Score
        </span>
        <div className="flex min-w-0 items-center gap-2">
          <ReviewScoreStars score={reviewScore} size="md" />
          <span className="text-sm font-semibold text-amber-700">{reviewScore.toFixed(1)}</span>
        </div>
      </div>
    )}
    <CommentReadOnly
      content={content}
      contentFormat={contentFormat}
      initiallyExpanded
      showReadMoreButton={false}
      createdDate={createdDate}
      updatedDate={updatedDate}
      className="text-sm leading-relaxed text-gray-800"
    />
  </BaseModal>
);
