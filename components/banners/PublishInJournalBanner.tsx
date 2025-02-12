'use client';

import { BookOpen, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const PublishInJournalBanner = () => {
  return (
    <div className="bg-gradient-to-b from-indigo-50/80 to-white p-4 rounded-lg mb-6 border border-indigo-100">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-6 w-6 text-indigo-900" />
        <div className="text-lg font-semibold text-indigo-900">Publish in the RH Journal</div>
      </div>

      <div className="space-y-2.5 mb-5">
        <div className="flex items-center space-x-2.5">
          <Check className="h-4 w-4 text-indigo-900 flex-shrink-0" />
          <span className="text-sm text-gray-700">Fast turnaround time</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <Check className="h-4 w-4 text-indigo-900 flex-shrink-0" />
          <span className="text-sm text-gray-700">Paid peer reviewers</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <Check className="h-4 w-4 text-indigo-900 flex-shrink-0" />
          <span className="text-sm text-gray-700">Open access by default</span>
        </div>
      </div>

      <Button className="w-full" variant="default">
        Learn More
      </Button>
    </div>
  );
};
