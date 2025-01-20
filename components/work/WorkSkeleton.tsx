'use client';

import { Transition } from '@headlessui/react';

export function WorkSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Title skeleton */}
      <div className="mb-4">
        <div className="h-8 w-3/4 rounded-md bg-gray-200" />
      </div>

      {/* Authors skeleton */}
      <div className="mb-6 flex space-x-2">
        <div className="h-4 w-24 rounded-md bg-gray-200" />
        <div className="h-4 w-24 rounded-md bg-gray-200" />
        <div className="h-4 w-24 rounded-md bg-gray-200" />
      </div>

      {/* Journal and date skeleton */}
      <div className="mb-8">
        <div className="h-4 w-1/2 rounded-md bg-gray-200" />
      </div>

      {/* Abstract skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-full rounded-md bg-gray-200" />
        <div className="h-4 w-full rounded-md bg-gray-200" />
        <div className="h-4 w-3/4 rounded-md bg-gray-200" />
      </div>

      {/* Metrics skeleton */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="h-20 rounded-lg bg-gray-200" />
        <div className="h-20 rounded-lg bg-gray-200" />
        <div className="h-20 rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}
