'use client';

import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Modal } from '@/components/ui/form/Modal';
import { isValidEmail } from '@/utils/validation';

const DEFAULT_REPLY_TO_HELPER = 'When experts hit Reply, their response goes to this address.';

export interface ReplyToEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Disables inputs, confirm, and blocking close while true */
  isSubmitting: boolean;
  title: string;
  /** Shown above the Reply To field (optional) */
  description?: ReactNode;
  replyTo: string;
  onReplyToChange: (value: string) => void;
  /** Parent performs send/preview API call */
  onConfirm: () => void;
  confirmLabel?: string;
  /** Used on the confirm button while submitting when `confirmIcon` is not set */
  submittingLabel?: string;
  /** Idle icon before label; replaced by a spinner while submitting */
  confirmIcon?: ReactNode;
  replyToHelperText?: string;
  cancelLabel?: string;
}

export function ReplyToEmailModal({
  isOpen,
  onClose,
  isSubmitting,
  title,
  description,
  replyTo,
  onReplyToChange,
  onConfirm,
  confirmLabel = 'Send',
  submittingLabel = 'Sending…',
  confirmIcon,
  replyToHelperText = DEFAULT_REPLY_TO_HELPER,
  cancelLabel = 'Cancel',
}: ReplyToEmailModalProps) {
  const replyValid = replyTo.trim() && isValidEmail(replyTo.trim());
  const canSubmit = !isSubmitting && replyValid;

  return (
    <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()} title={title}>
      {description != null ? <div className="text-sm text-gray-600 mb-4">{description}</div> : null}
      <div className="mb-4">
        <Input
          label="Reply To"
          type="email"
          value={replyTo}
          onChange={(e) => onReplyToChange(e.target.value)}
          placeholder="Email address for replies"
          helperText={replyToHelperText}
          error={
            replyTo.trim() && !isValidEmail(replyTo.trim())
              ? 'Please enter a valid email address'
              : undefined
          }
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outlined" size="sm" onClick={onClose} disabled={isSubmitting}>
          {cancelLabel}
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onConfirm}
          disabled={!canSubmit}
          className="gap-2"
        >
          {isSubmitting ? (
            confirmIcon ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                {confirmLabel}
              </>
            ) : (
              submittingLabel
            )
          ) : (
            <>
              {confirmIcon}
              {confirmLabel}
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
}
