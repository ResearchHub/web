'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useSession } from 'next-auth/react';
import { OrganizationService } from '@/services/organization.service';
import type { Organization } from '@/types/organization';
import { useParams } from 'next/navigation';
import {
  saveSelectedOrganization,
  getSelectedOrganization,
  findOrganizationById,
} from './utils/organizationStorage';
import { selectOrganization } from './utils/organizationSelection';

interface OrganizationContextType {
  organizations: Organization[];
  selectedOrg: Organization | null;
  setSelectedOrg: (org: Organization) => void;
  isLoading: boolean;
  error: Error | null;
  refreshOrganizations: (silently?: boolean) => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

function OrganizationProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const params = useParams();
  const targetOrgSlug = params?.orgSlug as string;

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const selectedOrgIdRef = useRef<number | null>(selectedOrg?.id || null);

  useEffect(() => {
    selectedOrgIdRef.current = selectedOrg?.id || null;
  }, [selectedOrg]);

  const handleSetSelectedOrg = (org: Organization) => {
    setSelectedOrg(org);
    saveSelectedOrganization(org);
  };

  const fetchOrganizations = useCallback(
    async (silently = false) => {
      if (!session) {
        return;
      }

      if (!silently) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const orgs = await OrganizationService.getUserOrganizations(session);
        setOrganizations(orgs);

        // If we don't have a selected org yet but have orgs, select one based on priority
        if (!selectedOrgIdRef.current && orgs.length > 0) {
          const orgToSelect = selectOrganization(orgs, targetOrgSlug);
          if (orgToSelect) {
            handleSetSelectedOrg(orgToSelect);
          }
        } else if (selectedOrgIdRef.current) {
          // If we already have a selected org, make sure it's updated with latest data
          const updatedSelectedOrg = orgs.find((org) => org.id === selectedOrgIdRef.current);
          if (updatedSelectedOrg) {
            handleSetSelectedOrg(updatedSelectedOrg);
          }
        }
      } catch (err) {
        if (!silently) {
          setError(err instanceof Error ? err : new Error('Failed to load organizations'));
        } else {
          console.error('Failed to silently refresh organizations:', err);
        }
      } finally {
        if (!silently) {
          setIsLoading(false);
        }
      }
    },
    [session, targetOrgSlug]
  );

  const refreshOrganizations = useCallback(
    async (silently = false) => {
      await fetchOrganizations(silently);
    },
    [fetchOrganizations]
  );

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    } else if (!session || status !== 'authenticated') {
      setIsLoading(false);
      return;
    }

    fetchOrganizations();
  }, [session, status]);

  const value = {
    organizations,
    selectedOrg,
    setSelectedOrg: handleSetSelectedOrg,
    isLoading,
    error,
    refreshOrganizations,
  };

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

function useOrganizationContext() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganizationContext must be used within an OrganizationProvider');
  }
  return context;
}

export { OrganizationProvider, useOrganizationContext };
