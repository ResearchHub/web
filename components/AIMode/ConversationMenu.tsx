'use client';

import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';

interface ConversationMenuProps {
  readonly title: string;
  readonly onRename: () => void;
  /** Called only after the user confirms. */
  readonly onDelete: () => void;
  readonly className?: string;
}

/**
 * The ellipsis menu for one conversation — rename inline, or delete behind a
 * confirmation. Shared by the sidebar rows and the chat header so the two
 * places offer exactly the same actions.
 */
export function ConversationMenu({ title, onRename, onDelete, className }: ConversationMenuProps) {
  const [confirming, setConfirming] = useState(false);

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
                onDelete();
              }}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          “{title}” and its messages will be deleted. Any document it created stays in your
          notebook.
        </p>
      </BaseModal>
    </>
  );
}
