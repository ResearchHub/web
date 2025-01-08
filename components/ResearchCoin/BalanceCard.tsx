import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { DepositModal } from '../modals/ResearchCoin/DepositModal';
import { WithdrawModal } from '../modals/ResearchCoin/WithdrawModal';

interface BalanceCardProps {
  balance: number | null;
  exchangeRate: number;
  isLoading: boolean;
}

export function BalanceCard({ balance, exchangeRate, isLoading }: BalanceCardProps) {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const formattedBalance = balance?.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) ?? '0.00';

  const formatUSDValue = (amount: number): string => {
    return `$${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <>
      <div className="mb-6 max-w-[800px] mx-auto w-full">
        <div className="px-0 py-8">
          <div className="flex flex-col space-y-8">
            <div className="flex justify-between items-start">
              {/* Left side: Balance Section */}
              <div className="space-y-6">
                <div className="flex items-center">
                  <h2 className="text-2xl font-semibold text-gray-800">My ResearchCoin</h2>
                </div>

                <div className="space-y-1">
                  {isLoading ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 bg-gray-200 animate-pulse rounded-full" />
                        <div className="flex items-baseline gap-2">
                          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
                          <div className="h-6 w-12 bg-gray-200 animate-pulse rounded" />
                        </div>
                      </div>
                      <div className="h-5 w-24 bg-gray-200 animate-pulse rounded" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <Image
                          src="/coin-filled.png"
                          alt="ResearchCoin Logo"
                          width={28}
                          height={28}
                          className="object-contain"
                          style={{ marginRight: '0px' }}
                          priority
                        />
                        <div className="flex items-baseline">
                          <span className="text-4xl font-semibold text-gray-900">{formattedBalance}</span>
                          <span className="text-xl font-medium text-gray-600 ml-2">RSC</span>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-600">
                        ≈ {formatUSDValue((balance ?? 0) * exchangeRate)} USD
                      </div>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsDepositModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 
                      text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    <ArrowDownToLine className="h-5 w-5" />
                    <span className="font-medium">Deposit</span>
                  </button>
                  
                  <button 
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 
                      text-gray-700 bg-white border border-gray-300 rounded-md 
                      hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    <ArrowUpFromLine className="h-5 w-5" />
                    <span className="font-medium">Withdraw</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-px bg-gray-200" />
      </div>

      {/* Modals */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        currentBalance={balance ?? 0}
      />
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        availableBalance={balance ?? 0}
      />
    </>
  );
} 