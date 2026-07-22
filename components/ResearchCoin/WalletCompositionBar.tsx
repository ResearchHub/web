'use client';

import { RSC_COLORS } from '@/components/ui/icons/ResearchCoinIcon';
import { Tooltip } from '@/components/ui/Tooltip';
import { formatRSC, formatUsdValue } from '@/utils/number';

interface WalletCompositionBarProps {
  availableRsc: number;
  promotionalRsc: number;
  fundingCreditsRsc: number;
  showUSD: boolean;
  exchangeRate: number;
}

export function WalletCompositionBar({
  availableRsc,
  promotionalRsc,
  fundingCreditsRsc,
  showUSD,
  exchangeRate,
}: Readonly<WalletCompositionBarProps>) {
  const total = availableRsc + promotionalRsc + fundingCreditsRsc;
  if (total <= 0) return null;

  const segments = [
    {
      key: 'available',
      label: 'Available ResearchCoin',
      value: availableRsc,
      color: RSC_COLORS.orange,
    },
    {
      key: 'promotional',
      label: 'Promotional ResearchCoin',
      value: promotionalRsc,
      color: RSC_COLORS.blue,
    },
    {
      key: 'fundingCredits',
      label: 'Funding Credits',
      value: fundingCreditsRsc,
      color: RSC_COLORS.green,
    },
  ].filter((s) => s.value > 0);

  return (
    <div className="px-4 sm:px-6 pb-3.5 sm:pb-4">
      <div
        className="flex h-2.5 overflow-hidden rounded-full bg-gray-100"
        role="group"
        aria-label="Balance mix across available ResearchCoin, promotional balance, and funding credits"
      >
        {segments.map((segment) => {
          const rscValue = `${formatRSC({ amount: segment.value })} RSC`;
          const usdValue = formatUsdValue(segment.value.toString(), exchangeRate);
          const primaryValue = showUSD ? usdValue : rscValue;
          const secondaryValue = showUSD ? rscValue : usdValue;

          return (
            <div
              key={segment.key}
              className="h-full"
              style={{ width: `${(segment.value / total) * 100}%` }}
            >
              <Tooltip
                content={
                  <div className="text-left">
                    <div className="text-sm font-bold text-gray-900 mb-1">{segment.label}</div>
                    <div className="text-sm font-semibold text-gray-900">{primaryValue}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{secondaryValue}</div>
                  </div>
                }
                position="top"
                width="w-72"
                className="text-left"
                delay={800}
                wrapperClassName="!flex w-full"
              >
                <span
                  className="block h-full w-full cursor-help transition-[filter] duration-150 hover:brightness-110 focus-visible:brightness-110 focus-visible:outline-none"
                  style={{ backgroundColor: segment.color }}
                  tabIndex={0}
                  aria-label={`${segment.label}: ${primaryValue}; ${secondaryValue}`}
                />
              </Tooltip>
            </div>
          );
        })}
      </div>
    </div>
  );
}
