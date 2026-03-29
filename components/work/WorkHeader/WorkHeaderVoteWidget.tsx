'use client';

import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/utils/styles';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';

export interface WorkHeaderVoteWidgetProps {
  voteCount: number;
  isVoting: boolean;
  isLoadingVotes: boolean;
  isUpvoted: boolean;
  isDownvoted: boolean;
  onVote: (direction: 'up' | 'down') => void;
  size?: 'sm' | 'lg';
}

export function WorkHeaderVoteWidget({
  voteCount,
  isVoting,
  isLoadingVotes,
  isUpvoted,
  isDownvoted,
  onVote,
  size = 'lg',
}: WorkHeaderVoteWidgetProps) {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const disabled = isVoting || isLoadingVotes;

  if (size === 'sm') {
    return (
      <div
        className={cn(
          'flex items-center rounded-lg border border-gray-200 bg-white',
          disabled && 'opacity-50'
        )}
      >
        <button
          onClick={() => executeAuthenticatedAction(() => onVote('up'))}
          disabled={disabled}
          className={cn(
            'px-2 py-1.5 rounded-l-lg transition-colors',
            isUpvoted ? 'text-green-600' : 'text-gray-400'
          )}
          aria-label="Upvote"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
        <span className="text-xs font-semibold text-gray-700 min-w-[1.25rem] text-center tabular-nums">
          {voteCount}
        </span>
        <button
          onClick={() => executeAuthenticatedAction(() => onVote('down'))}
          disabled={disabled}
          className={cn(
            'px-2 py-1.5 rounded-r-lg transition-colors',
            isDownvoted ? 'text-red-600' : 'text-gray-400'
          )}
          aria-label="Downvote"
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center rounded-lg bg-white border border-gray-200',
        disabled && 'opacity-50'
      )}
    >
      <button
        onClick={() => executeAuthenticatedAction(() => onVote('up'))}
        disabled={disabled}
        className={cn(
          'px-4 py-2.5 rounded-l-lg transition-colors',
          isUpvoted ? 'text-green-600 hover:bg-green-100' : 'text-gray-600 hover:bg-gray-100',
          disabled && 'cursor-not-allowed'
        )}
        aria-label="Upvote"
      >
        <ArrowUp className="h-6 w-6" />
      </button>
      <span className="text-sm font-medium text-gray-700 min-w-[2.25rem] text-center tabular-nums">
        {voteCount}
      </span>
      <button
        onClick={() => executeAuthenticatedAction(() => onVote('down'))}
        disabled={disabled}
        className={cn(
          'px-4 py-2.5 rounded-r-lg transition-colors',
          isDownvoted ? 'text-red-600 hover:bg-red-100' : 'text-gray-600 hover:bg-gray-100',
          disabled && 'cursor-not-allowed'
        )}
        aria-label="Downvote"
      >
        <ArrowDown className="h-6 w-6" />
      </button>
    </div>
  );
}
