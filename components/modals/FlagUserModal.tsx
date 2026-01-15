'use client';

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { getUserFlagOptions, UserFlagReasonKey } from '@/constants/flags';
import { FlagRadioGroup } from '@/components/ui/form/FlagRadioGroup';
import { Textarea } from '@/components/ui/form/Textarea';

interface FlagUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, reasonMemo: string) => Promise<void>;
  isLoading?: boolean;
}

const flagOptions = getUserFlagOptions();

export function FlagUserModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: FlagUserModalProps) {
  const [selectedReason, setSelectedReason] = useState<UserFlagReasonKey | null>(null);
  const [reasonMemo, setReasonMemo] = useState('');

  const handleSubmit = async () => {
    if (!selectedReason) return;
    await onSubmit(selectedReason, reasonMemo.trim());
    // Reset state after successful submit
    setSelectedReason(null);
    setReasonMemo('');
  };

  const handleClose = () => {
    setSelectedReason(null);
    setReasonMemo('');
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={handleClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-black !bg-opacity-25"
            onClick={(e) => e.stopPropagation()}
          />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div
            className="flex min-h-full items-center justify-center p-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel
                className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all"
                onKeyDownCapture={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <DialogTitle as="h3" className="text-base font-semibold text-gray-900 mb-3">
                    Flag user
                  </DialogTitle>
                  <p className="text-xs text-gray-600 mb-3">I am flagging this user because of:</p>

                  <FlagRadioGroup
                    options={flagOptions}
                    value={selectedReason || ''}
                    onChange={(value) => setSelectedReason(value as UserFlagReasonKey)}
                    className="space-y-1.5"
                  />

                  <div className="mt-4">
                    <label htmlFor="reason-memo" className="block text-xs text-gray-600 mb-1">
                      Additional information (optional)
                    </label>
                    <Textarea
                      id="reason-memo"
                      value={reasonMemo}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setReasonMemo(e.target.value)
                      }
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder="Provide more details..."
                      className="w-full"
                      rows={3}
                      maxLength={1000}
                    />
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {reasonMemo.length} / 1000
                    </p>
                  </div>

                  <div className="mt-5 flex justify-end gap-3">
                    <Button variant="ghost" size="sm" onClick={handleClose} disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSubmit}
                      disabled={!selectedReason || isLoading}
                    >
                      {isLoading ? 'Flagging...' : 'Flag User'}
                    </Button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
