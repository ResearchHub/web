'use client';

import { FC, useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, DollarSign, Calendar } from 'lucide-react';
import { cn } from '@/utils/styles';
import { formatDeadline } from '@/utils/date';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import type { Grant } from '@/types/grant';

interface OpportunityCarouselProps {
  grants: Grant[];
  selectedGrantId: number | null;
  onSelectGrant: (grantId: number | null) => void;
  fundraiseCounts: Record<number, number>;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────
const formatAmount = (amount: number) => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return amount.toLocaleString();
};

// ─── Opportunity Card ────────────────────────────────────────────────────
interface OpportunityCardProps {
  grant: Grant;
  isSelected: boolean;
  proposalCount: number;
  onSelect: () => void;
}

const OpportunityCard: FC<OpportunityCardProps> = ({
  grant,
  isSelected,
  proposalCount,
  onSelect,
}) => {
  const { showUSD } = useCurrencyPreference();

  const amount = showUSD
    ? `$${formatAmount(grant.amount.usd)}`
    : `${formatAmount(grant.amount.rsc)} RSC`;

  return (
    <div
      onClick={onSelect}
      className={cn(
        'flex-shrink-0 bg-white rounded-lg border overflow-hidden cursor-pointer',
        'transition-all duration-300 ease-in-out hover:shadow-sm',
        // Width: 100% when selected, ~50% when not
        isSelected ? 'w-full min-w-full' : 'w-[calc(50%-6px)] min-w-[240px]',
        isSelected
          ? 'border-primary-300 ring-1 ring-primary-100 bg-gradient-to-r from-primary-50 to-white'
          : 'border-gray-200 hover:border-gray-300'
      )}
    >
      <div className={cn('p-3', isSelected ? 'flex items-center gap-4' : '')}>
        {/* Compact layout when not selected */}
        {!isSelected ? (
          <>
            {/* Title */}
            <h3 className="font-medium text-sm text-gray-900 line-clamp-1 mb-1">{grant.title}</h3>
            <p className="text-xs text-gray-500 mb-2">{grant.organization}</p>

            {/* Stats row */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-green-600">{amount}</span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-500">{formatDeadline(grant.endDate)}</span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-400">{proposalCount} proposals</span>
            </div>
          </>
        ) : (
          /* Expanded layout when selected */
          <>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-medium text-primary-600 uppercase tracking-wide">
                  Filtering by
                </span>
                <span
                  className={cn(
                    'px-1.5 py-0.5 text-[10px] font-medium rounded',
                    grant.status === 'OPEN'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {grant.status === 'OPEN' ? 'Open' : grant.status}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{grant.title}</h3>
            </div>

            <div className="flex items-center gap-4 text-xs flex-shrink-0">
              <div className="flex items-center gap-1 text-green-600">
                <DollarSign size={12} />
                <span className="font-semibold">{amount}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Calendar size={12} />
                <span>{formatDeadline(grant.endDate)}</span>
              </div>
              <span className="text-gray-400">{proposalCount} proposals</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────
export const OpportunityCarousel: FC<OpportunityCarouselProps> = ({
  grants,
  selectedGrantId,
  onSelectGrant,
  fundraiseCounts,
  className,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = () => {
    const container = scrollRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 1);
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      return () => {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [grants]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;

    // Scroll by approximately 2 cards worth (each card is ~50% width)
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (grants.length === 0) {
    return null;
  }

  return (
    <div className={cn('relative', className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900">Funding Opportunities</h2>
          <span className="text-sm text-gray-400">({grants.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {selectedGrantId !== null && (
            <button
              onClick={() => onSelectGrant(null)}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear filter
            </button>
          )}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              canScrollLeft
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
            )}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              canScrollRight
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
            )}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {grants.map((grant) => {
          const grantId = typeof grant.id === 'number' ? grant.id : null;
          return (
            <OpportunityCard
              key={grant.id}
              grant={grant}
              isSelected={selectedGrantId === grantId}
              proposalCount={grantId !== null ? fundraiseCounts[grantId] || 0 : 0}
              onSelect={() => {
                if (grantId !== null) {
                  // Toggle selection: if already selected, deselect; otherwise select
                  onSelectGrant(selectedGrantId === grantId ? null : grantId);
                }
              }}
            />
          );
        })}
      </div>

      {/* Gradient overlays for scroll indication */}
      {canScrollLeft && (
        <div className="absolute left-0 top-12 bottom-2 w-12 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-12 bottom-2 w-12 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
      )}
    </div>
  );
};
