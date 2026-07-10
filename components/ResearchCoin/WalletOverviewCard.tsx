'use client';

import { ArrowDownToLine, ArrowUpFromLine, HelpCircle, MoreVertical } from 'lucide-react';
import Icon from '@/components/ui/icons/Icon';
import { type ReactNode } from 'react';
import { formatBalance } from '@/components/ResearchCoin/lib/types';
import { FundingCreditsTooltip } from '@/components/tooltips/FundingCreditsTooltip';
import { ResearchCoinTooltip } from '@/components/tooltips/ResearchCoinTooltip';
import { formatRSC, formatUsdValue } from '@/utils/number';
import { Button } from '@/components/ui/Button';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { ResearchCoinExpandable } from './ResearchCoinExpandable';
import { WalletCompositionBar } from './WalletCompositionBar';
import { stripUsdSuffix } from './lib/display';

export interface WalletOverviewCardProps {
  availableRsc: number;
  promotionalRsc: number;
  fundingCreditsRsc: number;
  /** When true, show composition bar + expandable ResearchCoin (promo history). */
  showPromoWallet: boolean;
  showUSD: boolean;
  exchangeRate: number;
  isBalanceReady?: boolean;
  /** Preview/demo only — start ResearchCoin expanded. */
  defaultExpanded?: boolean;
  onDeposit?: () => void;
  onWithdraw?: () => void;
  onFundResearch?: () => void;
}

interface CurrencyMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

const formatUsd = (n: number) => formatUsdValue(n.toString(), 0, false);

/**
 * Presentational My Wallet card — same assembly as /researchcoin.
 * Used by WalletOverview (live data) and the promotional-balance preview (mock data).
 */
