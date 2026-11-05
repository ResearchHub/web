'use client';

import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';

interface ChatMenuProps {
  readonly title: string;
  readonly onRename: () => void;
  /** Called only after the user confirms. */
  readonly onDelete: () => void;
  readonly className?: string;
}

/**
 * The open chat's ellipsis menu: rename inline, or delete behind a
 * confirmation. Deleting a chat never touches its document.
 */
export function ChatMenu({ title, onRename, onDelete, className }: ChatMenuProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <BaseMenu
        align="end"
        trigger={
          <button
            type="button"
            aria-label="Chat options"
            title="Chat options"
            className={cn(
              'flex h-[34px] w-[34px] items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900',
              className
            )}
          >
            <MoreHorizontal className="h-[18px] w-[18px]" aria-hidden="true" />
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

      <BaseModal
        isOpen={confirming}
        onClose={() => setConfirming(false)}
        title="Delete chat?"
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
                onDelete();
              }}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          “{title}” and its messages will be deleted. The document stays as it is.
        </p>
      </BaseModal>
    </>
  );
}
