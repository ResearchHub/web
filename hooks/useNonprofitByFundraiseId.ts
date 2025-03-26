'use client';

import { useState, useEffect, useCallback } from 'react';
import { NonprofitService } from '@/services/nonprofit.service';
import {
  NonprofitOrg,
  NonprofitDeployment,
  NonprofitDetails,
  NonprofitLink,
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
        const nonprofit = firstLink.nonprofit_details;

        // Search for the complete nonprofit information using the EIN
        let completeNonprofitInfo: NonprofitOrg | null = null;
        if (nonprofit.ein) {
          const searchResults = await NonprofitService.searchNonprofitOrgs(nonprofit.ein);
          // If we find an exact match by EIN, use that data
          completeNonprofitInfo =
            searchResults.find((result) => result.ein === nonprofit.ein) || null;
        }

        if (completeNonprofitInfo) {
          // If we found complete info, use it but ensure we keep the base_wallet_address
          setState({
            nonprofit: {
              ...completeNonprofitInfo,
              baseWalletAddress:
                nonprofit.base_wallet_address || completeNonprofitInfo.baseWalletAddress,
              endaoment_org_id:
                nonprofit.endaoment_org_id || completeNonprofitInfo.endaoment_org_id,
            },
            departmentLabName: firstLink.note || '',
            isLoading: false,
            error: null,
          });
        } else {
          // Create nonprofit object that matches the NonprofitOrg interface using available data
          const deployments: NonprofitDeployment[] = [];
          if (nonprofit.base_wallet_address) {
            deployments.push({
              isDeployed: true,
              chainId: 8453, // Base network
              address: nonprofit.base_wallet_address,
            });
          }

          // Create nonprofit object that matches the NonprofitOrg interface
          const formattedNonprofit: NonprofitOrg = {
            id: nonprofit.id.toString(),
            name: nonprofit.name,
            ein: nonprofit.ein,
            deployments,
            baseWalletAddress: nonprofit.base_wallet_address,
            address: { region: '', country: '' },
            nteeCode: '',
            nteeDescription: '',
            description: '',
            endaomentUrl: '',
            contibutionCount: 0,
            contibutionTotal: '0',
            endaoment_org_id: nonprofit.endaoment_org_id,
          };

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
