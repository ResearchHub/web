'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Copy, Check, Info, AlertTriangle, Clock } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import Image from 'next/image';
import { BaseModal } from '@/components/ui/BaseModal';
import { WalletService } from '@/services/wallet.service';
import { CoinbaseService } from '@/services/coinbase.service';
import { Alert } from '@/components/ui/Alert';
import toast from 'react-hot-toast';
import { useCopyAddress } from '@/hooks/useCopyAddress';

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [isLoadingDepositAddress, setIsLoadingDepositAddress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onrampUrl, setOnrampUrl] = useState<string | null>(null);
  const { isCopied, copyAddress } = useCopyAddress();

  const fetchOnrampUrl = useCallback(async () => {
    try {
      const response = await CoinbaseService.createRSCOnrampUrl();
      setOnrampUrl(response.onramp_url);
    } catch (err) {
      console.error('Failed to fetch onramp URL:', err);
    }
  }, []);

  // Fetch deposit address when modal opens (lazy wallet provisioning)
  useEffect(() => {
    if (isOpen && !depositAddress) {
      setIsLoadingDepositAddress(true);
      setError(null);
      WalletService.getDepositAddress()
        .then((response) => {
          setDepositAddress(response.address);
        })
        .catch((err) => {
          console.error('Failed to provision wallet:', err);
          setError('Failed to get deposit address. Please try again.');
          toast.error('Failed to get deposit address');
        })
        .finally(() => {
          setIsLoadingDepositAddress(false);
        });
    }
  }, [isOpen, depositAddress]);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      fetchOnrampUrl();
    }
  }, [isOpen, fetchOnrampUrl]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Deposit RSC"
      padding="p-8"
      className="md:!w-[460px]"
    >
      <div className="space-y-6">
        {/* QR Code */}
        {isLoadingDepositAddress ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Loading deposit address...</span>
          </div>
        ) : error ? (
          <Alert variant="error">
            <div className="space-y-2">
              <div>{error}</div>
              <button
                onClick={() => {
                  setDepositAddress(null);
                  setError(null);
                }}
                className="text-sm font-medium underline"
              >
                Retry
              </button>
            </div>
          </Alert>
        ) : depositAddress ? (
          <>
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-2xl border border-gray-200">
                <QRCodeCanvas value={depositAddress} size={200} />
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Your address</div>
                <div className="text-base font-medium text-gray-900 font-mono">
                  {truncateAddress(depositAddress)}
                </div>
              </div>
              <button
                onClick={() => copyAddress(depositAddress)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                type="button"
              >
                {isCopied ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>

            <hr className="border-gray-200" />

            {/* Info items */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Info className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-600">
                  Supports Base and Ethereum. Use Base for lower fees.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-600">
                  Only send RSC tokens to this address. Sending other tokens may result in permanent
                  loss.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-600">Allow 10-20 minutes for processing.</p>
              </div>
            </div>
          </>
        ) : null}

        {/* Coinbase Onramp */}
        {onrampUrl && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-400">or</span>
              </div>
            </div>
            <button
              onClick={() => {
                window.open(onrampUrl, 'coinbase-onramp', 'width=460,height=700,left=100,top=100');
              }}
              className="w-full h-12 rounded-xl border border-gray-300 bg-white font-medium text-gray-900 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 flex items-center justify-center"
              type="button"
            >
              <Image src="/coinbase-logo.svg" alt="Coinbase" width={100} height={18} />
            </button>
          </>
        )}
      </div>
    </BaseModal>
  );
}
