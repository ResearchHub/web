'use client';

import { ReactNode } from 'react';
import { cn } from '@/utils/styles';
import { MessageCircle, Bookmark, Star, MoreHorizontal } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlask } from '@fortawesome/free-solid-svg-icons';
import { faUpLong, faDownLong } from '@fortawesome/pro-light-svg-icons';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Tooltip } from '@/components/ui/Tooltip';

interface FeedCardBaseProps {
  children: ReactNode;
  comments: number;
  bookmarked: boolean;
  peerReviewScore?: number;
  engagedUsers?: { id: number; name: string; avatar: string }[];
  upvotes?: number;
  peerReviewCount?: number;
  peerReviewAverage?: number;
  trendingScore?: number;
  trendingScoreTooltip?: ReactNode;
  showUpvoteButton?: boolean;
  onComment?: () => void;
  onBookmark?: () => void;
  onPeerReview?: () => void;
  actions?: ReactNode;
  className?: string;
}

export function FeedCardBase({
  children,
  comments,
  bookmarked,
  peerReviewScore,
  engagedUsers,
  upvotes,
  peerReviewCount,
  peerReviewAverage,
  trendingScore,
  trendingScoreTooltip,
  showUpvoteButton = false,
  onComment,
  onBookmark,
  onPeerReview,
  actions,
  className,
}: FeedCardBaseProps) {
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
      <div className="bg-gray-50 rounded-b-md border-t border-gray-100 px-4 py-2.5 mt-4 flex items-center justify-between">
        {/* Left actions */}
        <div className="flex items-center gap-4">
          {/* Comment button - COMMENTED OUT */}
          {/* <button
            onClick={onComment}
            className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Comment"
          >
            <MessageCircle className="w-5 h-5 text-gray-600" />
            {comments > 0 && <span className="text-sm text-gray-700">{comments}</span>}
          </button> */}

          {/* Peer Review button - COMMENTED OUT */}
          {/* {peerReviewScore !== undefined && (
            <button
              onClick={onPeerReview}
              className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Peer Review"
            >
              <Star className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {peerReviewScore.toFixed(1)}
              </span>
            </button>
          )} */}

          {/* Upvote/Downvote pill */}
          {showUpvoteButton && (
            <div className="flex items-center bg-white border border-gray-300 rounded-full overflow-hidden">
              <button
                className="flex items-center gap-1 px-2.5 py-2 hover:bg-gray-100 transition-colors"
                aria-label="Upvote"
              >
                <FontAwesomeIcon icon={faUpLong} className="w-4 h-4 text-gray-600" />
              </button>
              {upvotes !== undefined && upvotes > 0 && (
                <span className="text-sm font-medium text-gray-900 px-1">{upvotes}</span>
              )}
              <button
                className="flex items-center gap-1 px-2.5 py-2 hover:bg-gray-100 transition-colors"
                aria-label="Downvote"
              >
                <FontAwesomeIcon icon={faDownLong} className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}

          {/* Save button pill */}
          <button
            onClick={onBookmark}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Save"
          >
            <Bookmark
              className={cn(
                'w-4 h-4',
                bookmarked ? 'fill-gray-600 text-gray-600' : 'text-gray-600'
              )}
            />
            <span className="text-sm font-medium text-gray-700">Save</span>
          </button>

          {/* Trending Score - Right of Save */}
          {trendingScore && trendingScoreTooltip ? (
            <Tooltip content={trendingScoreTooltip} width="w-72" position="top">
              <div className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-700 cursor-help transition-colors">
                <FontAwesomeIcon icon={faFlask} className="w-5 h-5" />
                <span className="text-sm font-medium">{trendingScore}</span>
              </div>
            </Tooltip>
          ) : trendingScore ? (
            <div className="inline-flex items-center gap-1 text-gray-600">
              <FontAwesomeIcon icon={faFlask} className="w-5 h-5" />
              <span className="text-sm font-medium">{trendingScore}</span>
            </div>
          ) : null}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Engaged users - COMMENTED OUT */}
          {/* {engagedUsers && engagedUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <AvatarStack
                items={engagedUsers.map((user) => ({
                  src: user.avatar,
                  alt: user.name,
                  tooltip: user.name,
                }))}
                size="xs"
                maxItems={3}
                showExtraCount
                spacing={-6}
                extraCountLabel="engaged"
              />
            </div>
          )} */}

          {/* Ellipsis menu */}
          <button
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="More options"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>

          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
