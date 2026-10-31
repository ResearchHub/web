import { FC } from 'react';
import { ActivityCardSkeleton } from '@/components/Activity/cards/ActivityCardSkeleton';
import { CommentSkeleton } from '@/components/skeletons/CommentSkeleton';
import { CommentType } from '@/types/comment';
import type { CommentRowStyle } from './lib/commentRowStyle';

interface CommentLoaderProps {
  count?: number;
  commentType?: CommentType;
  /** `feed` uses the homepage feed's row skeleton, without its cover. */
  rowStyle?: CommentRowStyle;
}

/**
 * CommentLoader component that displays skeleton loaders for comments
 * Used when comments are being loaded
 */
export const CommentLoader: FC<CommentLoaderProps> = ({
  count = 3,
  commentType = 'GENERIC_COMMENT',
  rowStyle = 'card',
}) => {
  if (rowStyle === 'feed') {
    return (
      <div>
        {Array.from({ length: count }).map((_, index) => (
          <ActivityCardSkeleton key={index} showCover={false} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <CommentSkeleton key={index} commentType={commentType} />
      ))}
    </div>
  );
};
