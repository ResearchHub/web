'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Modal } from '@/components/ui/form/Modal';
import { isValidEmail } from '@/utils/validation';

export interface BulkSendEmailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSending: boolean;
  replyTo: string;
  onReplyToChange: (value: string) => void;
  onConfirm: () => void;
}

export function BulkSendEmailsModal({
  isOpen,
  onClose,
  isSending,
  replyTo,
  onReplyToChange,
  onConfirm,
}: BulkSendEmailsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={() => !isSending && onClose()} title="Send emails to experts?">
      <div className="mb-4">
        <Input
          label="Reply To"
          type="email"
          value={replyTo}
          onChange={(e) => onReplyToChange(e.target.value)}
          placeholder="Email address for replies"
          helperText="When experts hit Reply, their response goes to this address. Defaults to your account email; change it if you want replies elsewhere."
          error={
            replyTo.trim() && !isValidEmail(replyTo.trim())
              ? 'Please enter a valid email address'
              : undefined
          }
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outlined" size="sm" onClick={onClose} disabled={isSending}>
          Cancel
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onConfirm}
          disabled={isSending || !replyTo.trim() || !isValidEmail(replyTo.trim())}
        >
          {isSending ? 'Sending…' : 'Confirm'}
        </Button>
      </div>
    </Modal>
  );
}
