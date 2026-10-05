'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useOptionalAIMode } from '@/components/AIMode/AIModeContext';
import {
  documentTarget,
  newConversationTarget,
  workspaceHref,
  type WorkspaceTarget,
} from '@/components/AIMode/workspaceUrl';
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
 * Where drafting happens for this user: the workspace page, for the
 * moderators and hub editors it admits, or the notebook editor for everyone
 * else. One answer for every door — the Publish menu, the New RFP and New
 * proposal buttons on My Funding, a draft's row.
 */
export function useFundingDrafting(): FundingDrafting {
  const router = useRouter();
  // Non-null only on the workspace page itself, where a door changes what is
  // open in place rather than navigating to where it already is.
  const openWorkspace = useOptionalAIMode();
  const { user } = useUser();
  const inWorkspace = isHubEditorOrModerator(user);

  return useMemo(() => {
    const goTo = (target: WorkspaceTarget) => {
      if (openWorkspace) openWorkspace.selectTarget(target);
      else router.push(workspaceHref(target));
    };
    return {
      inWorkspace,
      startNew: (intent) => {
        if (inWorkspace) goTo(newConversationTarget(intent));
        else
          router.push(intent === 'fund' ? '/notebook?newGrant=true' : '/notebook?newFunding=true');
      },
      openDraft: (note) => {
        if (inWorkspace) goTo(documentTarget(note.id));
        else router.push(`/notebook/${note.organization.slug}/${note.id}`);
      },
    };
  }, [inWorkspace, openWorkspace, router]);
}
