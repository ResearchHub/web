'use client';

import { useState, useEffect } from 'react';
import { Loader2, Copy, Check } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { WalletService } from '@/services/wallet.service';
import { NetworkType, NETWORK_CONFIG } from '@/constants/tokens';
import { Alert } from '@/components/ui/Alert';
import { NetworkSelectorSection } from './shared/NetworkSelectorSection';
import toast from 'react-hot-toast';
import { useCopyAddress } from '@/hooks/useCopyAddress';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onSuccess?: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>('BASE');
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [isLoadingDepositAddress, setIsLoadingDepositAddress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isCopied, copyAddress } = useCopyAddress();

  const networkConfig = NETWORK_CONFIG[selectedNetwork];

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
      setSelectedNetwork('BASE');
      setError(null);
    }
  }, [isOpen]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Deposit RSC"
      padding="p-8"
      className="md:!w-[500px]"
    >
      <div className="space-y-6">
        {/* Network Selector */}
        <NetworkSelectorSection
          selectedNetwork={selectedNetwork}
          onNetworkChange={setSelectedNetwork}
          disabled={false}
          showDescription={false}
          customBadges={{
            BASE: 'Recommended',
            ETHEREUM: 'Higher Fees',
          }}
        />

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p className="text-sm text-blue-800">
            Send RSC to the address below on the <strong>{networkConfig.name}</strong> network. Your
            deposit will appear in your balance within 10-20 minutes.
          </p>
        </div>

        {/* Deposit Address */}
        <div className="space-y-2">
          <span className="text-[15px] text-gray-700 font-medium">Your Deposit Address</span>

          {isLoadingDepositAddress ? (
            <div className="flex items-center justify-center py-6">
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
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <code className="text-sm text-gray-900 font-mono break-all flex-1">
                  {depositAddress}
                </code>
                <button
                  onClick={() => copyAddress(depositAddress)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  type="button"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Warning */}
        <Alert variant="warning">
          <div className="font-medium">
            Only send RSC tokens on the {networkConfig.name} network to this address. Sending other
            tokens or using the wrong network may result in permanent loss.
          </div>
        </Alert>
      </div>
    </BaseModal>
  );
}
