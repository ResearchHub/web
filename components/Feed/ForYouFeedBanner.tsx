'use client';

import { Sparkles } from 'lucide-react';
import { memo } from 'react';
import { useDismissableFeature } from '@/hooks/useDismissableFeature';
import { Button } from '@/components/ui/Button';

const FEATURE_NAME = 'for_you_feed_banner';

// Hybrid icon combining Logo beaker with sparkles
const PersonalizedIcon = () => (
  <div className="relative flex flex-col items-center flex-shrink-0">
    <Sparkles className="w-5 h-5 text-primary-500 -mb-0.5" />
  </div>
);

const ForYouFeedBannerComponent: React.FC = () => {
  const { isDismissed, dismissFeature, dismissStatus } = useDismissableFeature(FEATURE_NAME);

  // Don't render while checking or if dismissed
  if (dismissStatus !== 'checked' || isDismissed) {
    return null;
  }

  return (
    <div className="relative flex flex-col sm:flex-row sm:items-center gap-2.5 text-sm bg-indigo-50 rounded-lg px-3 py-2.5 border-2 border-indigo-200">
      <div className="flex items-start sm:items-center gap-2.5 flex-1">
        <PersonalizedIcon />
        <div className="text-gray-600">
          <span className="text-gray-800 font-medium">Personalized Recommendations</span>
          <span className="hidden sm:inline mx-1.5 text-gray-400">·</span>
          <span className="block sm:inline mt-0.5 sm:mt-0">
            Improves as you save, upvote, and explore
          </span>
        </div>
      </div>
      <Button
        onClick={dismissFeature}
        variant="default"
        size="sm"
        className="w-full sm:w-auto sm:ml-auto flex-shrink-0"
      >
        Let&apos;s go
      </Button>
    </div>
  );
};

export const ForYouFeedBanner = memo(ForYouFeedBannerComponent);
