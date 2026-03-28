'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/form/Modal';
import { ExpertFinderService } from '@/services/expertFinder.service';

export interface BulkMarkAsSentModalProps {
  isOpen: boolean;
  onClose: () => void;
  draftIds: number[];
  /** After a finished batch (including partial success); list can refetch and clear selection */
  onSuccess?: () => void | Promise<void>;
}

export function BulkMarkAsSentModal({
  isOpen,
  onClose,
  draftIds,
  onSuccess,
}: BulkMarkAsSentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const draftCount = draftIds.length;

  useEffect(() => {
    if (!isOpen) setIsLoading(false);
  }, [isOpen]);

  const handleConfirm = useCallback(async () => {
    if (draftIds.length === 0) return;
    setIsLoading(true);
    try {
      const results = await Promise.allSettled(
        draftIds.map((id) => ExpertFinderService.updateEmail(id, { status: 'sent' }))
      );
      const ok = results.filter((r) => r.status === 'fulfilled').length;
      const bad = results.length - ok;
      if (bad === 0) {
        toast.success(`Marked ${ok} email(s) as sent.`);
      } else {
        toast.error(`Marked ${ok} as sent; ${bad} failed.`);
      }
      await onSuccess?.();
      onClose();
    } catch {
      toast.error('Failed to update emails.');
    } finally {
      setIsLoading(false);
    }
  }, [draftIds, onClose, onSuccess]);

  return (
    <Modal isOpen={isOpen} onClose={() => !isLoading && onClose()} title="Mark selected as sent?">
      <p className="text-sm text-gray-600 mb-4">
        {draftCount} draft{draftCount === 1 ? '' : 's'} will be marked as sent.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="outlined" size="sm" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="default"
          size="sm"
          className="gap-2 bg-amber-500 hover:bg-amber-600"
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Mail className="h-4 w-4" aria-hidden />
          )}
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
