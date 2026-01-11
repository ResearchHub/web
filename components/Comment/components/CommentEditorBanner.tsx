'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { useReviewCooldown } from '@/hooks/useReviewCooldown';
import { useIsMobile } from '@/hooks/useIsMobile';

interface CommentEditorBannerProps {
  readonly isEditing: boolean;
  readonly children: (props: {
    canReview: boolean;
    startCooldown: () => void;
    banner: React.ReactNode;
  }) => React.ReactNode;
}

const CooldownTooltip = (
  <div className="text-left">
    <div className="font-semibold text-sm text-gray-900 leading-tight">Limit Reached</div>
    <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
      We currently limit reviews to once every four days.
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="border border-gray-200 rounded-lg bg-white p-6 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
    <div className="h-24 bg-gray-100 rounded" />
  </div>
);

export function CommentEditorBanner({ isEditing, children }: CommentEditorBannerProps) {
  const { canReview, timeRemaining, isLoading, startCooldown } = useReviewCooldown(true);
  const isMobile = useIsMobile();
  const [isCooldownDismissed, setIsCooldownDismissed] = useState(false);
  const [isInfoDismissed, setIsInfoDismissed] = useState(false);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const showCooldown = !canReview && !isEditing && !isCooldownDismissed;
  const showInfo = canReview && !isInfoDismissed;

  const renderBanner = () => {
    if (showCooldown) {
      return (
        <div className="mb-3 flex items-center justify-between gap-3 border rounded-md p-2 sm:!p-3 text-xs sm:!text-sm bg-red-50 border-red-200 text-red-800">
          <div className="flex items-center gap-1.5">
            <span className="flex flex-col sm:!block">
              <span>You can write a Peer Review again in</span>
              <span className="font-semibold sm:!ml-1">{timeRemaining}</span>
            </span>
            {!isMobile && (
              <Tooltip content={CooldownTooltip} position="top" width="w-72">
                <Info className="h-4 w-4 cursor-help flex-shrink-0 text-red-600" />
              </Tooltip>
            )}
          </div>
          <button
            onClick={() => setIsCooldownDismissed(true)}
            aria-label="Dismiss notice"
            className="flex-shrink-0 inline-flex items-center px-3 py-1.5 rounded text-xs font-medium bg-red-100 hover:bg-red-200 text-red-800"
          >
            Got it
          </button>
        </div>
      );
    }

    if (showInfo) {
      return (
        <div className="mb-3 flex items-center justify-between gap-3 border rounded-md p-2 sm:!p-3 text-xs sm:!text-sm bg-yellow-50 border-yellow-200 text-yellow-800">
          <p>
            <span className="font-semibold">Add your review.</span> Be sure to view bounty
            description in the bounties tab before reviewing.
          </p>
          <button
            onClick={() => setIsInfoDismissed(true)}
            aria-label="Dismiss notice"
            className="flex-shrink-0 inline-flex items-center px-3 py-1.5 rounded text-xs font-medium bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
          >
            Got it
          </button>
        </div>
      );
    }

    return null;
  };

  return children({ canReview, startCooldown, banner: renderBanner() });
}
