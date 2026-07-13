'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';

const NAV_ITEM_COUNT = 2;

function SidebarNavItemSkeleton({ active }: { active?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-3 py-3 rounded-lg animate-pulse',
        active ? 'border border-gray-200 bg-gray-50' : 'border border-transparent'
      )}
    >
      <div className="flex items-center space-x-3 min-w-0">
        <div className="h-5 w-5 bg-gray-200 rounded flex-shrink-0" />
        <div className="min-w-0 space-y-1.5">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-3 w-32 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export const ExpertFinderSidebarSkeleton: FC = () => (
  <div className="h-full flex flex-col">
    <div className="flex-1 p-4">
      <nav className="space-y-2">
        {Array.from({ length: NAV_ITEM_COUNT }, (_, i) => (
          <SidebarNavItemSkeleton key={i} active={i === 0} />
        ))}
      </nav>
    </div>
  </div>
);

export const ExpertFinderMenuSkeleton: FC = () => (
  <div className="w-full p-4 lg:!hidden animate-pulse">
    <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
    <div className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-lg">
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 bg-gray-200 rounded" />
        <div className="h-4 w-16 bg-gray-200 rounded" />
      </div>
      <div className="h-4 w-4 bg-gray-200 rounded" />
    </div>
  </div>
);
