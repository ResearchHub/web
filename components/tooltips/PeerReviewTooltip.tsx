'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { Review } from '@/types/feed';
import { Avatar } from '@/components/ui/Avatar';
import Link from 'next/link';

interface PeerReviewTooltipProps {
  reviews: Review[];
  averageScore: number;
  href?: string;
}

const MAX_VISIBLE_REVIEWERS = 3;

export function PeerReviewTooltip({ reviews, averageScore, href }: PeerReviewTooltipProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const visibleReviews = reviews.slice(0, MAX_VISIBLE_REVIEWERS);

  return (
    <div className="space-y-3 text-left" onClick={handleClick}>
      {/* Header with average score */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
        <span className="font-semibold text-gray-900">Peer Reviews</span>
        <span className="ml-auto text-lg font-bold text-amber-600">{averageScore.toFixed(1)}</span>
      </div>

      {/* Reviewers list - show max 3 */}
      <div className="space-y-2">
        {visibleReviews.map((review) => (
          <div key={review.id} className="flex items-center gap-3">
            <Avatar
              src={review.author.profileImage}
              alt={review.author.fullName}
              size="sm"
              authorId={review.author.id}
              disableTooltip={true}
            />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate text-left">
                {review.author.fullName}
              </p>
              {review.author.headline && (
                <p className="text-xs text-gray-500 truncate text-left">{review.author.headline}</p>
              )}
            </div>
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full flex-shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-sm font-semibold text-amber-700">
                {review.score.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="pt-2 border-t border-gray-200 text-center">
        {href ? (
          <Link
            href={`${href}/reviews`}
            className="text-sm text-primary-600 hover:text-primary-700 cursor-pointer font-medium"
          >
            View all reviews
          </Link>
        ) : (
          <p className="text-sm text-primary-600 hover:text-primary-700 cursor-pointer font-medium">
            View all reviews
          </p>
        )}
      </div>
    </div>
  );
}
