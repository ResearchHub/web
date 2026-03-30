'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import { BaseModal } from '@/components/ui/BaseModal';
import { GrantService } from '@/services/grant.service';
import { FeedEntry, FeedGrantContent } from '@/types/feed';
import { Loader2 } from 'lucide-react';
import { formatCompactAmount } from '@/utils/currency';
import { SelectedGrantData } from '@/components/Editor/lib/utils/publishingFormStorage';
import { GRANT_IMAGE_FALLBACK_GRADIENT } from '@/types/grant';

interface SelectFundingOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (grant: SelectedGrantData) => void;
}

const GrantCardSkeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-3 p-3 rounded-xl border border-gray-200">
        <div className="w-16 h-16 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

export function SelectFundingOpportunityModal({
  isOpen,
  onClose,
  onSelect,
}: Readonly<SelectFundingOpportunityModalProps>) {
  const [grants, setGrants] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0, rootMargin: '100px' });

  const fetchGrants = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const result = await GrantService.getGrants({
        status: 'OPEN',
        page: pageNum,
        pageSize: 10,
        ordering: 'newest',
      });
      setGrants((prev) => (pageNum === 1 ? result.grants : [...prev, ...result.grants]));
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error fetching grants:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setGrants([]);
      fetchGrants(1);
    }
  }, [isOpen, fetchGrants]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchGrants(nextPage);
    }
  }, [inView, hasMore, loading, page, fetchGrants]);

  const handleSelect = (entry: FeedEntry) => {
    const content = entry.content as FeedGrantContent;
    onSelect({
      id: content.grant.id.toString(),
      shortTitle: content.grant.shortTitle || content.title,
      imageUrl: content.previewImage || '',
      fundingAmount: content.grant.amount?.usd || 0,
      organization: content.grant.organization || '',
    });
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex flex-col gap-1">
          <span className="text-lg font-medium text-gray-900">Funding Opportunity</span>
          <span className="text-sm text-gray-500">Apply to specific funding opportunity</span>
        </div>
      }
      maxWidth="max-w-[600px]"
      padding="p-6"
      contentClassName="!pb-10"
    >
      <div className="space-y-2">
        {grants.length === 0 && loading && <GrantCardSkeleton />}

        {grants.length === 0 && !loading && (
          <div className="text-center py-10">
            <p className="text-sm text-gray-500">No open funding opportunities available</p>
          </div>
        )}

        {grants.length > 0 && (
          <>
            {grants.map((entry) => {
              const content = entry.content as FeedGrantContent;
              const grant = content.grant;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => handleSelect(entry)}
                  className="w-full flex gap-3 p-3 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 transition-colors text-left"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0 relative">
                    {content.previewImage ? (
                      <Image
                        src={content.previewImage}
                        alt={grant.shortTitle || content.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{ background: GRANT_IMAGE_FALLBACK_GRADIENT }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
                      {grant.organization || 'ResearchHub Grant'}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {grant.shortTitle || content.title}
                    </div>
                    <div className="text-xs font-medium text-emerald-600 mt-0.5">
                      {formatCompactAmount(grant.amount?.usd || 0)} Funding
                    </div>
                  </div>
                </button>
              );
            })}
            {hasMore && !loading && <div ref={loadMoreRef} className="h-10" />}
            {loading && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            )}
          </>
        )}
      </div>
    </BaseModal>
  );
}
