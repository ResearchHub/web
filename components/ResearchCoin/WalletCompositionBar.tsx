'use client';

import { RSC_COLORS } from '@/components/ui/icons/ResearchCoinIcon';

interface WalletCompositionBarProps {
  availableRsc: number;
  promotionalRsc: number;
  fundingCreditsRsc: number;
}

export function WalletCompositionBar({
  availableRsc,
  promotionalRsc,
  fundingCreditsRsc,
}: WalletCompositionBarProps) {
  const total = availableRsc + promotionalRsc + fundingCreditsRsc;
  if (total <= 0) return null;

  const segments = [
    { key: 'available', value: availableRsc, color: RSC_COLORS.orange },
    { key: 'promotional', value: promotionalRsc, color: RSC_COLORS.blue },
    { key: 'fundingCredits', value: fundingCreditsRsc, color: RSC_COLORS.green },
  ].filter((s) => s.value > 0);

  return (
    <div className="px-4 sm:px-6 pb-3.5 sm:pb-4">
      <div
        className="flex h-2.5 overflow-hidden rounded-full bg-gray-100"
        role="img"
        aria-label="Balance mix across available ResearchCoin, promotional balance, and funding credits"
      >
        {segments.map((segment) => (
          <span
            key={segment.key}
            className="h-full"
            style={{
              width: `${(segment.value / total) * 100}%`,
              backgroundColor: segment.color,
            }}
          />
        ))}
      </div>
    </div>
  );
}
