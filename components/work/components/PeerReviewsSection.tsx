'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { SidebarHeader } from '@/components/ui/SidebarHeader';
import { PeerReview } from '@/types/work';
import { Star } from 'lucide-react';

interface PeerReviewsSectionProps {
  peerReviews: PeerReview[];
}

export const PeerReviewsSection: FC<PeerReviewsSectionProps> = ({ peerReviews }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (peerReviews.length === 0) return null;

  const displayLimit = 5;
  const displayed = isExpanded ? peerReviews : peerReviews.slice(0, displayLimit);
  const hasMore = peerReviews.length > displayLimit;

  return (
    <div>
      <SidebarHeader title="Peer Reviews" className="mb-3" />

      <div className="space-y-3">
        {displayed.map((review) => {
          const { authorProfile } = review.createdBy;
          return (
            <div key={review.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar
                  src={authorProfile.profileImage}
                  alt={authorProfile.fullName}
                  size="xs"
                  authorId={authorProfile.id}
                />
                <Link
                  href={`/author/${authorProfile.id}`}
                  className="text-sm font-medium text-gray-900 hover:text-blue-600"
                >
                  {authorProfile.fullName}
                </Link>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-amber-600">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>{review.score}</span>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-3 w-full text-center"
        >
          View all ({peerReviews.length})
        </button>
      )}
    </div>
  );
};
