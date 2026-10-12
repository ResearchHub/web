'use client';

import { FC } from 'react';

export const ActivityCardSkeleton: FC = () => (
  <div
    className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white"
    aria-hidden
  >
    <div className="px-3.5 pt-3.5 tablet:px-4 tablet:pt-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200" />
        <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
          <div className="h-3.5 w-52 rounded bg-gray-200" />
          <div className="h-3 w-40 rounded bg-gray-200" />
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-2 border-t border-gray-200/70 pt-3">
        <div className="h-3.5 w-full rounded bg-gray-200" />
        <div className="h-3.5 w-2/3 rounded bg-gray-200" />
      </div>
    </div>

    <div className="relative mt-3 h-[136px] bg-gray-200 tablet:mx-4 tablet:h-[172px] tablet:rounded-xl">
      <div className="absolute inset-x-0 bottom-0 px-4 pb-2.5 pt-2 bg-black/10 tablet:rounded-b-xl">
        <div className="h-2.5 w-24 rounded bg-white/50" />
        <div className="mt-1.5 h-3.5 w-3/4 rounded bg-white/60" />
      </div>
    </div>

    <div className="flex items-center justify-between gap-3 px-3.5 pb-3 pt-3 tablet:px-4 tablet:pb-4">
      <div className="h-6 w-20 rounded bg-gray-200" />
      <div className="h-10 w-28 rounded-[10px] bg-gray-200" />
    </div>
  </div>
);
