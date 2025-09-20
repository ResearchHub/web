'use client';

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
// Remove useSession import if no longer needed directly in this hook
// import { useSession } from 'next-auth/react';
// Remove uuid import, it will be generated in the service
// import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '@/services/types';
import { TransactionService } from '@/services/transaction.service';
import { FeedContentType } from '@/types/feed';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { TipSubmittedEvent } from '@/types/analytics';
import { useUser } from '@/contexts/UserContext';
import { ContentType } from '@/types/work';

// Define the type for content type mapping result
type TipContentType = 'researchhubpost' | 'paper' | 'rhcommentmodel';

interface UseTipOptions {
  contentId: number; // The ID of the content being tipped (e.g., comment ID, post ID)
  feedContentType: FeedContentType;
  relatedWorkContentType?: ContentType;
  onTipSuccess?: (response: any, amount: number) => void;
  onTipError?: (error: any) => void;
}

// Map FeedContentType to the content_type string expected by the API
function mapFeedContentTypeToTipContentType(feedContentType: FeedContentType): TipContentType {
  switch (feedContentType) {
    case 'PAPER':
      return 'paper';
    case 'POST':
    case 'PREREGISTRATION':
      return 'researchhubpost';
    case 'COMMENT':
    case 'BOUNTY': // Assuming tipping a bounty tips the underlying comment
      return 'rhcommentmodel';
    default:
      console.warn(
        `Unhandled FeedContentType in mapFeedContentTypeToTipContentType: ${feedContentType}`
      );
      return 'researchhubpost'; // Default fallback
  }
}

/**
 * A reusable hook for handling tipping functionality.
 * Assumes authentication is handled before calling the `tip` function.
 */
export function useTip({
  contentId,
  feedContentType,
  relatedWorkContentType,
  onTipSuccess,
  onTipError,
}: UseTipOptions) {
  const [isTipping, setIsTipping] = useState(false);
  // Removed session check - handled by caller using executeAuthenticatedAction
  const { user } = useUser();
  /**
   * Tip a piece of content.
   * @param amount The amount of RSC to tip.
   */
  const tip = useCallback(
    async (amount: number) => {
      // Removed session check here

      if (isTipping) return;
      if (amount <= 0) {
        toast.error('Tip amount must be positive');
        return;
      }

      try {
        setIsTipping(true);

        const contentType = mapFeedContentTypeToTipContentType(feedContentType);
        if (contentType !== 'rhcommentmodel') {
          const payload: TipSubmittedEvent = {
            target_type: contentType,
            related_work:
              contentId && relatedWorkContentType
                ? {
                    id: contentId?.toString() || '',
                    content_type: relatedWorkContentType,
                  }
                : undefined,
          };
          AnalyticsService.logEventWithUserProperties(LogEvent.TIP_SUBMITTED, payload, user);
        }

        const response = await TransactionService.tipContentTransaction({
          contentType: contentType,
          objectId: contentId,
          amount,
        });

        toast.success(`Successfully tipped ${amount} RSC!`);

        if (onTipSuccess) {
          onTipSuccess(response, amount);
        }
      } catch (error: any) {
        console.error('Tip error:', error);

        let errorMessage = 'Failed to send tip. Please try again.';
        if (error instanceof ApiError) {
          errorMessage = error.message || errorMessage;
          if (error.status === 403) {
            errorMessage = 'Tipping this content is not allowed.';
          } else if (error.message?.includes('Insufficient balance')) {
            errorMessage = 'Insufficient balance to send tip.';
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        toast.error(errorMessage);

        if (onTipError) {
          onTipError(error);
        }
      } finally {
        setIsTipping(false);
      }
    },
    [contentId, feedContentType, isTipping, onTipSuccess, onTipError] // Removed session dependency
  );

  return {
    tip,
    isTipping,
  };
}