export function WalletOverviewCard({
  availableRsc,
  promotionalRsc,
  fundingCreditsRsc,
  showPromoWallet,
  showUSD,
  exchangeRate,
  isBalanceReady = true,
  defaultExpanded = false,
  onDeposit,
  onWithdraw,
  onFundResearch,
}: WalletOverviewCardProps) {
  const balance = formatBalance(availableRsc, exchangeRate);
  const lockedBalance = formatBalance(fundingCreditsRsc, exchangeRate);

  const totalRsc = availableRsc + promotionalRsc + fundingCreditsRsc;
  const totalUsd = totalRsc * exchangeRate;
  const totalPrimary = showUSD ? formatUsd(totalUsd) : `${formatRSC({ amount: totalRsc })} RSC`;
  const totalSecondary = showUSD ? `${formatRSC({ amount: totalRsc })} RSC` : formatUsd(totalUsd);

  const rscMenuItems: CurrencyMenuItem[] = [
    {
      label: 'Deposit',
      icon: <ArrowDownToLine className="h-3.5 w-3.5" />,
      onClick: () => onDeposit?.(),
      disabled: !isBalanceReady || !onDeposit,
    },
    {
      label: 'Withdraw',
      icon: <ArrowUpFromLine className="h-3.5 w-3.5" />,
      onClick: () => onWithdraw?.(),
      disabled: !isBalanceReady || !onWithdraw,
    },
  ];

  const fcMenuItems: CurrencyMenuItem[] = [
    {
      label: 'Fund Research',
      icon: <Icon name="fund" size={14} color="#404040" />,
      onClick: () => onFundResearch?.(),
      disabled: !onFundResearch,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 sm:px-6 pt-5 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 w-full">
          {!isBalanceReady ? (
            <div>
              <div className="h-9 w-40 bg-gray-100 animate-pulse rounded" />
              <div className="h-4 w-28 bg-gray-100 animate-pulse rounded mt-2" />
            </div>
          ) : (
            <div>
              <ResponsiveUsdLabel
                value={totalPrimary}
                className="text-[26px] sm:text-[32px] font-bold leading-none text-gray-900 whitespace-nowrap"
              />
              <ResponsiveUsdLabel value={totalSecondary} className="text-sm text-gray-500 mt-1.5" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <Button
            onClick={() => onDeposit?.()}
            variant="default"
            disabled={!isBalanceReady || !onDeposit}
            className="flex-1 sm:flex-none"
          >
            <ArrowDownToLine className="h-4 w-4 mr-1.5" />
            Deposit
          </Button>
          <Button
            onClick={() => onWithdraw?.()}
            variant="outlined"
            disabled={!isBalanceReady || !onWithdraw}
            className="flex-1 sm:flex-none"
          >
            <ArrowUpFromLine className="h-4 w-4 mr-1.5" />
            Withdraw
          </Button>
        </div>
      </div>

      <WalletCompositionBar
        availableRsc={availableRsc}
        promotionalRsc={promotionalRsc}
        fundingCreditsRsc={fundingCreditsRsc}
      />

      <div>
        {showPromoWallet ? (
          <ResearchCoinExpandable
            availableRsc={availableRsc}
            promotionalRsc={promotionalRsc}
            showUSD={showUSD}
            exchangeRate={exchangeRate}
            isBalanceReady={isBalanceReady}
            defaultExpanded={defaultExpanded}
          />
        ) : (
          <AssetRow
            icon={
              <span className="inline-block [&>svg]:w-6 [&>svg]:h-6 sm:[&>svg]:w-8 sm:[&>svg]:h-8">
                <ResearchCoinIcon size={32} />
              </span>
            }
            name={
              <span className="inline-flex items-center gap-1.5 min-w-0 max-w-full">
                <span className="truncate">ResearchCoin</span>
                <ResearchCoinTooltip>
                  <HelpCircle className="h-[18px] w-[18px] text-gray-500 hover:text-gray-700 cursor-help transition-colors shrink-0" />
                </ResearchCoinTooltip>
              </span>
            }
            balance={
              isBalanceReady ? (
                <BalanceCell
                  primary={
                    showUSD ? (balance.formattedUsd ?? '$0.00') : `${balance.formatted ?? '0'} RSC`
                  }
                  secondary={
                    showUSD
                      ? `${balance.formatted ?? '0'} RSC`
                      : `${balance.formattedUsd ?? '$0.00'}`
                  }
                />
              ) : (
                <BalanceSkeleton />
              )
            }
            trailing={<CurrencyMenu items={rscMenuItems} />}
          />
        )}

        <AssetRow
          icon={
            <span className="inline-block [&>svg]:w-6 [&>svg]:h-6 sm:[&>svg]:w-8 sm:[&>svg]:h-8">
              <ResearchCoinIcon size={32} variant="green" outlined />
            </span>
          }
          name={
            <span className="inline-flex items-center gap-1.5 min-w-0 max-w-full">
              <span className="truncate">
                <span className="sm:hidden">Credits</span>
                <span className="hidden sm:inline">Funding Credits</span>
              </span>
              <FundingCreditsTooltip>
                <HelpCircle className="h-[18px] w-[18px] text-gray-500 hover:text-gray-700 cursor-help transition-colors shrink-0" />
              </FundingCreditsTooltip>
            </span>
          }
          balance={
            isBalanceReady ? (
              <BalanceCell
                primary={
                  showUSD
                    ? (lockedBalance.formattedUsd ?? '$0.00')
                    : `${lockedBalance.formatted ?? '0'} RSC`
                }
                secondary={
                  showUSD
                    ? `${lockedBalance.formatted ?? '0'} RSC`
                    : `${lockedBalance.formattedUsd ?? '$0.00'}`
                }
              />
            ) : (
              <BalanceSkeleton />
            )
          }
          trailing={<CurrencyMenu items={fcMenuItems} />}
          isLast
        />
      </div>
    </div>
  );
}

interface AssetRowProps {
  icon: ReactNode;
  name: ReactNode;
  subtext?: ReactNode;
  balance: ReactNode;
  trailing: ReactNode;
  isLast?: boolean;
  className?: string;
}

function AssetRow({ icon, name, subtext, balance, trailing, isLast, className }: AssetRowProps) {
  const borderClass = isLast ? '' : 'border-b border-gray-100';
  return (
    <div
      className={`flex items-start gap-3 px-4 sm:px-6 py-4 min-w-0 ${borderClass} ${className ?? ''}`}
    >
      <div className="shrink-0 w-8 h-10 flex items-center justify-center">{icon}</div>
      <div className="flex-1 min-w-0 pr-1">
        <div className="h-10 flex items-center min-w-0">
          <div className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight min-w-0 truncate">
            {name}
          </div>
        </div>
        {subtext && <div className="text-[11px] sm:text-xs text-gray-500 -mt-0.5">{subtext}</div>}
      </div>
      <div className="w-[84px] min-[360px]:w-[104px] sm:w-[140px] shrink-0 text-right min-w-0">
        {balance}
      </div>
      <div className="w-10 h-10 shrink-0 flex items-center justify-center -mr-2 sm:mr-0">
        {trailing}
      </div>
    </div>
  );
}

function BalanceCell({ primary, secondary }: { primary: string; secondary?: string }) {
  return (
    <div className="min-w-0">
      <div className="h-10 flex items-center justify-end min-w-0">
        <ResponsiveUsdLabel
          value={primary}
          className="text-xs sm:text-sm font-bold text-gray-900 leading-none truncate"
        />
      </div>
      {secondary && (
        <ResponsiveUsdLabel
          value={secondary}
          className="text-[11px] sm:text-xs text-gray-500 leading-none truncate -mt-2.5"
        />
      )}
    </div>
  );
}

function ResponsiveUsdLabel({ value, className }: { value: string; className: string }) {
  return <div className={className}>{stripUsdSuffix(value)}</div>;
}

function BalanceSkeleton() {
  return (
    <div className="inline-block">
      <div className="h-4 w-20 bg-gray-100 animate-pulse rounded" />
      <div className="h-3 w-14 bg-gray-100 animate-pulse rounded mt-1" />
    </div>
  );
}

function CurrencyMenu({ items }: { items: CurrencyMenuItem[] }) {
  return (
    <BaseMenu
      align="end"
      trigger={
        <button
          type="button"
          aria-label="More actions"
          className="h-10 w-10 rounded-md flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      }
    >
      {items.map((item) => (
        <BaseMenuItem
          key={item.label}
          onSelect={(e) => {
            if (item.disabled) {
              e.preventDefault();
              return;
            }
            item.onClick();
          }}
          disabled={item.disabled}
          className="cursor-pointer"
        >
          <span className="inline-flex items-center gap-2 text-gray-700">
            {item.icon}
            {item.label}
          </span>
        </BaseMenuItem>
      ))}
    </BaseMenu>
  );
}
