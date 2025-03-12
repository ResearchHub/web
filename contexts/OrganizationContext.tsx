'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { OrganizationService } from '@/services/organization.service';
import type { Organization, OrganizationUsers } from '@/types/organization';

interface OrganizationContextType {
  organizations: Organization[];
  selectedOrg: Organization | null;
  defaultOrg: Organization | null;
  orgUsers: OrganizationUsers | null;
  isLoading: boolean;
  error: Error | null;
  refreshOrgUsersSilently: () => Promise<void>;
  refreshOrganizationsSilently: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const params = useParams();
  const currentOrgSlug = params?.orgSlug as string;

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [defaultOrg, setDefaultOrg] = useState<Organization | null>(null);
  const [orgUsers, setOrgUsers] = useState<OrganizationUsers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrganizations = async (fetchOrgUsers = true) => {
    try {
      const orgs = await OrganizationService.getUserOrganizations(session);
      setOrganizations(orgs);

      const newDefaultOrg = orgs[0];
      if (newDefaultOrg) {
        setDefaultOrg(newDefaultOrg);
      }

      // Find the organization that matches the current URL
      const orgFromUrl = orgs.find((o) => o.slug === currentOrgSlug);

      let orgToSelect: Organization | null = null;

      // If we found a matching org
      if (orgFromUrl) {
        orgToSelect = orgFromUrl;
      }
      // If we can't find the org in the URL and we have a default, use that
      else if (!orgFromUrl && newDefaultOrg && !selectedOrg) {
        //TODO: we need to redirect client to the new default org
        orgToSelect = newDefaultOrg;
      }

      // If we have an organization to select, fetch its users
      if (orgToSelect) {
        setSelectedOrg(orgToSelect);
        if (fetchOrgUsers) {
          const users = await OrganizationService.getOrganizationUsers(orgToSelect.id.toString());
          setOrgUsers(users);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load organizations or organization users')
      );
      setOrganizations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrgUsers = async () => {
    if (!selectedOrg) return;

    try {
      const users = await OrganizationService.getOrganizationUsers(selectedOrg.id.toString());
      setOrgUsers(users);
    } catch (err) {
      console.error('Failed to fetch organization users:', err);
      setError(err instanceof Error ? err : new Error('Failed to load organization users'));
    }
  };

  const refreshOrgUsersSilently = async () => {
    await fetchOrgUsers();
  };

  const refreshOrganizationsSilently = async () => {
    try {
      await fetchOrganizations(false);
    } catch (err) {
      console.error('Failed to refresh organizations:', err);
    }
  };

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    } else if (!session || status !== 'authenticated') {
      setIsLoading(false);
      return;
    }

    fetchOrganizations();
  }, [session?.userId, status]);

  const value = {
    organizations,
    selectedOrg,
    defaultOrg,
    orgUsers,
    isLoading,
    error,
    refreshOrgUsersSilently,
    refreshOrganizationsSilently,
  };

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganizationContext must be used within an OrganizationProvider');
  }
  return context;
}
