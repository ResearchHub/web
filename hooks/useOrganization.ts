import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { OrganizationService } from '@/services/organization.service';
import type { Organization } from '@/types/organization';

export interface UseOrganizationReturn {
  organizations: Organization[];
  selectedOrg: Organization | null;
  setSelectedOrg: (org: Organization) => void;
  isLoading: boolean;
  error: Error | null;
}

export function useOrganization(): UseOrganizationReturn {
  const { data: session, status } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [orgsFetched, setOrgsFetched] = useState(false);

  useEffect(() => {
    const fetchOrganizations = async () => {
      // Only proceed if we have a definitive session status and haven't fetched orgs yet
      if (orgsFetched || status === 'loading') {
        return;
      }

      // Clear any previous errors when starting a new fetch
      setError(null);

      if (!session) {
        setIsLoading(false);
        setOrgsFetched(true);
        return;
      }

      try {
        const orgs = await OrganizationService.getUserOrganizations(session);
        setOrganizations(orgs);
        if (orgs.length > 0) {
          setSelectedOrg(orgs[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch organizations'));
      } finally {
        setIsLoading(false);
        setOrgsFetched(true);
      }
    };

    fetchOrganizations();
  }, [session, status, orgsFetched]);

  return {
    organizations,
    selectedOrg,
    setSelectedOrg,
    isLoading,
    error,
  };
}
