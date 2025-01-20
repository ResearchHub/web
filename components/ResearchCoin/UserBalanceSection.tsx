import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { useState } from 'react';
import { DepositModal } from '../modals/ResearchCoin/DepositModal';
import { WithdrawModal } from '../modals/ResearchCoin/WithdrawModal';
import { Button } from '@/components/ui/Button';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import type { TransformedBalance } from '@/services/transaction.service';

interface UserBalanceSectionProps {
  balance: TransformedBalance | null;
  isFetchingExchangeRate: boolean;
}

export function UserBalanceSection({ balance, isFetchingExchangeRate }: UserBalanceSectionProps) {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Consider balance as not ready if we're fetching exchange rate or balance is null
  const isBalanceReady = !isFetchingExchangeRate && balance !== null;

  return (
    <>
      <div className="mb-6 mx-auto w-full">
        <div className="px-0 py-8">
          <div className="flex flex-col space-y-8">
            <div className="flex justify-between items-start">
              {/* Left side: Balance Section */}
              <div className="space-y-6">
                <div className="flex items-center">
                  <h2 className="text-2xl font-semibold text-gray-800">My ResearchCoin</h2>
                </div>

                <div className="space-y-1">
                  {!isBalanceReady ? (
                    <div className="space-y-2">
                      <div className="h-10 w-58 bg-gray-200 animate-pulse rounded" />
                      <div className="h-5 w-32 bg-gray-200 animate-pulse rounded" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <ResearchCoinIcon size={28} />
                        <div className="flex items-baseline">
                          <span className="text-4xl font-semibold text-gray-900">
                            {balance.formatted}
                          </span>
                          <span className="text-xl font-medium text-gray-600 ml-2">RSC</span>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-600">
                        ≈ {balance.formattedUsd}
                      </div>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button 
                    onClick={() => setIsDepositModalOpen(true)}
                    variant="default"
                    size="lg"
                    className="gap-2"
                    disabled={!isBalanceReady}
                  >
                    <ArrowDownToLine className="h-5 w-5" />
                    Deposit
                  </Button>
                  
                  <Button 
                    onClick={() => setIsWithdrawModalOpen(true)}
                    variant="outlined"
                    size="lg"
                    className="gap-2"
                    disabled={!isBalanceReady}
                  >
                    <ArrowUpFromLine className="h-5 w-5" />
                    Withdraw
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-px bg-gray-200" />
      </div>

      {/* Modals */}
      {isBalanceReady && (
        <>
          <DepositModal
            isOpen={isDepositModalOpen}
            onClose={() => setIsDepositModalOpen(false)}
            currentBalance={balance.raw}
          />
          <WithdrawModal
            isOpen={isWithdrawModalOpen}
            onClose={() => setIsWithdrawModalOpen(false)}
            availableBalance={balance.raw}
          />
        </>
      )}
    </>
  );
} 