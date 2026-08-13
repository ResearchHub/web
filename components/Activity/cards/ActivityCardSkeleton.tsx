'use client';

import { FC } from 'react';

export const ActivityCardSkeleton: FC = () => (
  <div className="animate-pulse py-4 border-b border-gray-100 last:border-b-0" aria-hidden>
    <div className="flex gap-2.5">
      <div className="flex w-8 flex-shrink-0 flex-col items-center">
        <div className="pt-0.5">
          <div className="h-8 w-8 rounded-full bg-gray-200" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-2.5 flex items-start justify-between gap-2 pt-1">
          <div className="flex h-6 min-w-0 flex-1 items-center gap-x-1.5">
            <div className="h-3.5 w-24 rounded bg-gray-200" />
            <div className="h-3.5 w-32 rounded bg-gray-200" />
          </div>
          <div className="flex h-6 shrink-0 items-center gap-0.5">
            <div className="h-3 w-14 rounded bg-gray-200" />
            <div className="h-6 w-6 rounded-full bg-gray-200" />
          </div>
        </div>

        <div className="mt-5 -ml-[42px] tablet:!ml-0 overflow-hidden rounded-[14px] border border-gray-200 bg-white">
          <div className="relative h-[190px] overflow-hidden bg-gray-200 sm:h-[180px]">
            <div className="absolute inset-x-0 bottom-0 px-4 pb-2 pt-2 bg-black/40">
              <div className="h-3.5 w-3/4 rounded bg-white/30" />
              <div className="mt-1.5 h-2.5 w-1/3 rounded bg-white/20" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 px-3 py-2">
            <div className="flex items-center gap-4">
              <div className="h-4 w-16 rounded bg-gray-200" />
              <div className="h-4 w-16 rounded bg-gray-200" />
              <div className="h-4 w-16 rounded bg-gray-200" />
            </div>
            <div className="h-8 w-[72px] shrink-0 rounded-md bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
