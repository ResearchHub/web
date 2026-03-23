'use client';

import { FC, useState, useEffect } from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { FlagRadioGroup } from '@/components/ui/form/FlagRadioGroup';
import { Textarea } from '@/components/ui/form/Textarea';
import { getFlagOptions } from '@/constants/flags';
import { FlagReasonKey } from '@/types/work';

const flagOptions = getFlagOptions();

interface DeclineGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { reasonChoice: FlagReasonKey; reason: string }) => void;
  isSubmitting?: boolean;
}

export const DeclineGrantModal: FC<DeclineGrantModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  const [selectedReason, setSelectedReason] = useState<FlagReasonKey | null>(null);
  const [reasonText, setReasonText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedReason(null);
      setReasonText('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!selectedReason) return;
    onConfirm({ reasonChoice: selectedReason, reason: reasonText.trim() });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Decline RFP"
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="outlined" size="sm" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleConfirm}
            disabled={!selectedReason || isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? 'Declining...' : 'Decline'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-gray-600">I am declining this RFP because of:</p>

        <FlagRadioGroup
          options={flagOptions}
          value={selectedReason || ''}
          onChange={(value) => setSelectedReason(value as FlagReasonKey)}
          className="space-y-1.5"
        />

        <div>
          <label htmlFor="decline-reason" className="block text-xs text-gray-600 mb-1">
            Additional information (optional)
          </label>
          <Textarea
            id="decline-reason"
            value={reasonText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReasonText(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Provide more details..."
            className="w-full"
            rows={3}
            maxLength={1000}
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">{reasonText.length} / 1000</p>
        </div>
      </div>
    </BaseModal>
  );
};
