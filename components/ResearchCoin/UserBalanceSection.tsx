import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { useState } from 'react';
import { DepositModal } from '../modals/ResearchCoin/DepositModal';
import { WithdrawModal } from '../modals/ResearchCoin/WithdrawModal';
import { Button } from '@/components/ui/Button';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { formatRSC } from '@/utils/number';
import { formatUsdValue } from '@/utils/number';

interface UserBalanceSectionProps {
  balance: number | null;
  exchangeRate: number;
  isFetchingExchangeRate: boolean;
}

export function UserBalanceSection({ balance, exchangeRate, isFetchingExchangeRate }: UserBalanceSectionProps) {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const formattedBalance = balance !== null ? formatRSC({ amount: balance }) : '0.00';

  return (
    <>
        <div className="flex flex-col space-y-6">
          <div className="space-y-1">
            {isFetchingExchangeRate ? (
              <div className="space-y-2">
                <div className="h-10 w-58 bg-gray-200 animate-pulse rounded" />
                <div className="h-5 w-32 bg-gray-200 animate-pulse rounded" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <ResearchCoinIcon size={28} />
                  <div className="flex items-baseline">
                    <span className="text-4xl font-semibold text-gray-900">{formattedBalance}</span>
                    <span className="text-xl font-medium text-gray-600 ml-2">RSC</span>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-600">
                  ≈ {formatUsdValue(balance?.toString() ?? '0', exchangeRate)}
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
            >
              <ArrowDownToLine className="h-5 w-5" />
              Deposit
            </Button>
            
            <Button 
              onClick={() => setIsWithdrawModalOpen(true)}
              variant="outlined"
              size="lg"
              className="gap-2"
            >
              <ArrowUpFromLine className="h-5 w-5" />
              Withdraw
            </Button>
          </div>
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