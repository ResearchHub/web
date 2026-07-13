'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { ResearchCoinIcon, RSC_COLORS } from '@/components/ui/icons/ResearchCoinIcon';
import { AvailableBalanceTooltip } from '@/components/tooltips/AvailableBalanceTooltip';
import { PromotionalBalanceTooltip } from '@/components/tooltips/PromotionalBalanceTooltip';
import { formatRSC, formatUsdValue } from '@/utils/number';
import { stripUsdSuffix } from './lib/display';
import { cn } from '@/utils/styles';

interface FormattedAmount {
  primary: string;
  secondary: string;
}

interface ResearchCoinExpandableProps {
  availableRsc: number;
  promotionalRsc: number;
  showUSD: boolean;
  exchangeRate: number | null;
  isBalanceReady: boolean;
}

const formatUsd = (n: number) => formatUsdValue(n.toString(), 0, false);

function formatPair(rsc: number, showUSD: boolean, exchangeRate: number | null): FormattedAmount {
  const usd = exchangeRate ? rsc * exchangeRate : 0;
  if (showUSD) {
    return {
      primary: formatUsd(usd),
      secondary: `${formatRSC({ amount: rsc })} RSC`,
    };
  }
  return {
    primary: `${formatRSC({ amount: rsc })} RSC`,
    secondary: formatUsd(usd),
  };
}

export function ResearchCoinExpandable({
  availableRsc,
  promotionalRsc,
  showUSD,
  exchangeRate,
  isBalanceReady,
}: Readonly<ResearchCoinExpandableProps>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const combinedRsc = availableRsc + promotionalRsc;
  const combined = formatPair(combinedRsc, showUSD, exchangeRate);
  const available = formatPair(availableRsc, showUSD, exchangeRate);
  const promotional = formatPair(promotionalRsc, showUSD, exchangeRate);

  return (
    <div>
      <button
        type="button"
        className={cn(
          'flex w-full items-start gap-3 px-4 sm:px-6 py-4 min-w-0 text-left',
          'border-t border-gray-100 bg-white hover:bg-gray-50 transition-colors',
          isExpanded ? 'pb-3' : 'border-b border-gray-100'
        )}
        aria-expanded={isExpanded}
        aria-controls="rsc-expand-panel"
        onClick={() => setIsExpanded((open) => !open)}
      >
        <div className="shrink-0 w-8 h-10 flex items-center justify-center">
          <span className="inline-block [&>svg]:w-6 [&>svg]:h-6 sm:[&>svg]:w-8 sm:[&>svg]:h-8">
            <ResearchCoinIcon size={32} />
          </span>
        </div>
        <div className="flex-1 min-w-0 pr-1 h-10 flex items-center">
          <div className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">
            ResearchCoin
          </div>
        </div>
        <div className="w-[84px] min-[360px]:w-[104px] sm:w-[140px] shrink-0 text-right min-w-0">
          {isBalanceReady ? (
            <ParentBalanceCell primary={combined.primary} secondary={combined.secondary} />
          ) : (
            <BalanceSkeleton />
          )}
        </div>
        <div className="w-10 h-10 shrink-0 flex items-center justify-center -mr-2 sm:mr-0">
          <ChevronDown
            className={cn(
              'h-[18px] w-[18px] text-gray-400 transition-transform',
              isExpanded && 'rotate-180'
            )}
            aria-hidden
          />
        </div>
      </button>

      {isExpanded && (
        <div id="rsc-expand-panel" className="w-full bg-gray-100">
          <SubtierRow
            dotColor={RSC_COLORS.orange}
            label="Available"
            meta="Withdrawable"
            tooltip={
              <AvailableBalanceTooltip wrapperClassName="h-auto">
                <HelpCircle className="h-3.5 w-3.5 text-gray-500 hover:text-gray-700 cursor-help transition-colors shrink-0" />
              </AvailableBalanceTooltip>
            }
            primary={available.primary}
            secondary={available.secondary}
            isBalanceReady={isBalanceReady}
          />
          <SubtierRow
            dotColor={RSC_COLORS.blue}
            label="Promotional"
            meta="Non-withdrawable · earns yield"
            tooltip={
              <PromotionalBalanceTooltip wrapperClassName="h-auto">
                <HelpCircle className="h-3.5 w-3.5 text-gray-500 hover:text-gray-700 cursor-help transition-colors shrink-0" />
              </PromotionalBalanceTooltip>
            }
            primary={promotional.primary}
            secondary={promotional.secondary}
            isBalanceReady={isBalanceReady}
          />
        </div>
      )}
    </div>
  );
}

interface SubtierRowProps {
  dotColor: string;
  label: string;
  meta: string;
  tooltip: ReactNode;
  primary: string;
  secondary: string;
  isBalanceReady: boolean;
}

function SubtierRow({
  dotColor,
  label,
  meta,
  tooltip,
  primary,
  secondary,
  isBalanceReady,
}: Readonly<SubtierRowProps>) {
  return (
    <div className="flex w-full items-start gap-3 px-4 sm:px-6 py-3 min-w-0 bg-gray-100">
      <div className="shrink-0 w-8 h-8 flex items-center justify-center" aria-hidden>
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />
      </div>
      <div className="flex-1 min-w-0 pr-1 pt-1.5">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight truncate">
            {label}
          </span>
          {tooltip}
        </div>
        <div className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-tight">{meta}</div>
      </div>
      <div className="w-[84px] min-[360px]:w-[104px] sm:w-[140px] shrink-0 text-right min-w-0 pt-1.5">
        {isBalanceReady ? (
          <SubtierBalanceCell primary={primary} secondary={secondary} />
        ) : (
          <BalanceSkeleton />
        )}
      </div>
      <div className="w-10 h-10 shrink-0 -mr-2 sm:mr-0" aria-hidden />
    </div>
  );
}

function ParentBalanceCell({
  primary,
  secondary,
}: Readonly<{ primary: string; secondary?: string }>) {
  return (
    <div className="min-w-0">
      <div className="h-10 flex items-center justify-end min-w-0">
        <div className="text-xs sm:text-sm font-bold text-gray-900 leading-none truncate">
          {stripUsdSuffix(primary)}
        </div>
      </div>
      {secondary && (
        <div className="text-[11px] sm:text-xs text-gray-500 leading-none truncate -mt-2.5">
          {stripUsdSuffix(secondary)}
        </div>
      )}
    </div>
  );
}

function SubtierBalanceCell({
  primary,
  secondary,
}: Readonly<{ primary: string; secondary?: string }>) {
  return (
    <div className="min-w-0">
      <div className="text-xs sm:text-sm font-bold text-gray-900 leading-none truncate">
        {stripUsdSuffix(primary)}
      </div>
      {secondary && (
        <div className="text-[11px] sm:text-xs text-gray-500 leading-none truncate mt-0.5">
          {stripUsdSuffix(secondary)}
        </div>
      )}
    </div>
  );
}

function BalanceSkeleton() {
  return (
    <div className="inline-block">
      <div className="h-4 w-20 bg-gray-100 animate-pulse rounded" />
      <div className="h-3 w-14 bg-gray-100 animate-pulse rounded mt-1" />
    </div>
  );
}
