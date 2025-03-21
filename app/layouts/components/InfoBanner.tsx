'use client';

import { BookOpen, Check } from 'lucide-react';
import { memo } from 'react';
import { Button } from '@/components/ui/Button';

const InfoBannerComponent: React.FC = () => (
  <div className="bg-indigo-50 rounded-lg p-5 mb-6">
    <div className="flex flex-col items-center mb-4">
      <BookOpen className="h-8 w-8 text-indigo-900 mb-2" />
      <div className="text-lg font-semibold text-indigo-900 text-center">ResearchHub Journal</div>
    </div>

    <div className="space-y-2.5 mb-5">
      {['fourteen days to peer reviews', 'Paid peer reviewers', 'Open access by default'].map(
        (feature, index) => (
          <div key={index} className="flex items-center space-x-2.5">
            <Check className="h-4 w-4 text-indigo-900 flex-shrink-0" />
            <span className="text-sm text-gray-700">{feature}</span>
          </div>
        )
      )}
    </div>

    <Button
      variant="default"
      size="default"
      className="w-full justify-center bg-indigo-600 text-white hover:bg-indigo-700 font-medium"
    >
      Learn more
    </Button>
  </div>
);

export const InfoBanner = memo(InfoBannerComponent);
