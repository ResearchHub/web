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
      <div className={cn('flex items-center', disabled && 'opacity-50')}>
        <button
          onClick={() => executeAuthenticatedAction(() => onVote('up'))}
          disabled={disabled}
          className={cn(
            'px-2.5 py-1.5 rounded-l-lg transition-colors',
            isUpvoted ? 'text-green-600 hover:bg-green-100' : 'text-gray-600 hover:bg-gray-200'
          )}
          aria-label="Upvote"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-gray-700 min-w-[1.5rem] text-center tabular-nums">
          {voteCount}
        </span>
        <button
          onClick={() => executeAuthenticatedAction(() => onVote('down'))}
          disabled={disabled}
          className={cn(
            'px-2.5 py-1.5 rounded-r-lg transition-colors',
            isDownvoted ? 'text-red-600 hover:bg-red-100' : 'text-gray-600 hover:bg-gray-200'
          )}
          aria-label="Downvote"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center', disabled && 'opacity-50')}>
      <button
        onClick={() => executeAuthenticatedAction(() => onVote('up'))}
        disabled={disabled}
        className={cn(
          'p-1.5 rounded-md transition-colors',
          isUpvoted ? 'text-green-600 hover:bg-green-100' : 'text-gray-500 hover:bg-gray-100',
          disabled && 'cursor-not-allowed'
        )}
        aria-label="Upvote"
      >
        <ArrowUp className="h-7 w-7" strokeWidth={2.5} />
      </button>
      <span className="text-base font-bold text-gray-700 tabular-nums leading-none">
        {voteCount}
      </span>
      <button
        onClick={() => executeAuthenticatedAction(() => onVote('down'))}
        disabled={disabled}
        className={cn(
          'p-1.5 rounded-md transition-colors',
          isDownvoted ? 'text-red-600 hover:bg-red-100' : 'text-gray-500 hover:bg-gray-100',
          disabled && 'cursor-not-allowed'
        )}
        aria-label="Downvote"
      >
        <ArrowDown className="h-7 w-7" strokeWidth={2.5} />
      </button>
    </div>
  );
}
