'use client';

import { FC, useState } from 'react';
import { ArrowDown, ArrowUp, Share } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import { faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/utils/styles';
import type { UserVoteType } from '@/types/reaction';

interface ActivityVoteActionsProps {
  /** Initial vote count shown beside the arrows. */
  voteCount?: number;
  /** Initial user vote, if any. */
  userVote?: UserVoteType;
  className?: string;
}

/**
 * Demo-only primary actions for activity cards — vote, save, and share —
 * styled after WorkPrimaryActions. Local UI state only; not wired to APIs.
 */
export const ActivityVoteActions: FC<ActivityVoteActionsProps> = ({
  voteCount = 0,
  userVote,
  className,
}) => {
  const [localVoteCount, setLocalVoteCount] = useState(voteCount);
  const [localUserVote, setLocalUserVote] = useState<UserVoteType | undefined>(userVote);
  const [isSaved, setIsSaved] = useState(false);

  const handleVote = (e: React.MouseEvent, direction: 'up' | 'down') => {
    e.preventDefault();
    e.stopPropagation();

    if (direction === 'up') {
      if (localUserVote === 'UPVOTE') {
        setLocalUserVote('NEUTRAL');
        setLocalVoteCount((count) => count - 1);
      } else if (localUserVote === 'DOWNVOTE') {
        setLocalUserVote('UPVOTE');
        setLocalVoteCount((count) => count + 2);
      } else {
        setLocalUserVote('UPVOTE');
        setLocalVoteCount((count) => count + 1);
      }
      return;
    }

    if (localUserVote === 'DOWNVOTE') {
      setLocalUserVote('NEUTRAL');
      setLocalVoteCount((count) => count + 1);
    } else if (localUserVote === 'UPVOTE') {
      setLocalUserVote('DOWNVOTE');
      setLocalVoteCount((count) => count - 2);
    } else {
      setLocalUserVote('DOWNVOTE');
      setLocalVoteCount((count) => count - 1);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved((prev) => !prev);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => handleVote(e, 'up')}
          className={cn(
            'flex h-6 w-6 items-center justify-center transition-colors',
            localUserVote === 'UPVOTE' ? 'text-green-600' : 'text-gray-500 hover:text-gray-800'
          )}
          aria-label="Upvote"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        <span className="min-w-[1.1rem] text-center text-xs font-medium text-gray-700">
          {localVoteCount}
        </span>
        <button
          type="button"
          onClick={(e) => handleVote(e, 'down')}
          className={cn(
            'flex h-6 w-6 items-center justify-center transition-colors',
            localUserVote === 'DOWNVOTE' ? 'text-red-600' : 'text-gray-500 hover:text-gray-800'
          )}
          aria-label="Downvote"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={handleSave}
        className={cn(
          'flex h-6 w-6 items-center justify-center transition-colors',
          isSaved ? 'text-green-600' : 'text-gray-500 hover:text-gray-800'
        )}
        aria-label={isSaved ? 'Remove from list' : 'Save'}
      >
        <FontAwesomeIcon icon={isSaved ? faBookmarkSolid : faBookmark} className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={handleShare}
        className="flex h-6 w-6 items-center justify-center text-gray-500 transition-colors hover:text-gray-800"
        aria-label="Share"
      >
        <Share className="h-4 w-4" />
      </button>
    </div>
  );
};
