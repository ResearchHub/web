'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';
import { ACTIVITY_ROW_DIVIDER } from './ActivityCardShell';

export const ActivityCardSkeleton: FC = () => (
  <div className={cn(ACTIVITY_ROW_DIVIDER, 'animate-pulse py-4')} aria-hidden>
    <div className="flex gap-3">
      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 pt-1">
          <div className="h-3.5 w-52 max-w-full rounded bg-gray-200" />
          <div className="h-3 w-40 max-w-full rounded bg-gray-200" />
        </div>
        <div className="mt-3 flex flex-col gap-2 border-t border-gray-200/70 pt-3">
          <div className="h-3.5 w-full rounded bg-gray-200" />
          <div className="h-3.5 w-2/3 rounded bg-gray-200" />
        </div>

        <div className="relative mt-3 aspect-[3/2] rounded-xl border border-gray-200 bg-gray-200 tablet:aspect-[2/1]">
          <div className="absolute inset-x-0 bottom-0 rounded-b-[11px] bg-black/10 px-3.5 pb-2.5 pt-2 tablet:px-4">
            <div className="h-2.5 w-24 rounded bg-white/50" />
            <div className="mt-1.5 h-3.5 w-3/4 rounded bg-white/60" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-3">
          <div className="h-6 w-20 rounded bg-gray-200" />
          <div className="h-11 w-28 rounded-xl bg-gray-200 tablet:h-10 tablet:rounded-[10px]" />
        </div>
      </div>
    </div>
  </div>
);
