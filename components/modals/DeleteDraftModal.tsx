'use client';

import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';

interface DeleteDraftModalProps {
  readonly isOpen: boolean;
  readonly title: string;
  readonly isDeleting: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}

/** Asks before a draft RFP or proposal is deleted for good. */
export function DeleteDraftModal({
  isOpen,
  title,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteDraftModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete draft?"
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outlined" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-gray-600">“{title}” will be deleted. This can’t be undone.</p>
    </BaseModal>
  );
}
