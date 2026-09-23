'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Editor } from '@tiptap/react';
import type { NoteDetailsSaver } from '@/hooks/useNoteDetailsSaver';
import type { NoteWithContent } from '@/types/note';

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
   * The work was published and the app is about to leave for its page. A
   * host that sits over the page — the workspace — steps aside here so the
   * user watches the page arrive instead of a frozen "Redirecting…".
   */
  readonly onPublished?: () => void;
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
