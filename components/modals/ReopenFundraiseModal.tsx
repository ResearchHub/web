'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/form/Modal';

interface ReopenFundraiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (durationDays: number) => void;
  isLoading: boolean;
}

const PRESET_DAYS = [7, 14, 30];

export const ReopenFundraiseModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: ReopenFundraiseModalProps) => {
  const [durationDays, setDurationDays] = useState<number>(30);

  const isValid = Number.isInteger(durationDays) && durationDays >= 1;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reopen/Extend fundraise">
      <div className="py-0">
        <p className="mb-4 text-sm text-gray-600">
          Set the fundraise end date to the selected number of days from now.
        </p>

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
            {isLoading ? 'Submitting...' : 'Reopen/Extend fundraise'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
