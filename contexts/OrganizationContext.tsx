'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const currentOrgSlug = params?.orgSlug as string;

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [defaultOrg, setDefaultOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const syncOrganizationWithUrl = (orgs: Organization[]) => {
    if (!orgs.length) {
      return;
    } else if (!currentOrgSlug) {
      if (defaultOrg) {
        router.replace(`/notebook/${defaultOrg.slug}`);
      }
      return;
    }

    // Find the organization that matches the current URL
    const orgFromUrl = orgs.find((o) => o.slug === currentOrgSlug);

    if (orgFromUrl) {
      // Valid org found, update selection if needed
      if (!selectedOrg || orgFromUrl.slug !== selectedOrg.slug) {
        setSelectedOrg(orgFromUrl);
      }
    } else {
      // Invalid org slug, redirect to main notebook page
      // TODO: Redirect to the Error page
      router.replace('/notebook');
    }
  };

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const orgs = await OrganizationService.getUserOrganizations(session);

      setOrganizations(orgs);

      if (orgs.length > 0 && !defaultOrg) {
        setDefaultOrg(orgs[0]);
      }

      syncOrganizationWithUrl(orgs);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch organizations'));
      setOrganizations([]);
      setDefaultOrg(null);
    } finally {
      setIsLoading(false);
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
  }, [session?.user?.id, status]);

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
