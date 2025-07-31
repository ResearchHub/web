'use client';

import { Dialog, Transition, DialogPanel, DialogTitle } from '@headlessui/react';
import { Fragment, useCallback } from 'react';
import { X as XIcon } from 'lucide-react';
import { FundCard } from '@coinbase/onchainkit/fund';

interface FundModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress?: string;
}

export function FundModal({ isOpen, onClose, walletAddress }: FundModalProps) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-8">
                  <DialogTitle className="text-2xl font-semibold text-gray-900">
                    Fund Your Wallet
                  </DialogTitle>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors rounded-full p-1 hover:bg-gray-100"
                    aria-label="Close"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>

                <FundCard
                  assetSymbol="ETH"
                  country="US"
                  currency="USD"
                  headerText="Purchase crypto to contribute"
                  buttonText="Continue"
                  presetAmountInputs={['10', '25', '50']}
                />
              </DialogPanel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
