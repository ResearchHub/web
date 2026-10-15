'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useOptionalAIMode } from '@/components/AIMode/AIModeContext';
import {
  documentTarget,
  newDraftTarget,
  workspaceHref,
  type DocumentChat,
  type WorkspaceTarget,
} from '@/components/AIMode/workspaceUrl';
import type { Note } from '@/types/note';
import type { FundingIntent } from './fundingDirection';

export interface FundingDrafting {
  /** Start a new RFP (`fund`) or proposal (`need_funding`). */
  readonly startNew: (intent: FundingIntent) => void;
  /** Pick a draft back up, or open a published document. */
  readonly openDraft: (note: Pick<Note, 'id' | 'latestChatId'>) => void;
}

/**
 * The chat a document opens on. Its row in the documents listing says which
 * of its chats is the most recent, or that it has none, so the workspace
 * opens straight on it; without that, on its most recent chat once the
 * workspace has loaded its chats to find it.
 */
function chatToOpen(note: Pick<Note, 'latestChatId'>): DocumentChat {
  if (note.latestChatId === undefined) return 'latest';
  return note.latestChatId ?? 'new';
}

/**
 * Drafting happens in the workspace. One answer for every door — the Publish
 * menu, the Drafts "+" in the sidebar, My Funding's New RFP and New proposal
 * buttons, a document's row.
 */
export function useFundingDrafting(): FundingDrafting {
  const router = useRouter();
  // Non-null only on the workspace page itself, where a door changes what is
  // open in place rather than navigating to where it already is.
  const openWorkspace = useOptionalAIMode();

  return useMemo(() => {
    const goTo = (target: WorkspaceTarget) => {
      if (openWorkspace) openWorkspace.selectTarget(target);
      else router.push(workspaceHref(target));
    };
    return {
      startNew: (intent) => goTo(newDraftTarget(intent)),
      openDraft: (note) => goTo(documentTarget(note.id, chatToOpen(note))),
    };
  }, [openWorkspace, router]);
}
