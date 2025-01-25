import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { OrganizationService } from '@/services/organization.service';
import type { Organization } from '@/services/types/organization.dto';

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

  useEffect(() => {
    const fetchOrganizations = async () => {
      // Only proceed if we have a definitive session status
      if (status === 'loading') {
        return;
      }

      // Clear any previous errors when starting a new fetch
      setError(null);

      if (!session) {
        setIsLoading(false);
        return;
      }

      try {
        const orgs = await OrganizationService.getUserOrganizations(session);
        if (Array.isArray(orgs)) {
          setOrganizations(orgs);
          if (orgs.length > 0) {
            setSelectedOrg(orgs[0]);
          }
        } else {
          setError(new Error('Invalid response format'));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch organizations'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, [session, status]);

  return {
    organizations,
    selectedOrg,
    setSelectedOrg,
    isLoading,
    error,
  };
}
