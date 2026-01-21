import Image from 'next/image';
import { CheckCircle2, Check, Copy, Clock } from 'lucide-react';
import { formatRSC } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { NetworkConfig } from '@/constants/tokens';
import { maskAddress } from '@/utils/stringUtils';
import { useCopyAddress } from '@/hooks/useCopyAddress';

interface TransactionSuccessViewProps {
  title: string;
  subtitle: string;
  amount: number;
  networkConfig: NetworkConfig;
  address: string;
  addressLabel: 'From Address' | 'To Address';
  amountLabel: string;
  amountColor?: 'green' | 'gray';
  fee?: number;
  amountReceived?: number;
  showProcessingTime?: boolean;
  processingTimeMessage?: string;
}

export function TransactionSuccessView({
  title,
  subtitle,
  amount,
  networkConfig,
  address,
  addressLabel,
  amountLabel,
  amountColor = 'green',
  fee,
  amountReceived,
  showProcessingTime = false,
  processingTimeMessage,
}: TransactionSuccessViewProps) {
  const { isCopied, copyAddress } = useCopyAddress();
  const maskedAddress = maskAddress(address);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-500 mt-1">{subtitle}</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">{amountLabel}</span>
          <div className="flex items-center gap-1">
            <ResearchCoinIcon size={16} />
            <span
              className={`text-sm font-semibold ${
                amountColor === 'green' ? 'text-green-600' : 'text-gray-900'
              }`}
            >
              {formatRSC({ amount })}
            </span>
            <span className="text-sm text-gray-500">RSC</span>
          </div>
        </div>

        {fee !== undefined && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Network Fee</span>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-900">-{fee}</span>
                <span className="text-sm text-gray-500">RSC</span>
              </div>
            </div>

            {amountReceived !== undefined && (
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
            )}
          </>
        )}
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
          <span className="text-sm text-gray-600">{addressLabel}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-gray-900">{maskedAddress}</span>
            <button
              onClick={() => copyAddress(address)}
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

      {showProcessingTime && processingTimeMessage && (
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Processing Time</p>
              <p className="mt-1">{processingTimeMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
