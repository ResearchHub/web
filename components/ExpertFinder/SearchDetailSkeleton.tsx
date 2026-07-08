'use client';

import { FC } from 'react';

function SkeletonBreadcrumbs() {
  return (
    <div className="flex flex-wrap items-center gap-2 animate-pulse mb-2">
      <div className="h-4 w-14 bg-gray-200 rounded" />
      <div className="h-3 w-3 bg-gray-200 rounded-full" />
      <div className="h-4 w-28 bg-gray-200 rounded" />
    </div>
  );
}

function SkeletonRelatedWorkCard() {
  return (
    <div className="bg-gray-50 rounded-lg border !border-l-2 !border-l-gray-300 border-gray-200 !rounded-tl-none !rounded-bl-none p-4 animate-pulse">
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="h-5 w-14 bg-gray-200 rounded-full" />
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-1/2 bg-gray-200 rounded mb-2" />
      <div className="space-y-1.5 mt-2">
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-5/6 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

function SkeletonExpertResultCard() {
  return (
    <article className="flex h-full min-h-0 flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-200 rounded" />
      </div>
      <div className="h-3.5 w-24 bg-gray-200 rounded mb-1" />
      <div className="h-3.5 w-40 bg-gray-200 rounded mb-3" />
      <div className="flex flex-wrap gap-1.5 mb-3">
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
        <div className="h-5 w-14 bg-gray-200 rounded-full" />
      </div>
      <div className="space-y-1.5 mb-4 flex-1">
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-4/5 bg-gray-200 rounded" />
      </div>
      <div className="flex flex-wrap gap-2 mt-auto pt-2">
        <div className="h-8 w-24 bg-gray-200 rounded-md" />
        <div className="h-8 w-28 bg-gray-200 rounded-md" />
      </div>
    </article>
  );
}

export const SearchDetailSkeleton: FC = () => (
  <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
    <SkeletonBreadcrumbs />

    <div className="flex flex-wrap items-start gap-3 animate-pulse">
      <div className="h-6 w-28 bg-gray-200 rounded-full" />
      <div className="h-6 w-20 bg-gray-200 rounded-full" />
      <div className="h-4 w-36 bg-gray-200 rounded" />
    </div>

    <SkeletonRelatedWorkCard />

    <div className="flex gap-4 border-b border-gray-200 animate-pulse">
      <div className="h-9 w-28 bg-gray-200 rounded-t-md border-b-2 border-gray-300" />
      <div className="h-9 w-20 bg-gray-200 rounded-t-md" />
    </div>

    <section>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded" />
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-8 w-20 bg-gray-200 rounded-md" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-8 w-32 bg-gray-200 rounded-md" />
          <div className="h-8 w-24 bg-gray-200 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:!grid-cols-2">
        {[0, 1, 2].map((i) => (
          <SkeletonExpertResultCard key={i} />
        ))}
      </div>
    </section>
  </div>
);
