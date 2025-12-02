'use client';

import { Settings, X, ArrowRight } from 'lucide-react';
import { memo } from 'react';
import { useDismissableFeature } from '@/hooks/useDismissableFeature';
import { useSession } from 'next-auth/react';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';

const FEATURE_NAME = 'personalize_feed_banner';

const PersonalizeFeedBannerComponent: React.FC = () => {
  const { status } = useSession();
  const { isDismissed, dismissFeature, dismissStatus } = useDismissableFeature(FEATURE_NAME);
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  const isAuthenticated = status === 'authenticated';

  // Only show for logged out users, and don't render while checking or if dismissed
  if (isAuthenticated || dismissStatus !== 'checked' || isDismissed) {
    return null;
  }

  const handleStartNow = () => {
    executeAuthenticatedAction(() => {
      // After login, the banner will hide since user is authenticated
    });
  };

  return (
    <div className="relative bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-5 mb-4 overflow-hidden">
      {/* Close button */}
      <button
        onClick={dismissFeature}
        className="absolute top-3 right-3 p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Icon */}
      <div className="mb-4">
        <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center">
          <Settings className="w-7 h-7 text-white" strokeWidth={1.5} />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-4 pr-6">Personalize Your Feed</h3>

      {/* CTA Button */}
      <button
        onClick={handleStartNow}
        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white text-primary-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
      >
        Start Now
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export const PersonalizeFeedBanner = memo(PersonalizeFeedBannerComponent);
