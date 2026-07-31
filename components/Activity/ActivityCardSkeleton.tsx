'use client';

import { FC } from 'react';

export const ActivityCardSkeleton: FC = () => (
  <div className="animate-pulse py-4 border-b border-gray-100 last:border-b-0" aria-hidden>
    <div className="flex gap-2.5">
      <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0" />

      <div className="min-w-0 flex-1">
        <div className="mb-2.5 flex flex-wrap items-center gap-x-1.5 pt-1">
          <div className="h-3.5 bg-gray-200 rounded w-24" />
          <div className="h-3.5 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-200 rounded w-10 ml-auto shrink-0" />
        </div>

        <div className="mt-5 -ml-[42px] tablet:!ml-0 rounded-[14px] border border-gray-200 overflow-hidden">
          <div className="h-[190px] sm:h-[180px] bg-gray-200" />
          <div className="flex h-[46px] items-center justify-between gap-2 px-2 bg-white">
            <div className="flex items-center gap-1">
              <div className="h-8 w-[5.5rem] rounded-full bg-gray-200" />
              <div className="h-8 w-8 rounded-full bg-gray-200" />
              <div className="h-8 w-8 rounded-full bg-gray-200" />
            </div>
            <div className="h-8 w-[72px] bg-gray-200 rounded-md shrink-0" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
