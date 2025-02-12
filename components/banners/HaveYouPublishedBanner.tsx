'use client';

import { Settings, User, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';

export const HaveYouPublishedBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-100 mb-6 relative">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Is this your paper?</h3>
      <ul className="space-y-4 mb-6">
        <li className="flex items-start gap-2 text-sm text-gray-700">
          <ResearchCoinIcon outlined size={20} color="#676767" />
          <span>Earn rewards for your paper</span>
        </li>
        <li className="flex items-start gap-2 text-sm">
          <Settings
            className="h-5 w-5 text-primary-500 flex-shrink-0"
            style={{ color: '#676767' }}
          />
          <span>Be able to customize this page</span>
        </li>
        <li className="flex items-start gap-2 text-sm">
          <User className="h-5 w-5 text-primary-500 flex-shrink-0" style={{ color: '#676767' }} />
          <span>Appear as author in comment section</span>
        </li>
      </ul>
      <Button className="w-full" variant="default" size="md">
        Claim your paper
      </Button>
    </div>
  );
};
