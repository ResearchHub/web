'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/form/Modal';
import { Textarea } from '@/components/ui/form/Textarea';

export interface CloseGeneratedEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  notes: string;
  onNotesChange: (value: string) => void;
  onConfirm: () => void;
}

export function CloseGeneratedEmailModal({
  isOpen,
  onClose,
  isSubmitting,
  notes,
  onNotesChange,
  onConfirm,
}: CloseGeneratedEmailModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()} title="Mark as closed?">
      <p className="text-sm text-gray-600 mb-3">
        This retires the generated email (inactive). You can add an optional note for your team.
      </p>
      <Textarea
        label="Notes (optional)"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="e.g. Replaced by outreach email id 456"
        rows={3}
        className="mb-4"
      />
      <div className="flex justify-end gap-2">
        <Button variant="outlined" size="sm" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="default" size="sm" onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : 'Mark closed'}
        </Button>
      </div>
    </Modal>
  );
}
