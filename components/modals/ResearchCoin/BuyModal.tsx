'use client';

import { Dialog, Transition, DialogPanel, DialogTitle } from '@headlessui/react';
import { Fragment, useCallback } from 'react';
import { X as XIcon } from 'lucide-react';
import {
  Swap,
  SwapAmountInput,
  SwapMessage,
  SwapButton,
  SwapToast,
} from '@coinbase/onchainkit/swap';
import { ETH, RSC, USDC } from '@/constants/tokens';

// Network configuration based on environment
const IS_PRODUCTION = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
const NETWORK_NAME = IS_PRODUCTION ? 'Base' : 'Base Sepolia';
const NETWORK_DESCRIPTION = IS_PRODUCTION
  ? 'Swaps are processed on Base L2'
  : 'Swaps are processed on Base Sepolia testnet';

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BuyModal({ isOpen, onClose }: BuyModalProps) {
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
                    Buy RSC
                  </DialogTitle>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors rounded-full p-1 hover:bg-gray-100"
                    aria-label="Close"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Network Info */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-md mb-6">
                  <div className="flex items-center gap-3">
                    <img src="/base-logo.svg" alt={`${NETWORK_NAME} Network`} className="h-6 w-6" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{NETWORK_NAME}</span>
                      <span className="text-xs text-gray-500">{NETWORK_DESCRIPTION}</span>
                    </div>
                  </div>
                </div>

                <div className="py-4">
                  {/* Unidirectional Swap Implementation */}
                  <Swap isSponsored={true} title="">
                    <SwapAmountInput
                      label="Pay with"
                      swappableTokens={[ETH, USDC]}
                      token={ETH}
                      type="from"
                    />
                    <SwapAmountInput
                      label="Receive"
                      swappableTokens={[RSC]}
                      token={RSC}
                      type="to"
                    />
                    <SwapButton />
                    <SwapMessage />
                    <SwapToast />
                  </Swap>
                </div>
              </DialogPanel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
