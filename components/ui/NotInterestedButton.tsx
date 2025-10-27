'use client';

import { Button } from '@/components/ui/Button';
import { ThumbsDown } from 'lucide-react';
import { useInterest } from '@/hooks/useInterest';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { FeedContentType } from '@/types/feed';
import { ContentType } from '@/types/work';
import { isFeatureEnabled, FeatureFlag } from '@/utils/featureFlags';

interface NotInterestedButtonProps {
  entityId: number;
  contentType: ContentType;
  className?: string;
  showText?: boolean;
}

export const NotInterestedButton = ({
  entityId,
  contentType,
  className = '',
  showText = true,
}: NotInterestedButtonProps) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  const { markNotInterested, isProcessing: isMarkingNotInterested } = useInterest({
    entityId,
    workContentType: contentType,
  });

  // Check if feature is enabled
  if (!isFeatureEnabled(FeatureFlag.NotInterested)) {
    return null;
  }

  return (
    <Button
      variant={'outlined'}
      size={'sm'}
      onClick={() => executeAuthenticatedAction(markNotInterested)}
      disabled={isMarkingNotInterested}
      className={`flex items-center gap-2 text-gray-600 hover:text-gray-800 ${className}`}
    >
      <ThumbsDown className="h-4 w-4" />
      {showText && 'Not Interested'}
    </Button>
  );
};
