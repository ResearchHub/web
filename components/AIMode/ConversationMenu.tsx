'use client';

import { useEffect, useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { ChatNoteRef } from '@/types/agentChat';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';

interface ConversationMenuProps {
  readonly title: string;
  readonly onRename: () => void;
  /** Called only after the user confirms, with whether to delete the notes too. */
  readonly onDelete: (options: { deleteNotes: boolean }) => void;
  /** The notes the conversation created; offered for deletion when any exist. */
  readonly loadNotes?: () => Promise<ChatNoteRef[]>;
  readonly className?: string;
}

/**
 * The ellipsis menu for one conversation — rename inline, or delete behind a
 * confirmation. Shared by the sidebar rows and the chat header so the two
 * places offer exactly the same actions.
 */
export function ConversationMenu({
  title,
  onRename,
  onDelete,
  loadNotes,
  className,
}: ConversationMenuProps) {
  const [confirming, setConfirming] = useState(false);
  // The notes are looked up when the dialog opens, so a row whose detail was
  // never loaded still gets the offer — and only the offer when there is
  // something to delete. Off by default: the note is the user's work.
  const [notes, setNotes] = useState<ChatNoteRef[] | null>(null);
  const [deleteNotes, setDeleteNotes] = useState(false);
  useEffect(() => {
    if (!confirming) return;
    setNotes(null);
    setDeleteNotes(false);
    let cancelled = false;
    (loadNotes ? loadNotes() : Promise.resolve([]))
      .then((loaded) => {
        if (!cancelled) setNotes(loaded);
      })
      .catch(() => {
        if (!cancelled) setNotes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [confirming, loadNotes]);
  const noteTitle = notes?.[0]?.title?.trim();

  return (
    <>
      <BaseMenu
        align="end"
        trigger={
          <button
            type="button"
            aria-label="Conversation options"
            className={cn(
              'rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-200/70 hover:text-gray-700',
              className
            )}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        }
      >
        <BaseMenuItem onSelect={onRename} className="gap-2 text-gray-700">
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          Rename
        </BaseMenuItem>
        <BaseMenuItem
          onSelect={() => setConfirming(true)}
          className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-700"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Delete
        </BaseMenuItem>
      </BaseMenu>

      {/* BaseModal, not Modal: it stacks at 9999, above the AI Mode overlay. */}
      <BaseModal
        isOpen={confirming}
        onClose={() => setConfirming(false)}
        title="Delete conversation?"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outlined" size="sm" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                setConfirming(false);
                onDelete({ deleteNotes: deleteNotes && (notes?.length ?? 0) > 0 });
              }}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">“{title}” and its messages will be deleted.</p>
        {notes && notes.length > 0 ? (
          <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={deleteNotes}
              onChange={(event) => setDeleteNotes(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-primary-600"
            />
            <span>
              Also delete the document it created
              {noteTitle ? <span className="text-gray-500">, “{noteTitle}”</span> : null}. Otherwise
              it stays in your notebook.
            </span>
          </label>
        ) : notes == null && loadNotes ? (
          <p className="mt-3 text-xs text-gray-400">Checking for a document…</p>
        ) : null}
      </BaseModal>
    </>
  );
}
