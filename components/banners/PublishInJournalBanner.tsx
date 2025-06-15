'use client';

import { BookOpen, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const PublishInJournalBanner = () => {
  return (
    <div className="bg-gradient-to-b from-primary-50/80 to-white p-4 rounded-lg mb-6 border border-primary-100">
      <div className="flex items-start gap-3">
        <BookOpen className="h-6 w-6 text-primary-900" />
        <div className="text-lg font-semibold text-primary-900">Publish in the RH Journal</div>
      </div>
      <div className="mt-3 text-sm text-gray-700">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary-900 flex-shrink-0" />
            <span>Fast peer review (14 days)</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary-900 flex-shrink-0" />
            <span>No publication fees</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary-900 flex-shrink-0" />
            <span>Reviewers are compensated</span>
          </div>
        </div>
      </div>

      <Button className="w-full" variant="default">
        Learn More
      </Button>
    </div>
  );
};
