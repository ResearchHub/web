'use client';

import { FC } from 'react';
import Link from 'next/link';
import { FeedEntry, FeedGrantContent, transformFundraiseToFeedEntry } from '@/types/feed';
import { Carousel } from '@/components/ui/Carousel';
import { FundingProposalCard } from './FundingProposalCard';
import { cn } from '@/utils/styles';
import { ArrowRight, RefreshCw } from 'lucide-react';

interface GrantCarouselProps {
  grant: FeedEntry;
  className?: string;
}

function getShortTitle(title: string): string {
  return title.replace(/^Request for Proposals\s*[-–—:]\s*/i, '');
}

function formatCompactUSD(usd: number): string {
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  if (usd >= 1_000) return `$${(usd / 1_000).toFixed(0)}K`;
  return `$${Math.round(usd).toLocaleString()}`;
}

export const GrantCarousel: FC<GrantCarouselProps> = ({ grant, className }) => {
  const content = grant.content as FeedGrantContent;
  const grantData = content.grant;
  const fundraises = content.fundraises ?? [];
  const grantHref = `/grant/${content.id}/${content.slug}`;

  return (
    <section className={cn('py-5', className)}>
      {/* Title + badge */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <Link href={grantHref} className="group">
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-gray-600 transition-colors">
            {getShortTitle(content.title)}
          </h2>
        </Link>
        {grantData.amount?.usd && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-50 border border-green-200 text-xs font-bold text-green-700 font-mono">
            {formatCompactUSD(grantData.amount.usd)} pool
          </span>
        )}
      </div>

      {/* Metadata row */}
      <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-600 flex-wrap">
        {grantData.organization && (
          <>
            <span>{grantData.organization}</span>
            <span className="text-gray-300 text-[22px]">•</span>
          </>
        )}
        <span className="flex items-center gap-1">
          <RefreshCw className="h-3 w-3" />
          Rolling fund
        </span>
        <span className="text-gray-300 text-[22px]">•</span>
        <span>
          <span className="font-mono">{fundraises.length}</span> proposals
        </span>
        <span className="text-gray-300 text-[22px]">•</span>
        <Link
          href={grantHref}
          className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 inline-flex items-center gap-1 transition-colors"
        >
          Submit a proposal →
        </Link>
      </div>

      {/* Carousel of proposals */}
      <div className="mt-4">
        {fundraises.length > 0 ? (
          <Carousel>
            {fundraises.map((fundraise) => (
              <div
                key={fundraise.postId ?? fundraise.id}
                className="flex-shrink-0 w-[240px] sm:w-[260px] md:w-[240px]"
              >
                <FundingProposalCard
                  entry={transformFundraiseToFeedEntry(fundraise)}
                  showActions={false}
                />
              </div>
            ))}
          </Carousel>
        ) : (
          <div className="flex items-center justify-center py-6 rounded-lg border border-dashed border-gray-200 bg-gray-50">
            <div className="text-center">
              <p className="text-sm text-gray-400">No proposals yet</p>
              <Link
                href={grantHref}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-1 inline-block"
              >
                Be the first to apply
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
