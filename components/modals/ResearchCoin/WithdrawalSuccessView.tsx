import { useState, useCallback } from 'react';
import Image from 'next/image';
import { CheckCircle2, Check, Copy } from 'lucide-react';
import { formatRSC } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { NetworkConfig } from '@/constants/tokens';
import toast from 'react-hot-toast';

interface WithdrawalSuccessViewProps {
  withdrawAmount: number;
  fee: number;
  amountReceived: number;
  networkConfig: NetworkConfig;
  address: string;
}

export function WithdrawalSuccessView({
  withdrawAmount,
  fee,
  amountReceived,
  networkConfig,
  address,
}: WithdrawalSuccessViewProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyAddress = useCallback(() => {
    if (!address) return;
    navigator.clipboard.writeText(address).then(
      () => {
        setIsCopied(true);
        toast.success('Address copied to clipboard!');
        setTimeout(() => setIsCopied(false), 2000);
      },
      (err) => {
        console.error('Failed to copy address: ', err);
        toast.error('Failed to copy address.');
      }
    );
  }, [address]);

  const maskedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Withdrawal Successful!</h3>
        <p className="text-gray-500 mt-1">Your RSC has been sent to your wallet</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Amount Withdrawn</span>
          <div className="flex items-center gap-1">
            <ResearchCoinIcon size={16} />
            <span className="text-sm font-semibold text-gray-900">
              {formatRSC({ amount: withdrawAmount })}
            </span>
            <span className="text-sm text-gray-500">RSC</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Network Fee</span>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-900">-{fee}</span>
            <span className="text-sm text-gray-500">RSC</span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">You Received</span>
            <div className="flex items-center gap-1">
              <ResearchCoinIcon size={16} />
              <span className="text-sm font-semibold text-green-600">
                {formatRSC({ amount: amountReceived })}
              </span>
              <span className="text-sm text-gray-500">RSC</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Network</span>
          <div className="flex items-center gap-2">
            <Image src={networkConfig.icon} alt={networkConfig.name} width={16} height={16} />
            <span className="text-sm font-medium text-gray-900">{networkConfig.name}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">To Address</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-gray-900">{maskedAddress}</span>
            <button
              onClick={handleCopyAddress}
              className="flex items-center justify-center w-7 h-7 rounded hover:bg-gray-200 transition-colors"
              type="button"
              aria-label="Copy address"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
