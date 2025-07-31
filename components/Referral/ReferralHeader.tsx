'use client';

import { UserPlus } from 'lucide-react';

export function ReferralHeader() {
  return (
    <header className="text-center mb-12">
      <div className="flex flex-col items-center gap-3 mt-4 mb-8">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
          <UserPlus className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Refer a Funder, Accelerate Science
        </h1>
        <p className="text-lg text-gray-600 text-center max-w-xl">
          Earn funding credits by inviting funders to ResearchHub.
        </p>
      </div>
    </header>
  );
}
