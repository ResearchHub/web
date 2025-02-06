'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { OrganizationService } from '@/services/organization.service';
import type { Organization } from '@/types/organization';

interface OrganizationContextType {
  organizations: Organization[];
  selectedOrg: Organization | null;
  setSelectedOrg: (org: Organization) => void;
  defaultOrg: Organization | null;
  isLoading: boolean;
  error: Error | null;
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [defaultOrg, setDefaultOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchOrganizations = async () => {
      if (!session || status !== 'authenticated') {
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        const orgs = await OrganizationService.getUserOrganizations(session);

        if (!isMounted) return;

        setOrganizations(orgs);

        if (orgs.length > 0 && !defaultOrg) {
          const newDefaultOrg = orgs[0];
          setDefaultOrg(newDefaultOrg);

          if (!selectedOrg) {
            setSelectedOrg(newDefaultOrg);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err : new Error('Failed to fetch organizations'));
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    fetchOrganizations();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [session?.user?.id, status]);

  useEffect(() => {
    if (organizations.length > 0 && selectedOrg) {
      const orgStillExists = organizations.some((org) => org.id === selectedOrg.id);
      if (!orgStillExists && defaultOrg) {
        setSelectedOrg(defaultOrg);
      }
    }
  }, [organizations, selectedOrg, defaultOrg]);

  const value = {
    organizations,
    selectedOrg,
    setSelectedOrg,
    defaultOrg,
    isLoading,
    error,
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
