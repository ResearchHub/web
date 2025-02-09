'use client';

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { getFlagOptions } from '@/constants/flags';
import { FlagReasonKey } from '@/types/work';
import { RadioGroup } from '@/components/ui/form/RadioGroup';
import { toast } from 'react-hot-toast';

interface FlagContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
}

const flagOptions = getFlagOptions();

export function FlagContentModal({ isOpen, onClose, documentId }: FlagContentModalProps) {
  const [selectedReason, setSelectedReason] = useState<FlagReasonKey | null>(null);

  const handleSubmit = () => {
    if (!selectedReason) return;
    console.log('Flagged content:', { documentId, reason: selectedReason });
    toast.success('Content flagged successfully');
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="p-6">
                  <DialogTitle as="h3" className="text-lg font-semibold text-gray-900 mb-4">
                    Flag content
                  </DialogTitle>
                  <p className="text-sm text-gray-600 mb-4">
                    I am flagging this content because of:
                  </p>

                  <RadioGroup
                    options={flagOptions}
                    value={selectedReason || ''}
                    onChange={(value) => setSelectedReason(value as FlagReasonKey)}
                    className="space-y-2"
                  />

                  <div className="mt-6 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button variant="default" onClick={handleSubmit} disabled={!selectedReason}>
                      Flag
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
