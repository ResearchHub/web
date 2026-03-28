'use client';

import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/form/Modal';
import { cn } from '@/utils/styles';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  /** Applied to the description wrapper (default `mb-4`) */
  descriptionClassName?: string;
  children?: ReactNode;
  cancelLabel?: string;
  confirmLabel: string;
  confirmVariant?: 'default' | 'destructive';
  confirmClassName?: string;
  confirmIcon?: ReactNode;
  isConfirming?: boolean;
  /**
   * When true (default), cancel, backdrop, and the header close control do nothing while
   * `isConfirming` is true.
   */
  blockDismissWhileConfirming?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  title,
  description,
  descriptionClassName,
  children,
  cancelLabel = 'Cancel',
  confirmLabel,
  confirmVariant = 'default',
  confirmClassName,
  confirmIcon,
  isConfirming = false,
  blockDismissWhileConfirming = true,
  onConfirm,
}: ConfirmationModalProps) {
  const dismissBlocked = isConfirming && blockDismissWhileConfirming;

  const handleModalClose = () => {
    if (dismissBlocked) return;
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} title={title}>
      {description != null ? (
        <div className={cn('text-sm text-gray-600', descriptionClassName ?? 'mb-4')}>
          {description}
        </div>
      ) : null}
      {children}
      <div className="flex justify-end gap-2">
        <Button variant="outlined" size="sm" onClick={onClose} disabled={dismissBlocked}>
          {cancelLabel}
        </Button>
        <Button
          variant={confirmVariant}
          size="sm"
          onClick={() => void Promise.resolve(onConfirm())}
          disabled={isConfirming}
          className={cn('gap-2', confirmClassName)}
        >
          {isConfirming ? (
            <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
          ) : (
            confirmIcon
          )}
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
