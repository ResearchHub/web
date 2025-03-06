import { FC } from 'react';
import { CommentSkeleton } from '@/components/skeletons/CommentSkeleton';
import { CommentType } from '@/types/comment';

interface CommentLoaderProps {
  count?: number;
  commentType?: CommentType;
}

/**
 * CommentLoader component that displays skeleton loaders for comments
 * Used when comments are being loaded
 */
export const CommentLoader: FC<CommentLoaderProps> = ({
  count = 3,
  commentType = 'GENERIC_COMMENT',
}) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <CommentSkeleton key={index} commentType={commentType} />
      ))}
    </div>
  );
};
