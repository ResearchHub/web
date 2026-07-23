'use client';

import { FC, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Quote } from 'lucide-react';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { CommentDetailsModal } from '@/components/modals/CommentDetailsModal';
import { cn } from '@/utils/styles';
import type { FeedCommentPreview } from '../lib/feedEntryAdapters';

const PREVIEW_MAX_HEIGHT_PX = 120;

interface ActivityCommentSlotProps {
  commentPreview: FeedCommentPreview;
  isReview?: boolean;
  reviewScore?: number;
  workTitle?: string;
  workHref?: string;
  createdDate?: string;
  updatedDate?: string;
}

export const ActivityCommentSlot: FC<ActivityCommentSlotProps> = ({
  commentPreview,
  isReview = false,
  reviewScore,
  workTitle,
  workHref,
  createdDate,
  updatedDate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const measureOverflow = useCallback(() => {
    const el = previewRef.current;
    if (!el) return;
    setIsOverflowing(el.scrollHeight > PREVIEW_MAX_HEIGHT_PX + 1);
  }, []);

  useLayoutEffect(() => {
    measureOverflow();
    const el = previewRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(measureOverflow);
    observer.observe(el);
    return () => observer.disconnect();
  }, [commentPreview.content, commentPreview.format, measureOverflow]);

  const openModal = () => {
    if (!isOverflowing) return;
    setIsModalOpen(true);
  };

  return (
    <>
      <figure className="mt-3">
        <blockquote
          className={cn(
            'relative rounded-sm border border-gray-300 px-3',
            isOverflowing && 'cursor-pointer hover:border-gray-400 transition-colors'
          )}
          onClick={openModal}
          onKeyDown={
            isOverflowing
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsModalOpen(true);
                  }
                }
              : undefined
          }
          role={isOverflowing ? 'button' : undefined}
          tabIndex={isOverflowing ? 0 : undefined}
          aria-label={
            isOverflowing ? (isReview ? 'View full review' : 'View full comment') : undefined
          }
        >
          <Quote
            size={15}
            strokeWidth={1.75}
            className="absolute left-3 -top-[0.55rem] z-[1] bg-white px-0.5 text-gray-400 pointer-events-none"
            aria-hidden
          />
          <Quote
            size={15}
            strokeWidth={1.75}
            className="absolute right-3 -bottom-[0.55rem] z-[1] rotate-180 bg-white px-0.5 text-gray-400 pointer-events-none"
            aria-hidden
          />

          <div className="relative">
            <div
              ref={previewRef}
              className={cn('text-sm text-gray-600', isOverflowing && 'overflow-hidden')}
              style={isOverflowing ? { maxHeight: PREVIEW_MAX_HEIGHT_PX } : undefined}
            >
              <CommentReadOnly
                content={commentPreview.content}
                contentFormat={commentPreview.format}
                maxLength={100_000}
                showReadMoreButton={false}
                createdDate={createdDate}
                updatedDate={updatedDate}
                className="text-sm text-gray-600 [&_.tiptap-paragraph]:!text-sm"
              />
            </div>

            {isOverflowing && (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white via-white/85 to-transparent"
                aria-hidden
              />
            )}
          </div>
        </blockquote>
      </figure>

      <CommentDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        content={commentPreview.content}
        contentFormat={commentPreview.format}
        isReview={isReview}
        reviewScore={reviewScore}
        workTitle={workTitle}
        workHref={workHref}
        createdDate={createdDate}
        updatedDate={updatedDate}
      />
    </>
  );
};
