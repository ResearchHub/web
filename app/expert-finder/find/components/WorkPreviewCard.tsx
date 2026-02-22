'use client';

import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RelatedWorkCard } from '@/components/Paper/RelatedWorkCard';
import type { Work } from '@/types/work';
import { cn } from '@/utils/styles';

export interface WorkPreviewCardProps {
  work?: Work | null;
  className?: string;
  onEdit?: () => void;
  isLoading?: boolean;
}

function WorkPreviewCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-gray-50/50 overflow-hidden animate-pulse',
        className
      )}
    >
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 rounded bg-gray-200" />
          <div className="h-3 w-20 rounded bg-gray-200" />
        </div>
        <div className="h-4 w-full max-w-[80%] rounded bg-gray-200" />
        <div className="h-3 w-full rounded bg-gray-200" />
        <div className="h-3 w-3/4 rounded bg-gray-200" />
      </div>
    </div>
  );
}

export function WorkPreviewCard({
  work,
  className,
  onEdit,
  isLoading = false,
}: WorkPreviewCardProps) {
  if (isLoading) {
    return <WorkPreviewCardSkeleton className={className} />;
  }

  if (!work) {
    return null;
  }

  return (
    <div className={cn('relative', className)}>
      {onEdit && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit();
          }}
          className="absolute top-2 right-2 z-10 p-1.5 h-8 w-8 rounded-md hover:bg-gray-200 bg-white/90 shadow-sm border border-gray-200"
          aria-label="Change work"
        >
          <Pencil className="h-4 w-4 text-gray-500" />
        </Button>
      )}
      <RelatedWorkCard work={work} size="sm" onClick={() => {}} />
    </div>
  );
}
