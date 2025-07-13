'use client';

import { UserPlus } from 'lucide-react';

export function ReferralHeader() {
  return (
    <header className="text-center mb-12">
      <div className="flex justify-center items-start mb-4">
        <UserPlus className="h-10 w-10 mr-4" />
        <h1 className="text-3xl sm:!text-4xl font-bold text-gray-900">
          Refer a Funder, Accelerate Science
        </h1>
      </div>
      <p className="mt-4 text-lg text-gray-600">Earn credits by inviting funders to ResearchHub.</p>
    </header>
  );
}
