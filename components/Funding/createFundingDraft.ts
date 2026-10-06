import type { JSONContent } from '@tiptap/core';
import { getTemplatePlainText } from '@/components/Editor/lib/utils/documentTitle';
import { NoteService } from '@/services/note.service';
import type { Note, NoteAccess } from '@/types/note';
import type { ID } from '@/types/root';
import type { FundingIntent } from './fundingDirection';

/** The note's document type for each side of the money. */
export const DOCUMENT_TYPE_BY_INTENT: Record<FundingIntent, string> = {
  fund: 'GRANT',
  need_funding: 'PREREGISTRATION',
};

export interface CreateFundingDraftOptions {
  readonly orgSlug: string;
  readonly title: string;
  /** `GRANT`, `PREREGISTRATION`, or the notebook's changelog `DISCUSSION`. */
  readonly documentType: string;
  /** `WORKSPACE` shares it with the organization; `PRIVATE` keeps it to its author. */
  readonly grouping: NoteAccess;
  /** The Request for Proposals a proposal answers. */
  readonly selectedGrantId?: Exclude<ID, null | undefined> | null;
  /** What the document starts with; without one it starts empty. */
  readonly template?: JSONContent;
  /**
   * A note an earlier attempt created before a later step failed: the
   * creation resumes on it instead of making a second one.
   */
  readonly existingNote?: Note | null;
  /** The note exists; runs before the later steps, so a caller can keep it for a retry. */
  readonly onNoteCreated?: (note: Note) => void;
}

/**
 * A new draft: the note, then the RFP it answers, then its first content.
 * Shared by the notebook, which starts drafts from templates, and the
 * workspace, which starts them empty for the assistant to write. Throws if
 * any step fails; the steps after creation can be run again.
 */
export async function createFundingDraft({
  orgSlug,
  title,
  documentType,
  grouping,
  selectedGrantId,
  template,
  existingNote,
  onNoteCreated,
}: CreateFundingDraftOptions): Promise<Note> {
  let note = existingNote ?? null;
  if (note == null) {
    note = await NoteService.createNote({
      title,
      grouping,
      organization_slug: orgSlug,
      document_type: documentType,
    });
    onNoteCreated?.(note);
  }

  if (selectedGrantId) {
    await NoteService.updateNote({ noteId: note.id, selectedGrantId });
  }

  if (template) {
    await NoteService.updateNoteContent({
      note: note.id,
      full_json: JSON.stringify(template),
      plain_text: getTemplatePlainText(template),
    });
  }

  return note;
}
