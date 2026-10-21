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

/**
 * A linked nonprofit's full record: Endaoment's, found by its EIN, keeping our
 * own id and wallet; or the record we store, when Endaoment has no match.
 */
async function fetchNonprofitOrg(details: NonprofitDetails): Promise<NonprofitOrg> {
  if (details.ein) {
    const searchResults = await NonprofitService.searchNonprofitOrgs(details.ein);
    const match = searchResults.find((result) => result.ein === details.ein);
    if (match) {
      return {
        ...match,
        id: details.id, // Preserve our internal database ID
        baseWalletAddress: details.baseWalletAddress || match.baseWalletAddress,
        endaomentOrgId: details.endaomentOrgId,
      };
    }
  }
  return transformNonprofitDetailsToOrg(details.raw);
}

/**
 * The full record of a nonprofit the page already has the link for, e.g. from
 * `useWorkNonprofit`. The record we store shows at once; Endaoment's address,
 * category and description replace it when its EIN search answers.
 */
export function useNonprofitOrg(details: NonprofitDetails | null): NonprofitOrg | null {
  const [found, setFound] = useState<NonprofitOrg | null>(null);
  const id = details?.id;

  useEffect(() => {
    if (!details) return;
    let isCurrent = true;
    fetchNonprofitOrg(details)
      .then((org) => {
        if (isCurrent) setFound(org);
      })
      .catch((error) => console.error('Error fetching nonprofit details:', error));
    return () => {
      isCurrent = false;
    };
    // Keyed by id: a refreshed page hands over an equal record, not a new nonprofit.
  }, [id]);

  if (!details) return null;
  return found?.id === details.id ? found : transformNonprofitDetailsToOrg(details.raw);
}

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
}

/**
 * Hook for fetching nonprofit data associated with a fundraiseId
 *
 * @param initialFundraiseId - Optional initial fundraise ID to fetch on mount
 * @returns Object containing nonprofit data, loading state and error state
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

        setState({
          nonprofit: await fetchNonprofitOrg(firstLink.nonprofitDetails),
          departmentLabName: firstLink.note || '',
          isLoading: false,
          error: null,
        });
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
  };
};
