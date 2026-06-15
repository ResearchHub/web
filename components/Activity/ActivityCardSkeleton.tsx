'use client';

import { FC } from 'react';

export const ActivityCardSkeleton: FC = () => (
  <div className="animate-pulse py-5" aria-hidden>
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pb-3">
      <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0" />
      <div className="h-3.5 bg-gray-200 rounded w-24" />
      <div className="h-3.5 bg-gray-200 rounded w-32" />
      <div className="h-3 bg-gray-200 rounded w-10 ml-auto shrink-0" />
    </div>

    <div className="flex flex-col md:flex-row md:gap-4">
      <div className="hidden md:block w-[160px] min-h-[120px] bg-gray-200 rounded-lg shrink-0" />

      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="h-[18px] bg-gray-200 rounded w-full md:w-4/5" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />

        <div className="rounded-lg bg-gray-100 border border-gray-100 px-4 py-3.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-6 min-w-0">
              <div className="flex flex-col gap-1.5">
                <div className="h-2.5 bg-gray-200 rounded w-20" />
                <div className="h-5 bg-gray-200 rounded w-16" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="h-2.5 bg-gray-200 rounded w-14" />
                <div className="h-5 bg-gray-200 rounded w-8" />
              </div>
            </div>
            <div className="h-8 w-[72px] bg-gray-200 rounded shrink-0" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
