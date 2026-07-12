'use client';

import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Modal } from '@/components/ui/form/Modal';
import {
  parseAndValidateReplyToInput,
  REPLY_TO_MAX,
} from '@/app/expert-finder/lib/parseReplyToAddresses';

/** Modal to confirm a send/preview action; collects Reply-To for the API. */
export interface SendConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  title: string;
  /** Shown above the Reply To field (optional) */
  description?: ReactNode;
  replyTo: string;
  onReplyToChange: (value: string) => void;
  onConfirm: () => void;
  confirmLabel?: string;
  submittingLabel?: string;
  confirmIcon?: ReactNode;
  cancelLabel?: string;
}

export function SendConfirmationModal({
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
  cancelLabel = 'Cancel',
}: SendConfirmationModalProps) {
  const replyValidation = parseAndValidateReplyToInput(replyTo);
  const replyError = replyTo.trim() && !replyValidation.valid ? replyValidation.error : undefined;
  const canSubmit = !isSubmitting && replyValidation.valid;

  return (
    <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()} title={title}>
      {description != null ? <div className="text-sm text-gray-600 mb-4">{description}</div> : null}
      <div className="mb-4">
        <Input
          label="Reply To"
          type="text"
          value={replyTo}
          onChange={(e) => onReplyToChange(e.target.value)}
          placeholder="you@example.com"
          helperText={`When experts hit Reply, their response goes to these addresses. Separate multiple with commas (max ${REPLY_TO_MAX}).`}
          error={replyError}
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
