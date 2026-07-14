'use client';

import { FC, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/styles';
import { useGrantInvitedExperts } from '@/hooks/useExpertFinder';
import {
  GrantInvitedExpertsGridSkeleton,
  GrantInvitedExpertsGrid,
  GrantInvitedExpertsPagination,
} from './GrantInvitedExpertsGrid';

interface GrantInvitedExpertsSectionProps {
  unifiedDocumentId: number;
  canView: boolean;
  variant: 'standalone' | 'tab-panel';
  isActive?: boolean;
  onTotalChange?: (total: number | null) => void;
  className?: string;
}

export const GrantInvitedExpertsSection: FC<GrantInvitedExpertsSectionProps> = ({
  unifiedDocumentId,
  canView,
  variant,
  isActive = false,
  onTotalChange,
  className,
}) => {
  const [standaloneOpened, setStandaloneOpened] = useState(false);
  const {
    experts,
    total,
    page,
    totalPages,
    isLoading,
    error,
    isForbidden,
    hasLoaded,
    load,
    goToPage,
    reset,
  } = useGrantInvitedExperts();

  useEffect(() => {
    return () => reset();
  }, [reset, unifiedDocumentId]);

  useEffect(() => {
    if (!canView) return;

    if (variant === 'tab-panel' && isActive && !hasLoaded && !isLoading && !isForbidden) {
      void load(unifiedDocumentId);
    }
  }, [canView, variant, isActive, hasLoaded, isLoading, isForbidden, load, unifiedDocumentId]);

  useEffect(() => {
    onTotalChange?.(hasLoaded ? total : null);
  }, [hasLoaded, total, onTotalChange]);

  if (!canView || isForbidden) {
    return null;
  }

  const handleStandaloneToggle = () => {
    if (standaloneOpened) {
      setStandaloneOpened(false);
      return;
    }
    setStandaloneOpened(true);
    if (!hasLoaded && !isLoading) {
      void load(unifiedDocumentId);
    }
  };

  const standaloneToggleButton = (
    <button
      type="button"
      onClick={handleStandaloneToggle}
      className={cn(
        'w-full flex items-center justify-center gap-1 px-5 py-2.5 text-xs font-semibold transition-colors border-t border-gray-100 cursor-pointer',
        standaloneOpened ? 'text-gray-400 hover:bg-gray-50/80' : 'text-blue-500 hover:bg-gray-50/80'
      )}
      aria-expanded={standaloneOpened}
    >
      {standaloneOpened ? 'Hide invited experts' : 'View invited experts'}
      <ChevronDown
        className={cn(
          'h-3.5 w-3.5 shrink-0 transition-transform',
          standaloneOpened && 'rotate-180'
        )}
      />
    </button>
  );

  const handleRetry = () => {
    void load(unifiedDocumentId);
  };

  const panelContent = (
    <>
      {isLoading && !hasLoaded ? (
        <GrantInvitedExpertsGridSkeleton />
      ) : error ? (
        <div className="px-5 py-4 border-b border-gray-100 text-center">
          <p className="text-[11px] text-gray-500 mb-2">Couldn&apos;t load invited experts</p>
          <button
            type="button"
            onClick={handleRetry}
            className="text-xs font-semibold text-blue-500 hover:text-blue-600 cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : hasLoaded && experts.length === 0 ? (
        <div className="px-5 py-4 border-b border-gray-100 text-center">
          <p className="text-[11px] text-gray-500">No invited experts yet</p>
        </div>
      ) : hasLoaded && experts.length > 0 ? (
        <>
          {isLoading ? (
            <GrantInvitedExpertsGridSkeleton />
          ) : (
            <GrantInvitedExpertsGrid experts={experts} />
          )}
          <GrantInvitedExpertsPagination
            page={page}
            totalPages={totalPages}
            total={total}
            isLoading={isLoading}
            onPageChange={(nextPage) => void goToPage(nextPage)}
          />
        </>
      ) : null}
    </>
  );

  if (variant === 'tab-panel') {
    if (!isActive) return null;
    return <div className={className}>{panelContent}</div>;
  }

  return (
    <div className={className}>
      {standaloneToggleButton}
      {standaloneOpened && panelContent}
    </div>
  );
};
