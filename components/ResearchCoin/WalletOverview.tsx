'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DepositModal } from '../modals/ResearchCoin/DepositModal';
import { WithdrawModal } from '../modals/ResearchCoin/WithdrawModal';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useUser } from '@/contexts/UserContext';
import {
  getPromotionalBalance,
  hasEverHadPromotionalBalance,
} from '@/components/ResearchCoin/lib/promotionalBalance';
import { WalletOverviewCard } from './WalletOverviewCard';

interface WalletOverviewProps {
  /** Called after a balance-changing action (e.g. withdraw) so the parent can refresh sibling state (transaction feed). */
  onTransactionSuccess?: () => void;
}

export function WalletOverview({ onTransactionSuccess }: WalletOverviewProps) {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const router = useRouter();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate, isLoading: isFetchingExchangeRate } = useExchangeRate();
  const { user, refreshUser } = useUser();
  const rawBalance = user?.balance ?? null;

  const showPromoWallet = hasEverHadPromotionalBalance(user);
  const promotionalRsc = getPromotionalBalance(user);
  const availableRsc = rawBalance ?? 0;
  const fundingCreditsRsc = user?.fundingCredits ?? 0;
  const isBalanceReady = !isFetchingExchangeRate && rawBalance != null;

  const handleWithdrawSuccess = () => {
    refreshUser({ silent: true });
    onTransactionSuccess?.();
  };

  // Stable no-op rate while loading so the card can still mount skeletons.
  const rate = useMemo(() => exchangeRate || 0, [exchangeRate]);

  return (
    <>
      <div className="mb-4 mx-auto w-full">
        <WalletOverviewCard
          availableRsc={availableRsc}
          promotionalRsc={promotionalRsc}
          fundingCreditsRsc={fundingCreditsRsc}
          showPromoWallet={showPromoWallet}
          showUSD={showUSD}
          exchangeRate={rate}
          isBalanceReady={isBalanceReady}
          onDeposit={() => setIsDepositModalOpen(true)}
          onWithdraw={() => setIsWithdrawModalOpen(true)}
          onFundResearch={() => router.push('/fund')}
        />
      </div>

      {isBalanceReady && (
        <>
          <DepositModal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} />
          <WithdrawModal
            isOpen={isWithdrawModalOpen}
            onClose={() => setIsWithdrawModalOpen(false)}
            availableBalance={availableRsc}
            onSuccess={handleWithdrawSuccess}
          />
        </>
      )}
    </>
  );
}
