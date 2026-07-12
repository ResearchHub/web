'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';
import { PaginationButton } from '@/components/ui/PaginationButton';
import { ExpertFinderService } from '@/services/expertFinder.service';
import type { GrantInvitedExpert } from '@/types/expertFinder';
import { GrantInvitedExpertCard } from './GrantInvitedExpertCard';

export const GRANT_INVITED_EXPERTS_GRID_CLASS =
  'grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4';

interface GrantInvitedExpertsGridProps {
  experts: GrantInvitedExpert[];
  className?: string;
}

export const GrantInvitedExpertsGrid: FC<GrantInvitedExpertsGridProps> = ({
  experts,
  className,
}) => {
  if (experts.length === 0) {
    return null;
  }

  return (
    <div className={cn('p-4', className)}>
      <div className={GRANT_INVITED_EXPERTS_GRID_CLASS}>
        {experts.map((expert, i) => (
          <GrantInvitedExpertCard key={`${expert.expertId ?? expert.email}-${i}`} expert={expert} />
        ))}
      </div>
    </div>
  );
};

export function GrantInvitedExpertsGridSkeleton({ count }: { count?: number }) {
  const itemCount = count ?? ExpertFinderService.GRANT_INVITED_EXPERTS_PAGE_SIZE;

  return (
    <div className={cn('px-4 py-3', GRANT_INVITED_EXPERTS_GRID_CLASS)}>
      {Array.from({ length: itemCount }, (_, i) => (
        <div
          key={i}
          className="min-h-[80px] rounded-md border border-gray-100 bg-gray-100 animate-pulse"
        />
      ))}
    </div>
  );
}

interface GrantInvitedExpertsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export function GrantInvitedExpertsPagination({
  page,
  totalPages,
  total,
  isLoading,
  onPageChange,
}: GrantInvitedExpertsPaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-4">
      <div className="text-sm text-gray-700">
        Page {page} of {totalPages}
        {total > 0 && <span className="ml-2 text-gray-500">({total} total)</span>}
      </div>
      <div className="flex items-center gap-2">
        <PaginationButton
          label="Previous"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage || isLoading}
          isLoading={isLoading}
        />
        <PaginationButton
          label="Next"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage || isLoading}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
