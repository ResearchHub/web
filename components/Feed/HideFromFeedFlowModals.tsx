'use client';

import { FC } from 'react';
import { ConfirmationModal } from '@/components/ui/form/ConfirmationModal';
import { Modal } from '@/components/ui/form/Modal';
import { Button } from '@/components/ui/Button';
import { FeedEntryPickerRow } from '@/components/Feed/FeedEntryPickerRow';
import { HIDE_FROM_FEED_CONFIRM_MESSAGE } from '@/hooks/useHideFromFeed';
import type { FeedEntry } from '@/types/feed';

interface HideFromFeedFlowModalsProps {
  step: 'closed' | 'pick' | 'confirm';
  entries: FeedEntry[];
  selectedEntryId: string | null;
  isHiding: boolean;
  onClose: () => void;
  onSelectEntry: (feedEntryId: string) => void;
  onProceedToConfirm: () => void;
  onConfirmHide: () => void | Promise<void>;
}

export const HideFromFeedFlowModals: FC<HideFromFeedFlowModalsProps> = ({
  step,
  entries,
  selectedEntryId,
  isHiding,
  onClose,
  onSelectEntry,
  onProceedToConfirm,
  onConfirmHide,
}) => (
  <>
    <Modal
      isOpen={step === 'pick'}
      onClose={() => {
        if (!isHiding) {
          onClose();
        }
      }}
      title="Hide from feed"
    >
      <p className="mb-4 text-sm text-gray-600">Choose which one to hide.</p>
      <div className="mb-4 max-h-[min(60vh,28rem)] space-y-2 overflow-y-auto">
        {entries.map((entry) => (
          <FeedEntryPickerRow
            key={entry.id}
            entry={entry}
            selected={selectedEntryId === entry.id}
            onSelect={() => onSelectEntry(entry.id)}
          />
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outlined" size="sm" onClick={onClose} disabled={isHiding}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onProceedToConfirm}
          disabled={!selectedEntryId || isHiding}
        >
          Continue
        </Button>
      </div>
    </Modal>

    <ConfirmationModal
      isOpen={step === 'confirm'}
      onClose={onClose}
      title="Hide from feed"
      description={HIDE_FROM_FEED_CONFIRM_MESSAGE}
      confirmLabel="Hide from feed"
      confirmVariant="destructive"
      isConfirming={isHiding}
      onConfirm={onConfirmHide}
    />
  </>
);
