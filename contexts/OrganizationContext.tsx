'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { OrganizationService } from '@/services/organization.service';
import type { Organization } from '@/types/organization';

interface OrganizationContextType {
  organizations: Organization[];
  selectedOrg: Organization | null;
  defaultOrg: Organization | null;
  isLoading: boolean;
  error: Error | null;
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const params = useParams();
  const currentOrgSlug = params?.orgSlug as string;

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [defaultOrg, setDefaultOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load organizations
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

        // Set default org if needed
        if (orgs.length > 0 && !defaultOrg) {
          const newDefaultOrg = orgs[0];
          setDefaultOrg(newDefaultOrg);
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

  // Sync organization with URL
  useEffect(() => {
    // Don't sync if we don't have the necessary data
    if (!organizations.length || !currentOrgSlug) {
      return;
    }

    // Find the organization that matches the current URL
    const orgFromUrl = organizations.find((o) => o.slug === currentOrgSlug);

    // If we found a matching org and it's different from the current selection
    if (orgFromUrl && (!selectedOrg || orgFromUrl.slug !== selectedOrg.slug)) {
      setSelectedOrg(orgFromUrl);
    }
    // If we can't find the org in the URL and we have a default, use that
    else if (!orgFromUrl && defaultOrg && !selectedOrg) {
      setSelectedOrg(defaultOrg);
    }
  }, [currentOrgSlug, organizations, defaultOrg]);

  const value = {
    organizations,
    selectedOrg,
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
