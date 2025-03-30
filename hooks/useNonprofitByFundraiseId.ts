'use client';

import { useState, useEffect, useCallback } from 'react';
import { NonprofitService } from '@/services/nonprofit.service';
import {
  NonprofitOrg,
  NonprofitDeployment,
  NonprofitDetails,
  NonprofitLink,
  transformNonprofitDetailsToOrg,
} from '@/types/nonprofit';
import { ID } from '@/types/root';

interface UseNonprofitByFundraiseIdState {
  nonprofit: NonprofitOrg | null;
  departmentLabName: string;
  isLoading: boolean;
  error: Error | null;
}

export interface UseNonprofitByFundraiseIdReturn {
  nonprofit: NonprofitOrg | null;
  departmentLabName: string;
  isLoading: boolean;
  error: Error | null;
  fetchNonprofitData: (fundraiseId: ID) => Promise<void>;
}

/**
 * Hook for fetching nonprofit data associated with a fundraiseId
 *
 * @param initialFundraiseId - Optional initial fundraise ID to fetch on mount
 * @returns Object containing nonprofit data, loading state, error state, and fetch function
 */
export const useNonprofitByFundraiseId = (
  initialFundraiseId?: ID
): UseNonprofitByFundraiseIdReturn => {
  const [state, setState] = useState<UseNonprofitByFundraiseIdState>({
    nonprofit: null,
    departmentLabName: '',
    isLoading: false,
    error: null,
  });

  /**
   * Fetch nonprofit data by fundraiseId
   *
   * @param fundraiseId - ID of the fundraise to fetch associated nonprofit data
   * @returns Promise that resolves when data is fetched and state is updated
   */
  const fetchNonprofitData = useCallback(async (fundraiseId: ID): Promise<void> => {
    // Set loading state first, before any async operations
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const nonprofitLinks = await NonprofitService.getNonprofitsByFundraiseId(fundraiseId);

      if (nonprofitLinks && nonprofitLinks.length > 0) {
        const firstLink = nonprofitLinks[0];
        const nonprofitDetails = firstLink.nonprofitDetails;

        // Search for the complete nonprofit information using the EIN
        let completeNonprofitInfo: NonprofitOrg | null = null;
        if (nonprofitDetails.ein) {
          const searchResults = await NonprofitService.searchNonprofitOrgs(nonprofitDetails.ein);
          // If we find an exact match by EIN, use that data
          completeNonprofitInfo =
            searchResults.find((result) => result.ein === nonprofitDetails.ein) || null;
        }

        if (completeNonprofitInfo) {
          // If we found complete info, use it but ensure we keep our database IDs
          setState({
            nonprofit: {
              ...completeNonprofitInfo,
              id: nonprofitDetails.id, // Preserve our internal database ID
              baseWalletAddress:
                nonprofitDetails.baseWalletAddress || completeNonprofitInfo.baseWalletAddress,
              endaomentOrgId: nonprofitDetails.endaomentOrgId,
            },
            departmentLabName: firstLink.note || '',
            isLoading: false,
            error: null,
          });
        } else {
          // If we don't have complete info from search, use the transformNonprofitDetailsToOrg
          // transformer to convert our database details to a nonprofit org
          const formattedNonprofit = transformNonprofitDetailsToOrg(nonprofitDetails.raw);

          setState({
            nonprofit: formattedNonprofit,
            departmentLabName: firstLink.note || '',
            isLoading: false,
            error: null,
          });
        }
      } else {
        setState({
          nonprofit: null,
          departmentLabName: '',
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Error fetching nonprofit data:', error);
      setState({
        nonprofit: null,
        departmentLabName: '',
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to fetch nonprofit data'),
      });
    }
  }, []);

  // Auto-fetch data if initialFundraiseId is provided
  useEffect(() => {
    if (initialFundraiseId) {
      fetchNonprofitData(initialFundraiseId);
    }
  }, [initialFundraiseId, fetchNonprofitData]);

  return {
    nonprofit: state.nonprofit,
    departmentLabName: state.departmentLabName,
    isLoading: state.isLoading,
    error: state.error,
    fetchNonprofitData,
  };
};
