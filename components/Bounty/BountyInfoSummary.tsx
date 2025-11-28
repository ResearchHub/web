'use client';

import { FC, useMemo } from 'react';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
import { Bounty, BountyContribution } from '@/types/bounty';
import { Work } from '@/types/work';
import { colors } from '@/app/styles/colors';
import { cn } from '@/utils/styles';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';

interface BountyInfoSummaryProps {
  bounties: Bounty[];
  onDetailsClick: (e: React.MouseEvent) => void;
  className?: string;
  relatedWork?: Work;
}

export const BountyInfoSummary: FC<BountyInfoSummaryProps> = ({
  bounties,
  onDetailsClick,
  className,
}) => {
  const { showUSD } = useCurrencyPreference();

  // Filter to only open bounties
  const openBounties = useMemo(
    () => bounties.filter((bounty) => bounty.status === 'OPEN'),
    [bounties]
  );

  // If no open bounties, don't render anything
  if (openBounties.length === 0) {
    return null;
  }

  // Accumulate total amount from all open bounties
  const totalAmount = useMemo(() => {
    return openBounties.reduce((total, bounty) => {
      const amount = parseFloat(bounty.totalAmount || bounty.amount || '0');
      return total + amount;
    }, 0);
  }, [openBounties]);

  return (
    <div
      className={cn(
        'bg-primary-50 rounded-lg p-3 border border-primary-100 cursor-default',
        className
      )}
    >
      {/* Top Section: Total Amount */}
      <div className="flex flex-row flex-wrap items-start justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Total Amount */}
          <div className="text-left flex sm:!block justify-between w-full sm:!w-auto items-center">
            <span className="text-gray-500 text-sm mb-0.5 inline-block">Bounty for</span>
            <div className="flex items-center flex-wrap min-w-0 truncate font-semibold">
              <CurrencyBadge
                amount={Math.round(totalAmount)}
                variant="text"
                size="xl"
                showText={true}
                currency={showUSD ? 'USD' : 'RSC'}
                className="p-0 gap-0"
                textColor="text-gray-700"
                showExchangeRate={false}
                iconColor={colors.gray[700]}
                iconSize={24}
                shorten
              />
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-2">
          <Button variant="outlined" size="md" onClick={onDetailsClick}>
            Details
          </Button>
        </div>
      </div>
    </div>
  );
};
