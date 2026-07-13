'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';

const TITLE_WIDTHS = ['w-3/4', 'w-2/3', 'w-5/6'] as const;

interface ActivityCardSkeletonProps {
  titleWidth?: (typeof TITLE_WIDTHS)[number];
}

export const ActivityCardSkeleton: FC<ActivityCardSkeletonProps> = ({ titleWidth = 'w-2/3' }) => (
  <div className="py-4 border-b border-gray-100 last:border-b-0 animate-pulse">
    <div className="grid grid-cols-[auto_1fr] gap-x-2.5 items-start">
      <div className="row-span-2 pt-0.5 w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
      <div className="flex flex-wrap items-center gap-x-1.5 mb-1">
        <div className="h-3.5 w-24 bg-gray-200 rounded" />
        <div className="h-3.5 w-20 bg-gray-200 rounded" />
        <div className="h-3.5 w-3.5 bg-gray-200 rounded" />
      </div>
      <div className={cn('h-3.5 bg-gray-200 rounded', titleWidth)} />
    </div>
    <div className="h-3 w-16 bg-gray-200 rounded mt-1 ml-[42px]" />
  </div>
);

interface ActivityCardSkeletonListProps {
  count?: number;
  className?: string;
}

export const ActivityCardSkeletonList: FC<ActivityCardSkeletonListProps> = ({
  count = 15,
  className,
}) => (
  <div className={cn('py-8', className)}>
    {Array.from({ length: count }, (_, i) => (
      <ActivityCardSkeleton key={i} titleWidth={TITLE_WIDTHS[i % TITLE_WIDTHS.length]} />
    ))}
  </div>
);
