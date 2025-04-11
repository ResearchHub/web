'use client';

import { X, BadgeCheck, ChevronRight } from 'lucide-react';

interface VerificationBannerProps {
  onClose: () => void;
  onLearnMore?: () => void;
  onMenuClose?: () => void;
}

export default function VerificationBanner({
  onClose,
  onLearnMore,
  onMenuClose,
}: VerificationBannerProps) {
  const handleLearnMoreClick = (e: React.MouseEvent) => {
    onMenuClose?.();
    onLearnMore?.();
  };

  return (
    <div className="bg-indigo-50 p-3 rounded-lg">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center mb-1.5">
            <BadgeCheck className="h-4 w-4 text-indigo-600 mr-1.5" />
            <h3 className="font-semibold text-sm text-indigo-600">Verify & Unlock Perks</h3>
          </div>
          <ul className="space-y-0.5 text-xs text-gray-600 mb-2">
            <li className="flex items-center">
              <span className="mr-1.5">✓</span>
              Auto sync all of your papers
            </li>
            <li className="flex items-center">
              <span className="mr-1.5">✓</span>
              Get a verified badge
            </li>
            <li className="flex items-center">
              <span className="mr-1.5">✓</span>
              Fast track your earnings
            </li>
          </ul>
          <button
            onClick={handleLearnMoreClick}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
          >
            Learn more
            <ChevronRight className="h-3 w-3 ml-0.5" />
          </button>
        </div>
        <button onClick={onClose} className="p-0.5 hover:bg-indigo-100 rounded-lg text-gray-500">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
