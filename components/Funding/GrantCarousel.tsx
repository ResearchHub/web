'use client';

import { FC, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { FeedEntry, FeedGrantContent } from '@/types/feed';
import { Carousel } from '@/components/ui/Carousel';
import { FundingProposalCard } from './FundingProposalCard';
import { ProposalCardSkeleton } from '@/components/skeletons/ProposalCardSkeleton';
import { cn } from '@/utils/styles';
import { ArrowRight, RefreshCw, UserPlus } from 'lucide-react';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { useFeed } from '@/hooks/useFeed';
interface GrantCarouselProps {
  grant: FeedEntry;
  className?: string;
  isClosed?: boolean;
  isDashboard?: boolean;
  onInviteExperts?: () => void;
}

export function getShortTitle(title: string): string {
  return title.replace(/^Request for Proposals\s*[-–—:]\s*/i, '');
}

function formatCompactUSD(usd: number): string {
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  if (usd >= 1_000) return `$${(usd / 1_000).toFixed(0)}K`;
  return `$${Math.round(usd).toLocaleString()}`;
}

export const GrantCarousel: FC<GrantCarouselProps> = ({
  grant,
  className,
  isClosed,
  isDashboard,
  onInviteExperts,
}) => {
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

  const hasFetchedProposals = hasBeenVisible && (entries.length > 0 || !isLoading);
  const showSkeleton = !hasFetchedProposals;

  return (
    <section ref={sectionRef} className={cn('py-5', className)}>
      {/* Title + badge */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <Link href={grantHref} className="group">
          <h2 className="text-xl font-bold text-gray-900 group-hover:underline">
            {getShortTitle(content.title)}
          </h2>
        </Link>
        {grantData.amount?.usd && (
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold font-mono',
              isClosed
                ? 'bg-gray-50 border border-gray-200 text-gray-500'
                : 'bg-green-50 border border-green-200 text-green-700'
            )}
          >
            {formatCompactUSD(grantData.amount.usd)} pool
          </span>
        )}
      </div>

      {/* Metadata row */}
      <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-600 flex-wrap">
        {(grantData.organization || content.createdBy?.fullName) && (
          <>
            <span>{grantData.organization || content.createdBy.fullName}</span>
            <span className="text-gray-300 text-[22px]">•</span>
          </>
        )}
        {isClosed ? (
          <span className="flex items-center gap-1.5 text-gray-500">
            <RadiatingDot color="bg-gray-400" isRadiating={false} />
            Closed
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            Rolling fund
          </span>
        )}
        {entries.length > 0 && (
          <>
            <span className="text-gray-300 text-[22px]">•</span>
            <span>
              <span className="font-mono">{entries.length}</span> proposals
            </span>
          </>
        )}
        <span className="ml-auto" />
        {!isClosed &&
          entries.length > 0 &&
          (isDashboard ? (
            <button
              onClick={onInviteExperts}
              className="font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Invite experts
            </button>
          ) : (
            <Link
              href={grantHref}
              className="font-medium text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              Learn more <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ))}
      </div>

      {/* Carousel of proposals */}
      <div className="mt-4">
        {showSkeleton ? (
          <div className="flex gap-4 py-3 px-3 -mx-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0 w-[260px] sm:w-[280px]">
                <ProposalCardSkeleton />
              </div>
            ))}
          </div>
        ) : entries.length > 0 ? (
          <Carousel onReachEnd={hasMore ? loadMore : undefined}>
            {entries.map((entry) => (
              <div key={entry.id} className="flex-shrink-0 w-[260px] sm:w-[280px]">
                <FundingProposalCard entry={entry} showActions={true} />
              </div>
            ))}
            {isLoading && (
              <div className="flex-shrink-0 w-[260px] sm:w-[280px]">
                <ProposalCardSkeleton />
              </div>
            )}
          </Carousel>
        ) : isDashboard ? (
          <div className="flex items-center justify-center py-8 rounded-lg border border-dashed border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                No proposals yet — get started by inviting experts
              </p>
              <button
                onClick={onInviteExperts}
                className="inline-flex items-center gap-2 px-4 py-2 mt-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                Invite experts
              </button>
            </div>
          </div>
        ) : (
          <Link
            href={grantHref}
            className="flex items-center justify-center py-8 rounded-lg border border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <div className="text-center">
              <p className="text-sm text-gray-400">No proposals yet</p>
              <span className="text-sm font-medium text-blue-600 mt-1 inline-flex items-center gap-1">
                Learn more <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
};
