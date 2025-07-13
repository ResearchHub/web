'use client';

import { Users } from 'lucide-react';

export function ReferredUsersSkeleton() {
  return (
    <section className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Your Referred Users</h2>

      <div className="divide-y divide-gray-100">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row items-start sm:items-center py-4 gap-3"
          >
            {/* Avatar skeleton */}
            <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse mr-0 sm:mr-4"></div>

            {/* User info skeleton */}
            <div className="flex-grow min-w-0">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Stats skeleton */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 w-full sm:w-auto">
              <div className="text-left sm:text-right">
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="text-left sm:text-right">
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="h-9 w-24 bg-gray-200 rounded animate-pulse w-full sm:w-auto"></div>
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse order-first sm:order-none"></div>
        <div className="h-9 w-20 bg-gray-200 rounded animate-pulse w-full sm:w-auto"></div>
      </div>
    </section>
  );
}
