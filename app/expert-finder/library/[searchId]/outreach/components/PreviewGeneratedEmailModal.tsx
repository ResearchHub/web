'use client';

import { Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Modal } from '@/components/ui/form/Modal';
import { isValidEmail } from '@/utils/validation';

export interface PreviewGeneratedEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSending: boolean;
  replyTo: string;
  onReplyToChange: (value: string) => void;
  onConfirm: () => void;
}

export function PreviewGeneratedEmailModal({
  isOpen,
  onClose,
  isSending,
  replyTo,
  onReplyToChange,
  onConfirm,
}: PreviewGeneratedEmailModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={() => !isSending && onClose()} title="Send test email">
      <p className="text-sm text-gray-600 mb-4">
        A test copy is sent to your inbox. Reply To is included on the message for the preview send
        (same as when sending to the expert).
      </p>
      <div className="mb-4">
        <Input
          label="Reply To"
          type="email"
          value={replyTo}
          onChange={(e) => onReplyToChange(e.target.value)}
          placeholder="Email address for replies"
          helperText="When experts hit Reply, their response goes to this address."
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
          className="gap-2"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Eye className="h-4 w-4" aria-hidden />
          )}
          Send
        </Button>
      </div>
    </Modal>
  );
}
