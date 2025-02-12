'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { NoteService } from '@/services/note.service';
import type { Note } from '@/types/note';
import { useOrganizationContext } from './OrganizationContext';

interface OrganizationNotesContextType {
  notes: Note[];
  isLoading: boolean;
  error: Error | null;
  totalCount: number;
}

const OrganizationNotesContext = createContext<OrganizationNotesContextType | null>(null);

export function OrganizationNotesProvider({ children }: { children: ReactNode }) {
  const { selectedOrg } = useOrganizationContext();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchNotes = async () => {
      if (!selectedOrg) {
        setNotes([]);
        setTotalCount(0);
        setError(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await NoteService.getOrganizationNotes(selectedOrg.slug);

        if (!isMounted) return;

        setNotes(data.results);
        setTotalCount(data.count);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err : new Error('Failed to load notes'));
        setNotes([]);
        setTotalCount(0);
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    fetchNotes();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [selectedOrg?.slug]);

  const value = {
    notes,
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
