'use client';

import { useState, useCallback } from 'react';
import { OrganizationService, OrganizationError } from '@/services/organization.service';
import { Organization } from '@/types/organization';

interface UseUpdateOrgDetailsState {
  data: Organization | null;
  isLoading: boolean;
  error: string | null;
}

type UpdateOrgDetailsFn = (orgId: string, name: string) => Promise<Organization>;
type UseUpdateOrgDetailsReturn = [UseUpdateOrgDetailsState, UpdateOrgDetailsFn];

/**
 * Hook for updating organization details
 * @returns A tuple containing the state and update function
 */
export const useUpdateOrgDetails = (): UseUpdateOrgDetailsReturn => {
  const [data, setData] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateOrgDetails = async (orgId: string, name: string): Promise<Organization> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await OrganizationService.updateOrgDetails(orgId, name);
      setData(response);
      return response;
    } catch (err) {
      const errorMsg =
        err instanceof OrganizationError ? err.message : 'Failed to update organization details';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return [{ data, isLoading, error }, updateOrgDetails];
};

interface UseInviteUserToOrgState {
  isLoading: boolean;
  error: string | null;
}

type InviteUserToOrgFn = (
  orgId: string | number,
  email: string,
  expire?: number,
  accessType?: string
) => Promise<boolean>;

type UseInviteUserToOrgReturn = [UseInviteUserToOrgState, InviteUserToOrgFn];

/**
 * Hook for inviting a user to an organization
 * @returns A tuple containing the state and invite function
 */
export const useInviteUserToOrg = (): UseInviteUserToOrgReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteUserToOrg = async (
    orgId: string | number,
    email: string,
    expire: number = 10080, // Default: 1 week in minutes
    accessType: string = 'MEMBER'
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await OrganizationService.inviteUserToOrg(orgId, email, expire, accessType);
      return response;
    } catch (err) {
      const errorMsg =
        err instanceof OrganizationError ? err.message : 'Failed to invite user to organization';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return [{ isLoading, error }, inviteUserToOrg];
};

interface UseRemoveUserFromOrgState {
  isLoading: boolean;
  error: string | null;
}

type RemoveUserFromOrgFn = (orgId: string | number, userId: string | number) => Promise<boolean>;
type UseRemoveUserFromOrgReturn = [UseRemoveUserFromOrgState, RemoveUserFromOrgFn];

/**
 * Hook for removing a user from an organization
 * @returns A tuple containing the state and remove function
 */
export const useRemoveUserFromOrg = (): UseRemoveUserFromOrgReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeUserFromOrg = async (
    orgId: string | number,
    userId: string | number
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await OrganizationService.removeUserFromOrg(orgId, userId);
      return response;
    } catch (err) {
      const errorMsg =
        err instanceof OrganizationError ? err.message : 'Failed to remove user from organization';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return [{ isLoading, error }, removeUserFromOrg];
};

interface UseUpdateUserPermissionsState {
  isLoading: boolean;
  error: string | null;
}

type UpdateUserPermissionsFn = (
  orgId: string | number,
  userId: string | number,
  accessType: 'ADMIN' | 'EDITOR' | 'VIEWER'
) => Promise<boolean>;

type UseUpdateUserPermissionsReturn = [UseUpdateUserPermissionsState, UpdateUserPermissionsFn];

/**
 * Hook for updating a user's permissions in an organization
 * @returns A tuple containing the state and update function
 */
export const useUpdateUserPermissions = (): UseUpdateUserPermissionsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUserPermissions = async (
    orgId: string | number,
    userId: string | number,
    accessType: 'ADMIN' | 'EDITOR' | 'VIEWER'
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await OrganizationService.updateOrgUserPermissions(
        orgId,
        userId,
        accessType
      );
      return response;
    } catch (err) {
      const errorMsg =
        err instanceof OrganizationError ? err.message : 'Failed to update user permissions';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return [{ isLoading, error }, updateUserPermissions];
};

interface UseRemoveInvitedUserFromOrgState {
  isLoading: boolean;
  error: string | null;
}

type RemoveInvitedUserFromOrgFn = (orgId: string | number, email: string) => Promise<boolean>;
type UseRemoveInvitedUserFromOrgReturn = [
  UseRemoveInvitedUserFromOrgState,
  RemoveInvitedUserFromOrgFn,
];

/**
 * Hook for removing an invited user from an organization
 * @returns A tuple containing the state and remove function
 */
export const useRemoveInvitedUserFromOrg = (): UseRemoveInvitedUserFromOrgReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeInvitedUserFromOrg = async (
    orgId: string | number,
    email: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await OrganizationService.removeInvitedUserFromOrg(orgId, email);
      return response;
    } catch (err) {
      const errorMsg =
        err instanceof OrganizationError
          ? err.message
          : 'Failed to remove invited user from organization';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return [{ isLoading, error }, removeInvitedUserFromOrg];
};

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

interface UseUpdateOrgCoverImageState {
  data: Organization | null;
  isLoading: boolean;
  error: string | null;
}

type UpdateOrgCoverImageFn = (
  orgId: string | number,
  coverImage: File | Blob
) => Promise<Organization>;
type UseUpdateOrgCoverImageReturn = [UseUpdateOrgCoverImageState, UpdateOrgCoverImageFn];

/**
 * Hook for updating an organization's cover image
 * @returns A tuple containing the state and update function
 */
export const useUpdateOrgCoverImage = (): UseUpdateOrgCoverImageReturn => {
  const [data, setData] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateOrgCoverImage = async (
    orgId: string | number,
    coverImage: File | Blob
  ): Promise<Organization> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await OrganizationService.updateOrgCoverImage(orgId, coverImage);
      setData(response);
      return response;
    } catch (err) {
      const errorMsg =
        err instanceof OrganizationError
          ? err.message
          : 'Failed to update organization cover image';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return [{ data, isLoading, error }, updateOrgCoverImage];
};
