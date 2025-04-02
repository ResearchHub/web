import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from '@/components/ui/Button';

interface NonprofitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nonprofitName: string;
}

export function NonprofitConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  nonprofitName,
}: NonprofitConfirmModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="p-6">
                  <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 mb-4">
                    Nonprofit Funding Confirmation
                  </Dialog.Title>
                  <p className="text-sm text-gray-600 mb-6">
                    You&apos;ve selected nonprofit{' '}
                    <span className="font-semibold">{nonprofitName}</span>. This means that
                    Endaoment is providing fiscal sponsorship such that all funds contributed to
                    your fundraise will be converted to cash at the time of fundraise completion and
                    all funds will be sent from Endaoment directly to the nonprofit{' '}
                    <span className="font-semibold">{nonprofitName}</span> that you selected. The
                    funds will never be in your personal custody.
                  </p>
                  <div className="mt-6 flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button onClick={onConfirm}>I Understand</Button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
