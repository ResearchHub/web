'use client';

import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, useCallback } from 'react';
import { useConnect } from 'wagmi';
import { X as XIcon } from 'lucide-react';
import Image from 'next/image';
import { coinbaseWallet, metaMask } from 'wagmi/connectors';
import toast from 'react-hot-toast';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onError?: (error: Error) => void;
}

function truncateWalletAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function WalletModal({ isOpen, onClose, onError }: WalletModalProps) {
  const { connectAsync, error } = useConnect();

  const handleCoinbaseWalletConnection = useCallback(async () => {
    try {
      const cbConnector = coinbaseWallet({
        preference: 'all',
        appName: 'ResearchHub',
      });
      const data = await connectAsync({ connector: cbConnector });
      if (data?.accounts && data.accounts.length > 0) {
        toast.success(`Wallet Connected (${truncateWalletAddress(data.accounts[0])})`);
        onClose();
      } else {
        throw new Error('No accounts returned');
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to connect wallet');
      console.error('Coinbase Wallet connection error:', errorObj);
      onError?.(errorObj);
    }
  }, [connectAsync, onClose, onError]);

  const handleMetaMaskConnection = useCallback(async () => {
    try {
      const mmConnector = metaMask({
        dappMetadata: {
          name: 'ResearchHub',
          url: window.location.origin,
        },
      });
      const data = await connectAsync({ connector: mmConnector });
      if (data?.accounts && data.accounts.length > 0) {
        toast.success(`Wallet Connected (${truncateWalletAddress(data.accounts[0])})`);
        onClose();
      } else {
        throw new Error('No accounts returned');
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to connect wallet');
      console.error('MetaMask connection error:', errorObj);
      onError?.(errorObj);
    }
  }, [connectAsync, onClose, onError]);

  const handleCoinbaseSignUp = useCallback(() => {
    window.open('https://wallet.coinbase.com/smart-wallet', '_blank');
  }, []);

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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-xl font-semibold text-gray-900">
                    Connect Wallet
                  </Dialog.Title>
                  <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
                    <XIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Sign Up Button */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={handleCoinbaseSignUp}
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 transition hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 relative">
                        <Image
                          src="/coinbaseWallet-logo.svg"
                          alt="Coinbase Wallet logo"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <p className="font-medium text-gray-900">Create a Smart Wallet</p>
                    </div>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-sm text-gray-500">
                      Or connect with an existing wallet
                    </span>
                  </div>
                </div>

                {/* Wallet Options */}
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={handleCoinbaseWalletConnection}
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 transition hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 relative">
                        <Image
                          src="/coinbaseWallet-logo.svg"
                          alt="Coinbase Wallet logo"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <p className="font-medium text-gray-900">Coinbase Wallet</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleMetaMaskConnection}
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 transition hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 relative">
                        <Image
                          src="/metamask-logo.svg"
                          alt="MetaMask logo"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <p className="font-medium text-gray-900">MetaMask</p>
                    </div>
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-100">
                    <p className="text-sm text-red-600">{error.message}</p>
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
