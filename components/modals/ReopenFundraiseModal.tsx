'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/form/Modal';

export const FUNDRAISE_MODAL_MODE = {
  REOPEN: 'reopen',
  EXTEND: 'extend',
} as const;

export type FundraiseModalMode = (typeof FUNDRAISE_MODAL_MODE)[keyof typeof FUNDRAISE_MODAL_MODE];

interface ReopenFundraiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (durationDays: number) => void;
  isLoading: boolean;
  mode: FundraiseModalMode;
}

const PRESET_DAYS = [7, 14, 30];

export const ReopenFundraiseModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  mode,
}: ReopenFundraiseModalProps) => {
  const [durationDays, setDurationDays] = useState<number>(30);

  const isValid = Number.isInteger(durationDays) && durationDays >= 1;

  const isExtend = mode === FUNDRAISE_MODAL_MODE.EXTEND;
  const title = isExtend ? 'Extend fundraise' : 'Reopen fundraise';
  const loadingText = isExtend ? 'Extending...' : 'Reopening...';
  const description = isExtend
    ? 'This will set the fundraise end date to the selected number of days from now.'
    : 'This will reopen the fundraise so it can accept contributions again. Choose how many days to keep it open.';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="py-0">
        <p className="mb-4 text-sm text-gray-600">{description}</p>

        <div className="mb-4">
          <label
            htmlFor="reopen-fundraise-duration"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Duration (days)
          </label>
          <div className="flex items-center gap-2 mb-2">
            {PRESET_DAYS.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setDurationDays(days)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                  durationDays === days
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {days} days
              </button>
            ))}
          </div>
          <input
            id="reopen-fundraise-duration"
            type="number"
            min={1}
            step={1}
            value={durationDays}
            onChange={(e) => {
              const val = Number.parseInt(e.target.value, 10);
              setDurationDays(Number.isNaN(val) ? 0 : val);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter number of days"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 text-sm font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              if (isValid) {
                onConfirm(durationDays);
              }
            }}
            disabled={!isValid || isLoading}
          >
            {isLoading ? loadingText : title}
          </button>
        </div>
      </div>
    </Modal>
  );
};
