'use client';

import { Alert } from '@/components/ui/Alert';
import { GeneratedEmailsList } from './GeneratedEmailsList';

export function OutreachPageContent() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-base font-semibold text-gray-900 mb-2 sm:!text-lg md:!text-2xl">
        Outreach
      </h2>
      <p className="text-sm text-gray-600 mb-6">View and manage your generated outreach emails.</p>

      <div className="overflow-hidden">
        <GeneratedEmailsList getDetailHref={(e) => `/expert-finder/outreach/${e.id}`} />
      </div>
    </div>
  );
}
