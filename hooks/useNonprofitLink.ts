'use client';

import { useState, useEffect } from 'react';
import { NonprofitService } from '@/services/nonprofit.service';
import { NonprofitOrg } from '@/types/nonprofit';
import { ID } from '@/types/root';
import { ApiError } from '@/services/types';
import { isFeatureEnabled } from '@/utils/featureFlags';

interface NonprofitFundraiseLink {
  id: ID;
  nonprofit: NonprofitOrg;
  fundraise: {
    id: ID;
    [key: string]: any;
  };
  note?: string;
}

interface NonprofitLinkState {
  data: NonprofitFundraiseLink | null;
  isLoading: boolean;
  error: string | null;
  isFeatureEnabled: boolean;
}

type LinkNonprofitToFundraiseFn = (
  nonprofitData: {
    name: string;
    endaoment_org_id: string;
    ein?: string;
    base_wallet_address?: string;
  },
  fundraiseId: ID,
  note?: string
) => Promise<NonprofitFundraiseLink>;

type UseNonprofitLinkReturn = [NonprofitLinkState, LinkNonprofitToFundraiseFn];

/**
 * Hook for linking nonprofits to fundraises.
 *
 * This hook provides a function to:
 * 1. Create or retrieve a nonprofit organization
 * 2. Link it to a fundraise
 *
 * @returns [state, linkNonprofitToFundraise]
 */
export const useNonprofitLink = (): UseNonprofitLinkReturn => {
  const [data, setData] = useState<NonprofitFundraiseLink | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [featureEnabled, setFeatureEnabled] = useState(false);

  // Check if the feature is enabled on mount
  useEffect(() => {
    try {
      setFeatureEnabled(isFeatureEnabled('nonprofitIntegration'));
    } catch (err) {
      console.error('Error checking feature flag:', err);
      setFeatureEnabled(false);
    }
  }, []);

  const linkNonprofitToFundraise: LinkNonprofitToFundraiseFn = async (
    nonprofitData,
    fundraiseId,
    note = ''
  ) => {
    // Check if feature is enabled before proceeding
    if (!featureEnabled) {
      const errorMsg = 'Nonprofit integration is not available in this environment';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Create or retrieve the nonprofit organization
      const nonprofitResponse = await NonprofitService.createNonprofit(nonprofitData);

      // Step 2: Link the nonprofit to the fundraise
      const linkPayload = {
        nonprofit_id: nonprofitResponse.id,
        fundraise_id: fundraiseId,
        note,
      };

      const linkResponse = await NonprofitService.linkToFundraise(linkPayload);

      // Ensure the response has the note field
      const responseWithNote: NonprofitFundraiseLink = {
        ...linkResponse,
        note: note || undefined,
      };

      setData(responseWithNote);
      return responseWithNote;
    } catch (err) {
      const { data = {} } = err instanceof ApiError ? JSON.parse(err.message) : {};
      const errorMsg =
        data?.error || 'An error occurred while linking the nonprofit to the fundraise';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ data, isLoading, error, isFeatureEnabled: featureEnabled }, linkNonprofitToFundraise];
};
