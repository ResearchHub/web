'use client';

import { Users, FlaskConical } from 'lucide-react';

export function ReferralImpactSkeleton() {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Referral Impact</h2>

      {/* Credits earned skeleton */}
      <div className="bg-green-50 p-6 rounded-xl text-center mb-6">
        <div className="h-12 w-32 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mx-auto"></div>
        <div className="mt-2">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mx-auto"></div>
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-6 rounded-xl text-center">
          <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="h-10 w-16 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mx-auto"></div>
        </div>
        <div className="bg-blue-50 p-6 rounded-xl text-center">
          <FlaskConical className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="h-10 w-20 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mx-auto"></div>
        </div>
      </div>
    </section>
  );
}
