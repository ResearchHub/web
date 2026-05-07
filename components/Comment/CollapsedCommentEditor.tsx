'use client';

import { Avatar } from '@/components/ui/Avatar';
import { useUser } from '@/contexts/UserContext';
import { PenLine, Star } from 'lucide-react';
import { CommentType } from '@/types/comment';

interface CollapsedCommentEditorProps {
  commentType?: CommentType;
  onExpand: () => void;
}

export const CollapsedCommentEditor = ({ commentType, onExpand }: CollapsedCommentEditorProps) => {
  const { user } = useUser();
  const authorProfile = user?.authorProfile;
  const isReview = commentType === 'REVIEW';
  const isAuthorUpdate = commentType === 'AUTHOR_UPDATE';
  const placeholder = isReview
    ? 'Write a peer review…'
    : isAuthorUpdate
      ? 'Post an update…'
      : 'Write a comment…';

  return (
    <button
      type="button"
      onClick={onExpand}
      className="group w-full flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/40 px-4 py-3 text-left transition-colors hover:border-blue-400 hover:bg-blue-50"
    >
      <Avatar
        src={authorProfile?.profileImage}
        alt={authorProfile?.fullName || 'You'}
        authorId={authorProfile?.id}
        size="sm"
        disableTooltip
      />
      <div className="flex flex-1 items-center gap-3 min-w-0">
        <span className="text-sm text-gray-600 group-hover:text-gray-800 truncate">
          {placeholder}
        </span>
        {isReview && (
          <div className="flex items-center gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="h-3.5 w-3.5 text-gray-300" />
            ))}
          </div>
        )}
      </div>
      <PenLine className="h-4 w-4 text-blue-500" />
    </button>
  );
};
