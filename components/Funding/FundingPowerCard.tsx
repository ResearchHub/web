'use client';

import { useEffect, useState } from 'react';
import { ArrowDownToLine, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FundingPowerTooltip } from '@/components/tooltips/FundingPowerTooltip';
import { DepositModal } from '@/components/modals/ResearchCoin/DepositModal';
import { formatCurrency } from '@/utils/currency';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useUser } from '@/contexts/UserContext';
import { getAvailableAndPromotionalRscBalance } from '@/components/ResearchCoin/lib/promotionalBalance';
import { cn } from '@/utils/styles';

interface FundingPowerCardProps {
  className?: string;
}

/**
 * Raised white panel that sits above the gray sidebar rail rather than inside
 * it, so it reads as the primary thing in the column instead of another block
 * of gray text.
 */
const CARD_SURFACE = 'rounded-lg border border-gray-200 bg-white p-4 shadow-sm';
const HIDDEN_AMOUNT_KEY = 'rh:funding-power-hidden';

/**
 * Wallet card for the Activity sidebar. Leads with total funding power and a
 * deposit action; the per-asset breakdown lives in the tooltip so the card can
 * stay focused on how much is available and how it can be spent.
 */
export const FundingPowerCard = ({ className }: FundingPowerCardProps) => {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isAmountHidden, setIsAmountHidden] = useState(false);
  const [privacyReady, setPrivacyReady] = useState(false);
  const { user, isLoading: isUserLoading } = useUser();
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate, isLoading: isRateLoading } = useExchangeRate();

  const isReady = !isUserLoading && (!showUSD || !isRateLoading);

  useEffect(() => {
    try {
      setIsAmountHidden(localStorage.getItem(HIDDEN_AMOUNT_KEY) === '1');
    } catch {
      // Private mode / blocked storage — stay visible.
    }
    setPrivacyReady(true);
  }, []);

  if (!isReady) {
    return <FundingPowerCardSkeleton className={className} />;
  }

  const canShowUSD = showUSD && exchangeRate > 0;

  const fmt = (rscAmount: number) =>
    formatCurrency({
      amount: canShowUSD ? rscAmount * exchangeRate : rscAmount,
      showUSD: canShowUSD,
      exchangeRate,
      shorten: true,
      skipConversion: true,
    });

  const balanceRaw = getAvailableAndPromotionalRscBalance(user);
  const creditsRaw = user?.fundingCredits ?? 0;
  const total = balanceRaw + creditsRaw;
  const isEmpty = !user || total === 0;

  // Logged-out clicks fall through to the auth modal, which replays the action
  // once the user is signed in.
  const openDepositModal = () => executeAuthenticatedAction(() => setIsDepositModalOpen(true));

  const toggleAmountHidden = () => {
    setIsAmountHidden((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(HIDDEN_AMOUNT_KEY, next ? '1' : '0');
      } catch {
        // Same as the read path — a blocked store just means the choice
        // lasts for this session.
      }
      return next;
    });
  };

  return (
    <aside className={cn(CARD_SURFACE, 'w-[250px]', className)}>
      <p className="flex items-center gap-1.5 text-sm font-bold text-gray-500">
        <Zap className="h-4 w-4 shrink-0" />
        Funding power
      </p>

      <div className="mt-3.5 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleAmountHidden}
          aria-label={isAmountHidden ? 'Show funding power' : 'Hide funding power'}
          className={cn(
            'font-mono text-3xl font-bold leading-none tracking-tight',
            isEmpty ? 'text-gray-300' : 'text-gray-900',
            !privacyReady && 'invisible'
          )}
        >
          {isEmpty ? '—' : isAmountHidden ? '••••' : fmt(total)}
        </button>
        <FundingPowerTooltip rscBalance={fmt(balanceRaw)} fundingCredits={fmt(creditsRaw)} />
      </div>

      <Button size="sm" onClick={openDepositModal} className="mt-3 w-full gap-1">
        <ArrowDownToLine size={14} className="shrink-0" />
        Deposit
      </Button>

      <p className="mt-3 text-[13px] leading-snug text-gray-500">
        Fund with <span className="font-semibold text-gray-800">USD</span>,{' '}
        <span className="font-semibold text-gray-800">RSC</span>, or a{' '}
        <span className="font-semibold text-gray-800">DAF</span>
      </p>

      {user && (
        <DepositModal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} />
      )}
    </aside>
  );
};

const FundingPowerCardSkeleton = ({ className }: { className?: string }) => (
  <aside className={cn(CARD_SURFACE, 'w-[250px] animate-pulse', className)} aria-hidden>
    <div className="flex items-center gap-1.5">
      <div className="h-4 w-4 shrink-0 rounded bg-gray-200" />
      <div className="h-4 w-28 rounded bg-gray-200" />
    </div>
    <div className="mt-3.5 flex items-center gap-2">
      <div className="h-8 w-28 rounded bg-gray-200" />
      <div className="h-4 w-4 rounded bg-gray-200" />
    </div>
    <div className="mt-3 h-8 w-full rounded-lg bg-gray-200" />
    <div className="mt-3 h-3.5 w-48 rounded bg-gray-200" />
  </aside>
);
