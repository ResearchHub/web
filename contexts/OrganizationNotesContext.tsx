'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { NoteService } from '@/services/note.service';
import type { Note } from '@/types/note';
import { useOrganizationContext } from './OrganizationContext';

interface OrganizationNotesContextType {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  isLoading: boolean;
  error: Error | null;
  totalCount: number;
}

const OrganizationNotesContext = createContext<OrganizationNotesContextType | null>(null);

export function OrganizationNotesProvider({ children }: { children: ReactNode }) {
  const { selectedOrg, isLoading: isLoadingOrg } = useOrganizationContext();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchNotes = async (slug?: string) => {
    try {
      if (!slug) {
        throw new Error('No organization slug provided');
      }

      setIsLoading(true);
      setError(null);
      const data = await NoteService.getOrganizationNotes(slug);
      setNotes(data.results);
      setTotalCount(data.count);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load notes'));
      setNotes([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoadingOrg) {
      setIsLoading(true);
      return;
    } else if (!selectedOrg) {
      setNotes([]);
      setTotalCount(0);
      setError(null);
      setIsLoading(false);
      return;
    }

    fetchNotes(selectedOrg.slug);
  }, [selectedOrg?.slug, isLoadingOrg]);

  const value = {
    notes,
    setNotes,
    isLoading,
    error,
    totalCount,
  };

  return (
    <OrganizationNotesContext.Provider value={value}>{children}</OrganizationNotesContext.Provider>
  );
}

export function useOrganizationNotesContext() {
  const context = useContext(OrganizationNotesContext);
  if (!context) {
    throw new Error('useOrganizationNotesContext must be used within an OrganizationNotesProvider');
  }
  return context;
}
