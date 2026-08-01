'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { RSC_COLORS } from '@/components/ui/icons/ResearchCoinIcon';
import { Tooltip } from '@/components/ui/Tooltip';
import { formatCurrency } from '@/utils/currency';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useUser } from '@/contexts/UserContext';
import { getAvailableAndPromotionalRscBalance } from '@/components/ResearchCoin/lib/promotionalBalance';
import { cn } from '@/utils/styles';

interface FundingPowerCardProps {
  className?: string;
}

/**
 * Wallet card for the Activity sidebar. Leads with total funding power,
 * visualizes the split between RSC and fund-only credits, and surfaces quick
 * actions to deposit, earn, or fund research.
 */
export const FundingPowerCard = ({ className }: FundingPowerCardProps) => {
  const { user, isLoading: isUserLoading } = useUser();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate, isLoading: isRateLoading } = useExchangeRate();

  // Wait for auth + (when showing USD) a usable rate so we don't flash the
  // empty CTA or an RSC figure that then swaps to dollars.
  const isReady = !isUserLoading && (!showUSD || (!isRateLoading && exchangeRate > 0));

  if (!isReady) {
    return <FundingPowerCardSkeleton className={className} />;
  }

  const fmt = (rscAmount: number) =>
    formatCurrency({
      amount: showUSD ? rscAmount * exchangeRate : rscAmount,
      showUSD,
      exchangeRate,
      shorten: true,
      skipConversion: true,
    });

  const balanceRaw = getAvailableAndPromotionalRscBalance(user);
  const creditsRaw = user?.fundingCredits ?? 0;
  const total = balanceRaw + creditsRaw;
  const isEmpty = !user || total === 0;

  const rscWidth = total > 0 ? (balanceRaw / total) * 100 : 0;
  const creditsWidth = total > 0 ? (creditsRaw / total) * 100 : 0;

  return (
    <aside className={cn('w-[250px]', className)}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        Funding power
      </p>

      <div className="mt-1.5 flex items-center justify-between gap-2">
        <span
          className={cn(
            'font-mono text-2xl font-bold leading-none tracking-tight',
            isEmpty ? 'text-gray-300' : 'text-gray-900'
          )}
        >
          {isEmpty ? '—' : fmt(total)}
        </span>
        {!isEmpty && (
          <Link
            href="/researchcoin?action=deposit"
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-gray-800 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            <Plus size={14} className="shrink-0" />
            Deposit
          </Link>
        )}
      </div>

      {!isEmpty && (
        <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-white">
          <div style={{ width: `${rscWidth}%` }}>
            <Tooltip
              content={
                <div className="text-left">
                  <div className="text-sm font-bold text-gray-900 mb-1">ResearchCoin</div>
                  <div className="text-sm font-semibold text-gray-900">{fmt(balanceRaw)}</div>
                </div>
              }
              position="top"
              width="w-56"
              className="text-left"
              wrapperClassName="!flex w-full"
            >
              <span
                className="block h-full w-full cursor-help transition-[filter] duration-150 hover:brightness-110"
                style={{ backgroundColor: RSC_COLORS.orange }}
              />
            </Tooltip>
          </div>
          <div style={{ width: `${creditsWidth}%` }}>
            <Tooltip
              content={
                <div className="text-left">
                  <div className="text-sm font-bold text-gray-900 mb-1">Funding Credits</div>
                  <div className="text-sm font-semibold text-gray-900">{fmt(creditsRaw)}</div>
                </div>
              }
              position="top"
              width="w-56"
              className="text-left"
              wrapperClassName="!flex w-full"
            >
              <span
                className="block h-full w-full cursor-help transition-[filter] duration-150 hover:brightness-110"
                style={{ backgroundColor: RSC_COLORS.green }}
              />
            </Tooltip>
          </div>
        </div>
      )}

      {isEmpty && (
        <p className="mt-2.5 text-[13px] leading-snug text-gray-500">
          Deposit ResearchCoin or earn fund-only credits by peer reviewing — then put it toward
          research you believe in.
        </p>
      )}

      {isEmpty && (
        <div className="mt-2.5 flex gap-2">
          <PrimaryCta href="/researchcoin?action=deposit">Deposit RSC</PrimaryCta>
          <SecondaryCta href="/earn">Earn credits</SecondaryCta>
        </div>
      )}

      {!isEmpty && (
        <div className="mt-1">
          <SourceRow
            label="ResearchCoin"
            tooltip="RSC you own. Spend it on funding, tipping, and more — or withdraw it anytime."
            dotColor={RSC_COLORS.orange}
            value={fmt(balanceRaw)}
            valueClassName="text-gray-900"
          />
          <SourceRow
            label="Funding Credits"
            tooltip="Earned automatically as yield on the ResearchCoin you hold. Credits can only be used to fund research."
            dotColor={RSC_COLORS.green}
            value={fmt(creditsRaw)}
            valueClassName="text-[#19a74e]"
          />
        </div>
      )}
    </aside>
  );
};

const FundingPowerCardSkeleton = ({ className }: { className?: string }) => (
  <aside className={cn('w-[250px] animate-pulse', className)} aria-hidden>
    <div className="h-3 w-24 rounded bg-gray-200" />
    <div className="mt-2.5 flex items-center justify-between gap-2">
      <div className="h-7 w-20 rounded bg-gray-200" />
      <div className="h-8 w-[88px] rounded-lg bg-gray-200" />
    </div>
    <div className="mt-3 h-2 w-full rounded-full bg-gray-200" />
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between gap-2 py-1.5">
        <div className="h-3.5 w-28 rounded bg-gray-200" />
        <div className="h-3.5 w-12 rounded bg-gray-200" />
      </div>
      <div className="flex items-center justify-between gap-2 py-1.5">
        <div className="h-3.5 w-32 rounded bg-gray-200" />
        <div className="h-3.5 w-12 rounded bg-gray-200" />
      </div>
    </div>
  </aside>
);

interface SourceRowProps {
  label: string;
  tooltip: string;
  dotColor: string;
  value: string;
  valueClassName?: string;
}

const SourceRow = ({ label, tooltip, dotColor, value, valueClassName }: SourceRowProps) => (
  <Tooltip content={tooltip} position="top" width="w-56" wrapperClassName="w-full">
    <div className="flex w-full cursor-help items-center gap-2 rounded-md py-1.5 transition-colors hover:bg-white/70">
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: dotColor }} />
      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-gray-700">{label}</span>
      <span className={cn('shrink-0 font-mono text-[13px] font-semibold', valueClassName)}>
        {value}
      </span>
    </div>
  </Tooltip>
);

interface CtaProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const PrimaryCta = ({ href, children, className }: CtaProps) => (
  <Link
    href={href}
    className={cn(
      'inline-flex flex-1 items-center justify-center rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-primary-700',
      className
    )}
  >
    {children}
  </Link>
);

const SecondaryCta = ({ href, children, className }: CtaProps) => (
  <Link
    href={href}
    className={cn(
      'inline-flex flex-1 items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 transition-colors hover:border-primary-300 hover:text-primary-700',
      className
    )}
  >
    {children}
  </Link>
);
