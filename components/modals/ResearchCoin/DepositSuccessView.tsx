import { useState, useCallback } from 'react';
import Image from 'next/image';
import { CheckCircle2, Check, Copy, Clock } from 'lucide-react';
import { formatRSC } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { NetworkConfig } from '@/constants/tokens';
import toast from 'react-hot-toast';

interface DepositSuccessViewProps {
  depositAmount: number;
  networkConfig: NetworkConfig;
  address: string;
}

export function DepositSuccessView({
  depositAmount,
  networkConfig,
  address,
}: DepositSuccessViewProps) {
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
        <h3 className="text-xl font-semibold text-gray-900">Deposit Successful!</h3>
        <p className="text-gray-500 mt-1">Your RSC is being processed</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Amount Deposited</span>
          <div className="flex items-center gap-1">
            <ResearchCoinIcon size={16} />
            <span className="text-sm font-semibold text-green-600">
              {formatRSC({ amount: depositAmount })}
            </span>
            <span className="text-sm text-gray-500">RSC</span>
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
          <span className="text-sm text-gray-600">From Address</span>
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

      <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Processing Time</p>
            <p className="mt-1">
              It can take up to 10-20 minutes for the deposit to appear in your ResearchHub balance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
