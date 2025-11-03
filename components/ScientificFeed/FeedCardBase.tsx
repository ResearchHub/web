'use client';

import { ReactNode } from 'react';
import { cn } from '@/utils/styles';
import { ChevronUp, ChevronDown, MessageCircle, Bookmark } from 'lucide-react';

interface FeedCardBaseProps {
  children: ReactNode;
  upvotes: number;
  downvotes: number;
  comments: number;
  bookmarked: boolean;
  onUpvote?: () => void;
  onDownvote?: () => void;
  onComment?: () => void;
  onBookmark?: () => void;
  actions?: ReactNode;
  className?: string;
}

export function FeedCardBase({
  children,
  upvotes,
  downvotes,
  comments,
  bookmarked,
  onUpvote,
  onDownvote,
  onComment,
  onBookmark,
  actions,
  className,
}: FeedCardBaseProps) {
  const netVotes = upvotes - downvotes;

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors',
        className
      )}
    >
      {/* Card Content */}
      <div className="p-4 pb-0">{children}</div>

      {/* Actions Bar */}
      <div className="bg-gray-50 border-t border-gray-100 px-4 py-2.5 mt-4 flex items-center justify-between">
        {/* Left actions */}
        <div className="flex items-center gap-4">
          {/* Vote buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onUpvote}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              aria-label="Upvote"
            >
              <ChevronUp className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[2rem] text-center">
              {netVotes}
            </span>
            <button
              onClick={onDownvote}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              aria-label="Downvote"
            >
              <ChevronDown className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Comment button */}
          <button
            onClick={onComment}
            className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-200 rounded transition-colors"
            aria-label="Comment"
          >
            <MessageCircle className="w-5 h-5 text-gray-600" />
            {comments > 0 && <span className="text-sm text-gray-700">{comments}</span>}
          </button>

          {/* Bookmark button */}
          <button
            onClick={onBookmark}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            aria-label="Bookmark"
          >
            <Bookmark
              className={cn('w-5 h-5', bookmarked ? 'fill-gray-600 text-gray-600' : 'text-gray-600')}
            />
          </button>
        </div>

        {/* Right actions */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

