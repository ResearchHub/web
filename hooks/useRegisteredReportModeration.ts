'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { NoteError, NoteService } from '@/services/note.service';
import {
  type RegisteredReportCandidates,
  RegisteredReportModerationError,
  RegisteredReportModerationService,
} from '@/services/registered-report-moderation.service';
import type { FeedEntry } from '@/types/feed';

export interface DraftOperation {
  proposalId: number;
  noteId?: number;
  isProcessing: boolean;
}

interface UseRegisteredReportModerationResult {
  entries: FeedEntry[];
  draftOperation: DraftOperation | null;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  loadError: string | null;
  loadMoreError: string | null;
  accessError: string | null;
  refreshCandidates: () => Promise<void>;
  loadMoreCandidates: () => Promise<void>;
  openOrCreateDraft: (proposalId: number) => Promise<void>;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function isModeratorAccessError(error: unknown): boolean {
  return (
    (error instanceof RegisteredReportModerationError || error instanceof NoteError) &&
    (error.status === 401 || error.status === 403)
  );
}

function getDraftFailureMessage(error: unknown, noteId?: number): string {
  if (isModeratorAccessError(error)) {
    return getErrorMessage(error, 'Moderator access is required for this workflow.');
  }

  if (noteId) {
    return 'The draft was created, but could not be opened. Please try again.';
  }

  return getErrorMessage(error, 'Failed to create the Registered Report draft.');
}

export function useRegisteredReportModeration(): UseRegisteredReportModerationResult {
  const router = useRouter();
  const { organizations, setSelectedOrg } = useOrganizationContext();
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [draftOperation, setDraftOperation] = useState<DraftOperation | null>(null);
  const [currentResponse, setCurrentResponse] = useState<RegisteredReportCandidates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);

  const loadCandidates = useCallback(async (nextUrl: string | null, replaceEntries: boolean) => {
    if (replaceEntries) {
      setIsLoading(true);
      setCurrentResponse(null);
    } else {
      setIsLoadingMore(true);
    }
    setLoadError(null);
    setLoadMoreError(null);

    try {
      const response = await RegisteredReportModerationService.fetchCandidates(
        nextUrl ?? undefined
      );
      setEntries((currentEntries) =>
        replaceEntries ? response.entries : [...currentEntries, ...response.entries]
      );
      setCurrentResponse(response);
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Failed to load eligible proposals. Please try again.'
      );

      if (isModeratorAccessError(error)) {
        setAccessError(message);
      } else if (replaceEntries) {
        setLoadError(message);
      } else {
        setLoadMoreError(message);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  const refreshCandidates = useCallback(() => loadCandidates(null, true), [loadCandidates]);

  useEffect(() => {
    void refreshCandidates();
  }, [refreshCandidates]);

  const loadMoreCandidates = useCallback(async () => {
    if (!currentResponse?.next || isLoading || isLoadingMore || draftOperation?.isProcessing)
      return;

    await loadCandidates(currentResponse.next, false);
  }, [currentResponse, draftOperation?.isProcessing, isLoading, isLoadingMore, loadCandidates]);

  const openOrCreateDraft = useCallback(
    async (proposalId: number) => {
      if (draftOperation?.isProcessing) return;

      const previousDraft = draftOperation;
      let noteId = previousDraft?.proposalId === proposalId ? previousDraft.noteId : undefined;

      if (previousDraft?.noteId && previousDraft.proposalId !== proposalId) {
        setEntries((currentEntries) =>
          currentEntries.filter((entry) => entry.content.id !== previousDraft.proposalId)
        );
      }

      setDraftOperation({ proposalId, noteId, isProcessing: true });

      try {
        noteId ??= await RegisteredReportModerationService.createDraft(proposalId);

        const note = await NoteService.getNote(noteId.toString());
        if (note.id !== noteId || note.proposalId !== proposalId || !note.organization?.slug) {
          throw new Error('The Registered Report draft response did not match the created note.');
        }

        const organization =
          organizations.find(({ id }) => id === note.organization.id) ?? note.organization;
        setSelectedOrg(organization);
        setEntries((currentEntries) =>
          currentEntries.filter((entry) => entry.content.id !== proposalId)
        );
        router.replace(`/notebook/${organization.slug}/${noteId}`);
      } catch (error) {
        const accessDenied = isModeratorAccessError(error);
        const message = getDraftFailureMessage(error, noteId);

        if (accessDenied) {
          setAccessError(message);
        } else {
          toast.error(message);
        }

        if (!noteId && !accessDenied) {
          await refreshCandidates();
        }

        setDraftOperation(noteId ? { proposalId, noteId, isProcessing: false } : null);
      }
    },
    [draftOperation, organizations, refreshCandidates, router, setSelectedOrg]
  );

  return {
    entries,
    draftOperation,
    hasMore: Boolean(currentResponse?.next),
    isLoading,
    isLoadingMore,
    loadError,
    loadMoreError,
    accessError,
    refreshCandidates,
    loadMoreCandidates,
    openOrCreateDraft,
  };
}
