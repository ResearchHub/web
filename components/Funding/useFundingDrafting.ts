'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useOptionalAIMode } from '@/components/AIMode/AIModeContext';
import { useUser } from '@/contexts/UserContext';
import type { Note } from '@/types/note';
import { isHubEditorOrModerator } from '@/utils/permissions';
import type { FundingIntent } from './fundingDirection';

export interface FundingDrafting {
  /** This user drafts in the workspace; everyone else still has the notebook editor. */
  readonly inWorkspace: boolean;
  /** Start a new RFP (`fund`) or proposal (`need_funding`). */
  readonly startNew: (intent: FundingIntent) => void;
  /** Pick a draft back up. */
  readonly openDraft: (note: Pick<Note, 'id' | 'organization'>) => void;
}

/**
 * Where drafting happens for this user: the workspace, for the moderators
 * and hub editors it admits, or the notebook editor for everyone else. One
 * answer for every door — the Publish menu, the New RFP and New proposal
 * buttons on My Funding, a draft's row.
 */
export function useFundingDrafting(): FundingDrafting {
  const router = useRouter();
  const aiMode = useOptionalAIMode();
  const { user } = useUser();
  const workspace = aiMode != null && isHubEditorOrModerator(user) ? aiMode : null;

  return useMemo(
    () => ({
      inWorkspace: workspace != null,
      startNew: (intent) => {
        if (workspace) workspace.openFor(intent);
        else
          router.push(intent === 'fund' ? '/notebook?newGrant=true' : '/notebook?newFunding=true');
      },
      openDraft: (note) => {
        if (workspace) workspace.selectDocument(note.id);
        else router.push(`/notebook/${note.organization.slug}/${note.id}`);
      },
    }),
    [workspace, router]
  );
}
