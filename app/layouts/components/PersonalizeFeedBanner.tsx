'use client';

import { Settings, X, ArrowRight } from 'lucide-react';
import { memo, useState } from 'react';
import { useDismissableFeature } from '@/hooks/useDismissableFeature';
import { useSession } from 'next-auth/react';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { ManageTopicsModal } from '@/components/modals/ManageTopicsModal';

const FEATURE_NAME_LOGGED_OUT = 'personalize_feed_banner';
const FEATURE_NAME_LOGGED_IN = 'personalize_feed_banner_logged_in';

interface PersonalizeFeedBannerProps {
  /**
   * 'logged-out': Show for logged out users, clicking "Start Now" triggers auth
   * 'logged-in': Show for logged in users, clicking "Start Now" opens ManageTopicsModal
   */
  variant?: 'logged-out' | 'logged-in';
}

const PersonalizeFeedBannerComponent: React.FC<PersonalizeFeedBannerProps> = ({
  variant = 'logged-out',
}) => {
  const { status } = useSession();
  const featureName = variant === 'logged-in' ? FEATURE_NAME_LOGGED_IN : FEATURE_NAME_LOGGED_OUT;
  const { isDismissed, dismissFeature, dismissStatus } = useDismissableFeature(featureName);
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAuthenticated = status === 'authenticated';

  // Determine visibility based on variant
  if (variant === 'logged-out') {
    // Only show for logged out users
    if (isAuthenticated || dismissStatus !== 'checked' || isDismissed) {
      return null;
    }
  } else {
    // Only show for logged in users
    if (!isAuthenticated || dismissStatus !== 'checked' || isDismissed) {
      return null;
    }
  }

  const handleStartNow = () => {
    if (variant === 'logged-in') {
      setIsModalOpen(true);
    } else {
      executeAuthenticatedAction(() => {
        // After login, the banner will hide since user is authenticated
      });
    }
  };

  return (
    <>
      <div className="relative bg-gradient-to-br from-primary-50 to-primary-200 border border-primary-200 rounded-xl p-5 mb-4 overflow-hidden">
        {/* Close button */}
        <button
          onClick={dismissFeature}
          className="absolute top-3 right-3 p-1 rounded-full text-primary-400 hover:text-primary-600 hover:bg-primary-100 transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="mb-4">
          <div className="w-14 h-14 rounded-xl bg-primary-200/50 flex items-center justify-center">
            <Settings className="w-7 h-7 text-primary-600" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title & Subtext */}
        <h3 className="text-xl font-bold text-primary-900 mb-2 pr-6">Personalize Your Feed</h3>
        <p className="text-sm text-primary-700 mb-4">
          Get daily personalized feed of cutting-edge research
        </p>

        {/* CTA Button */}
        <button
          onClick={handleStartNow}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
        >
          Start Now
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {variant === 'logged-in' && (
        <ManageTopicsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export const PersonalizeFeedBanner = memo(PersonalizeFeedBannerComponent);
