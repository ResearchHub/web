'use client';

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { NoteService } from '@/services/note.service';
import { OrganizationService } from '@/services/organization.service';
import type { Note } from '@/types/note';
import type { OrganizationUsers } from '@/types/organization';
import { useOrganizationContext } from './OrganizationContextV2';

interface OrganizationDataContextType {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  users: OrganizationUsers | null;
  isLoading: boolean;
  error: Error | null;
  totalCount: number;
  refresh: () => Promise<void>;
  refreshUsers: (silently?: boolean) => Promise<void>;
}

const OrganizationDataContext = createContext<OrganizationDataContextType | null>(null);

export function OrganizationDataProvider({ children }: { children: ReactNode }) {
  const { selectedOrg, isLoading: isLoadingOrg } = useOrganizationContext();
  const [notes, setNotes] = useState<Note[]>([]);
  const [users, setUsers] = useState<OrganizationUsers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async (slug?: string, orgId?: string) => {
    try {
      if (!slug || !orgId) {
        throw new Error('No organization information provided');
      }

      setIsLoading(true);
      setError(null);

      const [notesData, usersData] = await Promise.all([
        NoteService.getOrganizationNotes(slug),
        OrganizationService.getOrganizationUsers(orgId),
      ]);

      setNotes(notesData.results);
      setTotalCount(notesData.count);
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load organization data'));
      setNotes([]);
      setTotalCount(0);
      setUsers(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = useCallback(async (orgId: string, silently = false) => {
    if (!silently) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const usersData = await OrganizationService.getOrganizationUsers(orgId);
      setUsers(usersData);
    } catch (err) {
      if (!silently) {
        setError(err instanceof Error ? err : new Error('Failed to load organization users'));
      } else {
        console.error('Failed to silently refresh users:', err);
      }
    } finally {
      if (!silently) {
        setIsLoading(false);
      }
    }
  }, []);

  const refreshUsers = useCallback(
    async (silently = false) => {
      if (!selectedOrg?.id) {
        if (!silently) {
          setError(new Error('No organization ID provided'));
        }
        return;
      }
      await fetchUsers(selectedOrg.id.toString(), silently);
    },
    [selectedOrg?.id, fetchUsers]
  );

  const refresh = useCallback(async () => {
    if (!selectedOrg?.slug || !selectedOrg?.id) {
      setError(new Error('No organization information provided'));
      return;
    }
    await fetchData(selectedOrg.slug, selectedOrg.id.toString());
  }, [selectedOrg?.slug, selectedOrg?.id]);

  useEffect(() => {
    if (isLoadingOrg) {
      setIsLoading(true);
      return;
    } else if (!selectedOrg) {
      setNotes([]);
      setTotalCount(0);
      setUsers(null);
      setError(null);
      setIsLoading(false);
      return;
    }
    console.log('fetching Org DATA');
    console.log({ slug: selectedOrg.slug, id: selectedOrg.id });

    fetchData(selectedOrg.slug, selectedOrg.id.toString());
  }, [selectedOrg?.slug, selectedOrg?.id, isLoadingOrg]);

  const value = {
    notes,
    setNotes,
    users,
    isLoading,
    error,
    totalCount,
    refresh,
    refreshUsers,
  };

  return (
    <OrganizationDataContext.Provider value={value}>{children}</OrganizationDataContext.Provider>
  );
}

export function useOrganizationDataContext() {
  const context = useContext(OrganizationDataContext);
  if (!context) {
    throw new Error('useOrganizationDataContext must be used within an OrganizationDataProvider');
  }
  return context;
}
