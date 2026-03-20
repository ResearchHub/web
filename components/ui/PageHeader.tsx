'use client';

import Link from 'next/link';
import { cn } from '@/utils/styles';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { Tooltip } from '@/components/ui/Tooltip';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatRSC } from '@/utils/number';

const BOUNTY_AMOUNT_USD = 150;

interface PageHeaderProps {
  title: string;
  className?: string;
  hasBounty?: boolean;
  bountyUrl?: string;
}

export function PageHeader({ title, className, hasBounty = false, bountyUrl }: PageHeaderProps) {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  const bountyDisplay = showUSD
    ? `$${BOUNTY_AMOUNT_USD}`
    : `${formatRSC({ amount: exchangeRate > 0 ? Math.round(BOUNTY_AMOUNT_USD / exchangeRate) : 0, shorten: true, round: true })} RSC`;

  return (
    <>
      {hasBounty && (
        <div className="flex items-center gap-2 mb-2 mt-2">
          <RadiatingDot color="bg-green-500" isRadiating />
          <span className="text-sm font-medium text-green-600">
            Peer review for <span className="font-mono">{bountyDisplay}</span>
          </span>
          <Tooltip
            content={
              <div className="p-1 text-xs">
                <p className="mb-1">Earn RSC by submitting a peer review.</p>
                {bountyUrl && (
                  <Link href={bountyUrl} className="text-primary-600 hover:underline font-medium">
                    View bounties →
                  </Link>
                )}
              </div>
            }
            position="bottom"
            width="w-48"
          >
            <span className="text-xs text-gray-400 hover:text-gray-600 cursor-help underline decoration-dotted">
              Learn more
            </span>
          </Tooltip>
        </div>
      )}
      <h1 className={cn('text-4xl font-semibold tracking-tight text-gray-900 mb-3', className)}>
        {title}
      </h1>
    </>
  );
}
