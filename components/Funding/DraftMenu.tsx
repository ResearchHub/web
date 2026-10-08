'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { DeleteDraftModal } from '@/components/modals/DeleteDraftModal';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { useFundingDocuments } from '@/contexts/FundingDocumentsContext';
import { NoteService } from '@/services/note.service';
import type { ID } from '@/types/root';
import { cn } from '@/utils/styles';

interface DraftMenuProps {
  readonly noteId: ID;
  readonly title: string;
  /** It is the document open in the workspace, so deleting it leaves for My Funding. */
  readonly isOpen?: boolean;
  /** Classes for the ⋯ button, which each place sizes and reveals its own way. */
  readonly triggerClassName?: string;
}

/**
 * A draft's ⋯ menu, in the sidebar and beside the open document's title:
 * delete, behind a confirmation. The draft leaves the sidebar at once, and
 * deleting the one open in the workspace goes to My Funding.
 */
export function DraftMenu({ noteId, title, isOpen = false, triggerClassName }: DraftMenuProps) {
  const router = useRouter();
  const { remove } = useFundingDocuments();
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await NoteService.deleteNote(noteId);
      setConfirming(false);
      remove(noteId);
      if (isOpen) router.push('/my-funding');
      toast.success('Draft deleted');
    } catch {
      toast.error('Couldn’t delete the draft. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <BaseMenu
        align="start"
        sideOffset={4}
        className="w-40 rounded-xl p-1"
        trigger={
          <button
            type="button"
            aria-label={`Options for ${title}`}
            title="Options"
            className={cn(
              'flex items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-200/70 hover:text-gray-900',
              triggerClassName
            )}
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </button>
        }
      >
        <BaseMenuItem
          onSelect={() => setConfirming(true)}
          className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-700"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Delete
        </BaseMenuItem>
      </BaseMenu>

      <DeleteDraftModal
        isOpen={confirming}
        title={title}
        isDeleting={isDeleting}
        onClose={() => setConfirming(false)}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
