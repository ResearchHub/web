'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/form/Modal';
import { ExpertFinderService } from '@/services/expertFinder.service';

export interface BulkDeleteOutreachDraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  draftIds: number[];
  onSuccess?: () => void | Promise<void>;
}

export function BulkDeleteOutreachDraftsModal({
  isOpen,
  onClose,
  draftIds,
  onSuccess,
}: BulkDeleteOutreachDraftsModalProps) {
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
        draftIds.map((id) => ExpertFinderService.deleteEmail(id))
      );
      const ok = results.filter((r) => r.status === 'fulfilled').length;
      const bad = results.length - ok;
      if (bad === 0) {
        toast.success(`Deleted ${ok} draft(s).`);
      } else {
        toast.error(`Deleted ${ok}; ${bad} failed.`);
      }
      await onSuccess?.();
      onClose();
    } catch {
      toast.error('Failed to delete emails.');
    } finally {
      setIsLoading(false);
    }
  }, [draftIds, onClose, onSuccess]);

  return (
    <Modal isOpen={isOpen} onClose={() => !isLoading && onClose()} title="Delete selected drafts?">
      <p className="text-sm text-gray-600 mb-4">
        {draftCount} draft{draftCount === 1 ? '' : 's'} will be permanently removed.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="outlined" size="sm" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleConfirm}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
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
