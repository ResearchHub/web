'use client';

import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/form/Modal';

export interface DeleteGeneratedEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDeleting: boolean;
  onConfirm: () => void;
}

export function DeleteGeneratedEmailModal({
  isOpen,
  onClose,
  isDeleting,
  onConfirm,
}: DeleteGeneratedEmailModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={() => !isDeleting && onClose()} title="Delete email?">
      <p className="text-sm text-gray-600 mb-4">This draft will be permanently removed.</p>
      <div className="flex justify-end gap-2">
        <Button variant="outlined" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onConfirm}
          disabled={isDeleting}
          className="gap-2"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Trash2 className="h-4 w-4" aria-hidden />
          )}
          Delete
        </Button>
      </div>
    </Modal>
  );
}
