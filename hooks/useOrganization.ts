'use client';

import { useState, useCallback } from 'react';
import { OrganizationService, OrganizationError } from '@/services/organization.service';
import { Organization } from '@/types/organization';

interface UseAcceptOrgInviteState {
  isLoading: boolean;
  error: string | null;
}

type AcceptOrgInviteFn = (token: string) => Promise<boolean>;
type UseAcceptOrgInviteReturn = [UseAcceptOrgInviteState, AcceptOrgInviteFn];

/**
 * Hook for accepting an organization invitation
 * @returns A tuple containing the state and accept function
 */
export const useAcceptOrgInvite = (): UseAcceptOrgInviteReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptOrgInvite = async (token: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await OrganizationService.acceptOrgInvite(token);
      return response;
    } catch (err) {
      const errorMsg =
        err instanceof OrganizationError ? err.message : 'Failed to accept organization invitation';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return [{ isLoading, error }, acceptOrgInvite];
};

/**
 * Hook for fetching organization details by invite token
 * @returns A tuple containing the state and fetch function
 */
export const useFetchOrgByInviteToken = () => {
  const [data, setData] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrgByInviteToken = useCallback(async (token: string): Promise<Organization> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await OrganizationService.fetchOrgByInviteToken(token);
      setData(response);
      return response;
    } catch (err) {
      const errorMsg =
        err instanceof OrganizationError
          ? err.message
          : 'Failed to fetch organization by invite token';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return [{ data, isLoading, error }, fetchOrgByInviteToken] as const;
};
