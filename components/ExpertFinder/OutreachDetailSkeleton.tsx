'use client';

import { FC } from 'react';

function SkeletonBreadcrumbs() {
  return (
    <div className="flex flex-wrap items-center gap-2 animate-pulse mb-2">
      <div className="h-4 w-14 bg-gray-200 rounded" />
      <div className="h-3 w-3 bg-gray-200 rounded-full" />
      <div className="h-4 w-24 bg-gray-200 rounded" />
      <div className="h-3 w-3 bg-gray-200 rounded-full" />
      <div className="h-4 w-32 bg-gray-200 rounded" />
    </div>
  );
}

function SkeletonNeighborNav() {
  return (
    <div className="flex flex-wrap items-center gap-2 animate-pulse">
      <div className="h-8 w-8 bg-gray-200 rounded-lg" />
      <div className="h-4 w-12 bg-gray-200 rounded" />
      <div className="h-8 w-8 bg-gray-200 rounded-lg" />
    </div>
  );
}

export const OutreachDetailSkeleton: FC = () => (
  <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
    <SkeletonBreadcrumbs />

    <div className="sm:!hidden">
      <SkeletonNeighborNav />
    </div>

    <div className="grid grid-cols-1 md:!grid-cols-2 items-start gap-4">
      <div className="min-w-0 space-y-2 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded sm:!h-7 md:!h-8" />
        <div className="h-4 w-52 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded mt-2" />
      </div>
      <div className="min-w-0 flex flex-col gap-2">
        <div className="hidden sm:!block">
          <SkeletonNeighborNav />
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-start md:!justify-end animate-pulse">
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
          <div className="h-8 w-20 bg-gray-200 rounded-md" />
          <div className="h-8 w-8 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>

    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-4 animate-pulse">
      <div>
        <div className="h-4 w-14 bg-gray-200 rounded mb-2" />
        <div className="h-10 w-full bg-gray-200 rounded-md border border-gray-200" />
      </div>
      <div>
        <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
        <div className="min-h-[200px] w-full bg-gray-100 rounded-md border border-gray-200" />
      </div>
    </section>

    <div className="flex justify-end pt-2 animate-pulse">
      <div className="h-8 w-20 bg-gray-200 rounded-md" />
    </div>
  </div>
);
