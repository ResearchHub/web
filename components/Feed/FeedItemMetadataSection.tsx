'use client';

import { FC } from 'react';
import { Bounty } from '@/types/bounty';
import { Review } from '@/types/feed';
import Link from 'next/link';
import Icon from '@/components/ui/icons/Icon';
import { RSCBadge } from '@/components/ui/RSCBadge';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Tooltip } from '@/components/ui/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

interface FeedItemMetadataSectionProps {
  id: number;
  slug: string;
  bounties?: Bounty[];
  reviews?: Review[];
  contentType: 'paper' | 'post' | 'fundraise';
}

/**
 * A shared component for displaying bounties and reviews
 * that can be used across different feed item types
 */
export const FeedItemMetadataSection: FC<FeedItemMetadataSectionProps> = ({
  id,
  slug,
  bounties,
  reviews,
  contentType,
}) => {
  // Generate the base URL based on content type
  const baseUrl =
    contentType === 'paper'
      ? `/paper/${id}/${slug}`
      : contentType === 'post'
        ? `/post/${id}/${slug}`
        : `/fund/${id}/${slug}`;

  // Check if content has open bounties
  const hasOpenBounties = bounties && bounties.filter((b) => b.status === 'OPEN').length > 0;

  // Check if content has reviews
  const hasReviews = reviews && reviews.length > 0;

  // Format score to show as whole number instead of decimal
  const formatScore = (score: number): string => {
    return Math.round(score).toString();
  };

  if (!hasOpenBounties && !hasReviews) {
    return null;
  }

  return (
    <div className="flex flex-col tablet:!flex-row gap-4 mt-4">
      {/* Bounty section */}
      {hasOpenBounties ? (
        <div className="w-full tablet:max-w-[300px] tablet:w-1/2">
          <Link
            href={`${baseUrl}/bounties`}
            onClick={(e) => e.stopPropagation()}
            className="block w-full h-full"
          >
            <div className="flex items-center justify-between bg-yellow-50 hover:bg-yellow-100 p-3 rounded-lg transition-colors duration-150 h-full w-full max-h-[45px]  ">
              <div className="flex items-center space-x-2">
                <Icon name="solidEarn" size={18} className="text-amber-600" color="#F59E0B" />
                <span className="text-sm text-gray-600">Bounty Available:</span>
              </div>

              {(() => {
                const firstOpenBounty = bounties!.find((b) => b.status === 'OPEN');
                const amountAsNumber = parseFloat(firstOpenBounty?.totalAmount || '0');

                return (
                  <RSCBadge
                    amount={amountAsNumber}
                    size="xs"
                    variant="inline"
                    className="font-semibold"
                    textColor="text-amber-600"
                    rscLabelColor="text-amber-600"
                    shorten={true}
                  />
                );
              })()}
            </div>
          </Link>
        </div>
      ) : (
        <div className="w-full tablet:w-1/2"></div>
      )}

      {/* Reviews section */}
      {hasReviews ? (
        <div className="w-full tablet:max-w-[300px] tablet:w-1/2">
          <Link
            href={`${baseUrl}/reviews`}
            onClick={(e) => e.stopPropagation()}
            className="block w-full h-full"
          >
            <div className="flex items-center justify-between bg-blue-50 hover:bg-blue-100 p-3 rounded-lg transition-colors duration-150 h-full max-h-[45px]">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faStar} className="text-blue-600" size="sm" />
                <span className="text-sm text-gray-600">Peer Reviews:</span>
              </div>

              <div className="flex items-center gap-3">
                {/* Review scores */}
                <div className="flex items-center">
                  {reviews!.slice(0, 2).map((review, index) => (
                    <div
                      key={index}
                      className="relative"
                      style={{ marginLeft: index > 0 ? '-8px' : '0' }}
                    >
                      <img
                        src={review.author.profileImage || '/images/default-avatar.png'}
                        alt={review.author.fullName || 'Reviewer'}
                        className="w-8 h-8 rounded-full border-2 border-white"
                      />
                      <div className="absolute -bottom-1 -left-1 h-5 w-5 bg-blue-500 text-white text-xs font-bold rounded-full px-1 py-0 flex items-center justify-center border-[1.5px] border-white">
                        <span className="text-[12px]">{formatScore(review.score)}</span>
                      </div>
                    </div>
                  ))}
                  {reviews!.length > 2 && (
                    <div className="relative ml-1">
                      <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600 font-medium">
                        +{reviews!.length - 2}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </div>
      ) : (
        <div className="w-full tablet:w-1/2"></div>
      )}
    </div>
  );
};
