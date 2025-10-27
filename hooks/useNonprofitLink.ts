'use client';

import { useState } from 'react';
import { NonprofitService } from '@/services/nonprofit.service';
import { NonprofitOrg, NonprofitFundraiseLink, CreateNonprofitParams } from '@/types/nonprofit';
import { ID } from '@/types/root';
import { ApiError } from '@/services/types';

export interface UseNonprofitLinkReturn {
  data: NonprofitFundraiseLink | null;
  isLoading: boolean;
  error: Error | null;
  linkNonprofitToFundraise: (
    nonprofitData: CreateNonprofitParams,
    fundraiseId: ID,
    note?: string
  ) => Promise<NonprofitFundraiseLink>;
}

/**
 * Hook for linking nonprofits to fundraises.
 *
 * This hook provides a function to:
 * 1. Create or retrieve a nonprofit organization
 * 2. Link it to a fundraise
 *
 * @returns Object containing link data, loading state, error state, and link function
 */
export const useNonprofitLink = (): UseNonprofitLinkReturn => {
  const [data, setData] = useState<NonprofitFundraiseLink | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Link a nonprofit organization to a fundraise
   *
   * @param nonprofitData - The nonprofit organization data to create or retrieve
   * @param fundraiseId - The ID of the fundraise to link to
   * @param note - Optional note or description for the link (e.g., department/lab name)
   * @returns Promise that resolves to the created nonprofit-fundraise link
   */
  const linkNonprofitToFundraise = async (
    nonprofitData: CreateNonprofitParams,
    fundraiseId: ID,
    note = ''
  ): Promise<NonprofitFundraiseLink> => {
    // Set loading state first, before any async operations
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Create or retrieve the nonprofit organization
      const nonprofitResponse = await NonprofitService.createNonprofit(nonprofitData);

      // Step 2: Link the nonprofit to the fundraise
      const linkPayload = {
        nonprofitId: nonprofitResponse.id,
        fundraiseId: fundraiseId,
        note: note || '',
      };

      const linkResponse = await NonprofitService.linkToFundraise(linkPayload);

      // Set data and clear error
      setData(linkResponse);
      setError(null);

      return linkResponse;
    } catch (err) {
      // Handle various error types
      let errorMessage: string;

      if (err instanceof ApiError) {
        try {
          const errorData = JSON.parse(err.message);

          // Try to extract specific error messages
          if (errorData.data && errorData.data.error) {
            errorMessage = errorData.data.error;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = 'An error occurred while linking the nonprofit to the fundraise';
          }
        } catch (parseError) {
          errorMessage =
            err.message || 'An error occurred while linking the nonprofit to the fundraise';
        }
      } else if (err instanceof Error) {
        errorMessage = err.message || 'An unknown error occurred';
      } else {
        errorMessage = 'An unknown error occurred';
      }

      const errorObj = new Error(errorMessage);
      setError(errorObj);
      throw errorObj;
    } finally {
      // Always set loading to false when done
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    linkNonprofitToFundraise,
  };
};
