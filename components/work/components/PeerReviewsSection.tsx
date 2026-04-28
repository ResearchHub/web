'use client';

import { FC, useMemo, useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { SidebarHeader } from '@/components/ui/SidebarHeader';
import { PeerReview } from '@/types/work';
import { Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PeerReviewsSectionProps {
  peerReviews: PeerReview[];
  reviewsUrl: string;
}

export const PeerReviewsSection: FC<PeerReviewsSectionProps> = ({ peerReviews, reviewsUrl }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const assessedReviews = useMemo(() => peerReviews.filter((r) => r.isAssessed), [peerReviews]);

  if (assessedReviews.length === 0) return null;

  const displayLimit = 5;
  const displayed = isExpanded ? assessedReviews : assessedReviews.slice(0, displayLimit);
  const hasMore = assessedReviews.length > displayLimit;

  return (
    <div>
      <SidebarHeader title="Peer Reviews" className="mb-3" />

      <div className="space-y-4">
        {displayed.map((review) => {
          const { authorProfile } = review.createdBy;
          return (
            <div key={review.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar
                    src={authorProfile.profileImage}
                    alt={authorProfile.fullName}
                    size="xs"
                    authorId={authorProfile.id}
                  />
                  <Link
                    href={reviewsUrl}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate"
                  >
                    {authorProfile.fullName}
                  </Link>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < review.score
                          ? 'fill-amber-500 text-amber-500'
                          : 'fill-none text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-400 ml-8 mt-0.5">
                {formatDistanceToNow(new Date(review.createdDate), { addSuffix: true })}
              </p>
            </div>
          );
        })}
      </div>

      {hasMore && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-3 w-full text-center"
        >
          View all ({assessedReviews.length})
        </button>
      )}
    </div>
  );
};
