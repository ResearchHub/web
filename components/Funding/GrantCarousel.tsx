'use client';

import { FC, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { FeedEntry, FeedGrantContent } from '@/types/feed';
import { Carousel } from '@/components/ui/Carousel';
import { FundingProposalCard } from './FundingProposalCard';
import { ProposalCardSkeleton } from '@/components/skeletons/ProposalCardSkeleton';
import { cn } from '@/utils/styles';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { useFeed } from '@/hooks/useFeed';

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
  const grantHref = `/grant/${content.id}/${content.slug}`;

  const sectionRef = useRef<HTMLElement>(null);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { entries, isLoading, hasMore, loadMore } = useFeed(
    'all',
    hasBeenVisible
      ? {
          endpoint: 'funding_feed',
          contentType: 'PREREGISTRATION',
          grantId: grantData.id,
          ordering: 'best',
        }
      : {
          endpoint: 'funding_feed',
          contentType: 'PREREGISTRATION',
          initialData: { entries: [], hasMore: false },
        }
  );

  const showSkeleton = hasBeenVisible && isLoading && entries.length === 0;

  return (
    <section ref={sectionRef} className={cn('py-5', className)}>
      {/* Title + badge */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <Link href={grantHref} className="group">
          <h2 className="text-xl font-bold text-gray-900 group-hover:text-gray-600 transition-colors">
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
        {entries.length > 0 && (
          <>
            <span className="text-gray-300 text-[22px]">•</span>
            <span>
              <span className="font-mono">{entries.length}</span> proposals
            </span>
            <span className="ml-auto" />
            <Link
              href={grantHref}
              className="font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition-colors"
            >
              Submit a proposal <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </>
        )}
      </div>

      {/* Carousel of proposals */}
      <div className="mt-4">
        {showSkeleton ? (
          <div className="flex gap-4 py-3 px-3 -mx-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0 w-[240px] sm:w-[260px] md:w-[240px]">
                <ProposalCardSkeleton />
              </div>
            ))}
          </div>
        ) : entries.length > 0 ? (
          <Carousel onReachEnd={hasMore ? loadMore : undefined}>
            {entries.map((entry) => (
              <div key={entry.id} className="flex-shrink-0 w-[240px] sm:w-[260px] md:w-[240px]">
                <FundingProposalCard entry={entry} showActions={false} />
              </div>
            ))}
            {isLoading && (
              <div className="flex-shrink-0 w-[240px] sm:w-[260px] md:w-[240px]">
                <ProposalCardSkeleton />
              </div>
            )}
          </Carousel>
        ) : !isLoading ? (
          <div className="flex items-center justify-center py-6 rounded-lg border border-dashed border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-400">No proposals yet</p>
              <Link
                href={grantHref}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-1 inline-flex items-center gap-1 transition-colors"
              >
                Submit a proposal <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};
