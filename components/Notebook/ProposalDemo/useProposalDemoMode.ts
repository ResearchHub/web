'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useNotebookContext } from '@/contexts/NotebookContext';

// Query param the proposal-demo flow appends when redirecting to the editor.
// Once seen for a note, we persist it in sessionStorage so the demo experience
// survives reloads (where the param may be gone) within the same session.
const PROPOSAL_DEMO_PARAM = 'proposalDemo';

export const proposalDemoSessionKey = (noteId: string | number) => `proposal-demo-note-${noteId}`;

/**
 * Detects whether the currently open note is the proposal-demo note, and
 * exposes an escape hatch back to the regular notebook editor.
 */
export function useProposalDemoMode() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeNoteId } = useNotebookContext();

  const paramActive = searchParams?.get(PROPOSAL_DEMO_PARAM) === 'true';

  // Initialize from the query param synchronously so the first-load redirect
  // renders the demo shell immediately (no flash of the regular notebook).
  const [isProposalDemo, setIsProposalDemo] = useState(paramActive && Boolean(activeNoteId));

  useEffect(() => {
    if (!activeNoteId) {
      setIsProposalDemo(false);
      return;
    }
    const key = proposalDemoSessionKey(activeNoteId);
    if (paramActive) {
      window.sessionStorage.setItem(key, 'true');
      setIsProposalDemo(true);
    } else {
      setIsProposalDemo(window.sessionStorage.getItem(key) === 'true');
    }
  }, [activeNoteId, paramActive]);

  // Leave the demo for good: clear the sticky session flags and strip the
  // query param so the regular notebook editor takes over for this note.
  const exitDemo = useCallback(() => {
    if (activeNoteId) {
      const key = proposalDemoSessionKey(activeNoteId);
      window.sessionStorage.removeItem(key);
      window.sessionStorage.removeItem(`${key}-intro`);
    }
    setIsProposalDemo(false);
    if (paramActive) {
      router.replace(window.location.pathname);
    }
  }, [activeNoteId, paramActive, router]);

  return { isProposalDemo, exitDemo };
}
