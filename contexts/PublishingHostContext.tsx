'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Editor } from '@tiptap/react';
import type { NoteDetailsSaver } from '@/hooks/useNoteDetailsSaver';
import type { NoteWithContent } from '@/types/note';

/** The work types a host can preselect for a note that has no post yet. */
export type PublishingDefaultArticleType = 'preregistration' | 'grant';

/**
 * What the publishing form needs from whoever hosts it: the note, the live
 * editor holding its content, and the note's single details writer. The
 * notebook page and the AI Mode document pane both host the form; this is
 * the seam between them so the form itself knows nothing about either.
 */
export interface PublishingHost {
  readonly note: NoteWithContent | null;
  readonly editor: Editor | null;
  readonly isLoading: boolean;
  readonly saveDetailsSoon: NoteDetailsSaver['saveDetailsSoon'];
  readonly saveDetailsNow: NoteDetailsSaver['saveDetailsNow'];
  /**
   * Work type to preselect when the note carries none of its own — the AI
   * Mode surface knows whether a conversation set out to write a proposal
   * or a request for proposals.
   */
  readonly defaultArticleType?: PublishingDefaultArticleType | null;
}

const PublishingHostContext = createContext<PublishingHost | null>(null);

export function PublishingHostProvider({
  value,
  children,
}: {
  readonly value: PublishingHost;
  readonly children: ReactNode;
}) {
  return <PublishingHostContext.Provider value={value}>{children}</PublishingHostContext.Provider>;
}

export function usePublishingHost(): PublishingHost {
  const host = useContext(PublishingHostContext);
  if (!host) {
    throw new Error('usePublishingHost must be used within PublishingHostProvider');
  }
  return host;
}
