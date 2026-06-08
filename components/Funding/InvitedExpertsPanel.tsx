'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';
import { PaginationButton } from '@/components/ui/PaginationButton';
import { ExpertFinderService } from '@/services/expertFinder.service';
import type { GrantInvitedExpert } from '@/types/expertFinder';
import { InvitedExpertRow } from './InvitedExpertRow';

export const INVITED_EXPERTS_GRID_CLASS = 'grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4';

interface InvitedExpertsPanelProps {
  experts: GrantInvitedExpert[];
  className?: string;
}

export const InvitedExpertsPanel: FC<InvitedExpertsPanelProps> = ({ experts, className }) => {
  if (experts.length === 0) {
    return null;
  }

  return (
    <div className={cn('px-4 pt-3', className)}>
      <div className={INVITED_EXPERTS_GRID_CLASS}>
        {experts.map((expert, i) => (
          <InvitedExpertRow key={`${expert.expertId ?? expert.email}-${i}`} expert={expert} />
        ))}
      </div>
    </div>
  );
};

export function InvitedExpertsGridSkeleton({ count }: { count?: number }) {
  const itemCount = count ?? ExpertFinderService.GRANT_INVITED_EXPERTS_PAGE_SIZE;

  return (
    <div className={cn('px-4 py-3', INVITED_EXPERTS_GRID_CLASS)}>
      {Array.from({ length: itemCount }, (_, i) => (
        <div
          key={i}
          className="min-h-[80px] rounded-md border border-gray-100 bg-gray-100 animate-pulse"
        />
      ))}
    </div>
  );
}

interface InvitedExpertsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export function InvitedExpertsPagination({
  page,
  totalPages,
  total,
  isLoading,
  onPageChange,
}: InvitedExpertsPaginationProps) {
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
