'use client';

import { Dialog, Transition, DialogPanel, DialogTitle } from '@headlessui/react';
import { Fragment, useCallback, useState, useEffect } from 'react';
import { X as XIcon } from 'lucide-react';
import {
  Swap,
  SwapAmountInput,
  SwapMessage,
  SwapButton,
  SwapToast,
} from '@coinbase/onchainkit/swap';
import { FundButton } from '@coinbase/onchainkit/fund';
import { ETH, RSC, USDC } from '@/constants/tokens';
import { useAccount } from 'wagmi';
import { CoinbaseService } from '@/services/coinbase.service';

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
  const [activeTab, setActiveTab] = useState<'fund' | 'swap'>('fund');
  const [onrampUrl, setOnrampUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const { address } = useAccount();

  const fetchOnrampUrl = useCallback(async () => {
    if (!address) return;

    setIsLoadingUrl(true);
    setUrlError(null);

    try {
      const data = await CoinbaseService.createRSCOnrampUrl(address);
      setOnrampUrl(data.onramp_url);
    } catch (error) {
      console.error('Error fetching onramp URL:', error);
      setUrlError(
        error instanceof Error
          ? error.message
          : 'Failed to generate payment link. Please try again.'
      );
    } finally {
      setIsLoadingUrl(false);
    }
  }, [address]);

  useEffect(() => {
    if (isOpen && activeTab === 'fund' && address && !onrampUrl) {
      fetchOnrampUrl();
    }
  }, [isOpen, activeTab, address, onrampUrl, fetchOnrampUrl]);

  const handleClose = useCallback(() => {
    setActiveTab('fund');
    setOnrampUrl(null);
    setUrlError(null);
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
              <DialogPanel className="w-full max-w-md transform overflow-visible rounded-2xl bg-white p-8 shadow-xl transition-all">
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

                {/* Payment Method Toggle */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setActiveTab('fund')}
                    className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
                      activeTab === 'fund'
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-medium">USD -{'>'} RSC</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('swap')}
                    className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
                      activeTab === 'swap'
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-medium">ETH -{'>'} RSC</span>
                    </div>
                  </button>
                </div>

                <div className="py-4">
                  {activeTab === 'fund' ? (
                    <div className="flex flex-col items-center space-y-4">
                      {isLoadingUrl ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      ) : urlError ? (
                        <div className="text-center py-4">
                          <p className="text-red-600 mb-4">{urlError}</p>
                          <button
                            onClick={fetchOnrampUrl}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Retry
                          </button>
                        </div>
                      ) : onrampUrl ? (
                        <FundButton
                          fundingUrl={onrampUrl}
                          text="Buy RSC with USD"
                          className="w-full"
                        />
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500 mb-4">Connect your wallet to buy RSC</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Unidirectional Swap Implementation */
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
                  )}
                </div>
              </DialogPanel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
