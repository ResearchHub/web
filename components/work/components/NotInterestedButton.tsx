'use client';

import { Button } from '@/components/ui/Button';
import { ThumbsDown } from 'lucide-react';
import { useInterest } from '@/hooks/useInterest';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { FeedContentType } from '@/types/feed';
import { ContentType } from '@/types/work';
import { Topic } from '@/types/topic';

interface NotInterestedButtonProps {
  entityId: number;
  contentType: FeedContentType;
  relatedDocumentId?: string;
  relatedDocumentContentType?: ContentType;
  relatedDocumentTopics?: Topic[];
  relatedDocumentUnifiedDocumentId?: string;
  className?: string;
  showText?: boolean;
}

export const NotInterestedButton = ({
  entityId,
  contentType,
  relatedDocumentId,
  relatedDocumentContentType,
  relatedDocumentTopics,
  relatedDocumentUnifiedDocumentId,
  className = '',
  showText = true,
}: NotInterestedButtonProps) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  const { markNotInterested, isProcessing: isMarkingNotInterested } = useInterest({
    entityId,
    contentType,
    relatedDocumentId,
    relatedDocumentContentType,
    relatedDocumentTopics,
    relatedDocumentUnifiedDocumentId,
  });

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
