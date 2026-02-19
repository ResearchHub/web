'use client';

import { FC } from 'react';
import Link from 'next/link';
import { FeedEntry, FeedGrantContent, transformFundraiseToFeedEntry } from '@/types/feed';
import { Carousel } from '@/components/ui/Carousel';
import { FundingProposalCard } from './FundingProposalCard';
import { cn } from '@/utils/styles';

interface GrantCarouselProps {
  grant: FeedEntry;
  className?: string;
}

export const GrantCarousel: FC<GrantCarouselProps> = ({ grant, className }) => {
  const content = grant.content as FeedGrantContent;
  const grantData = content.grant;
  const fundraises = content.fundraises ?? [];
  const grantHref = `/grant/${content.id}/${content.slug}`;

  return (
    <section className={cn('space-y-3', className)}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-semibold text-gray-900 truncate">{content.title}</h2>
            {grantData.amount?.formatted && (
              <span className="flex-shrink-0 text-sm font-medium text-gray-500">
                {grantData.amount.formatted}
              </span>
            )}
          </div>
          {grantData.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{grantData.description}</p>
          )}
        </div>
        <Link
          href={grantHref}
          className="flex-shrink-0 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Apply
        </Link>
      </div>

      {/* Carousel of proposals */}
      {fundraises.length > 0 ? (
        <Carousel>
          {fundraises.map((fundraise) => (
            <div
              key={fundraise.postId ?? fundraise.id}
              className="flex-shrink-0 snap-start w-[280px] sm:w-[300px] md:w-[320px]"
            >
              <FundingProposalCard
                entry={transformFundraiseToFeedEntry(fundraise)}
                showActions={false}
              />
            </div>
          ))}
        </Carousel>
      ) : (
        <div className="flex items-center justify-center py-8 rounded-lg border border-dashed border-gray-300 bg-gray-50">
          <div className="text-center">
            <p className="text-sm text-gray-500">No proposals yet</p>
            <Link
              href={grantHref}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-1 inline-block"
            >
              Be the first to apply
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};
