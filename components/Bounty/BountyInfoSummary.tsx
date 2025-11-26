'use client';

import { FC, useMemo } from 'react';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { ContributorsButton } from '@/components/ui/ContributorsButton';
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

  // Accumulate and dedupe contributors from all open bounties
  const contributors = useMemo(() => {
    // Flatten all contributions from all open bounties
    const allContributions: BountyContribution[] = openBounties.flatMap(
      (bounty) => bounty.contributions || []
    );

    // Create a map to dedupe by author ID
    const contributorMap = new Map<
      number,
      {
        profile: {
          profileImage: string;
          fullName: string;
          id: number;
        };
        amount: number;
      }
    >();

    // Process each contribution
    allContributions.forEach((contribution: BountyContribution) => {
      const authorId = contribution.createdBy?.authorProfile?.id || 0;
      if (authorId === 0) return; // Skip invalid contributors

      const amount =
        typeof contribution.amount === 'string'
          ? parseFloat(contribution.amount) || 0
          : contribution.amount || 0;

      // If contributor already exists, accumulate their amount
      if (contributorMap.has(authorId)) {
        const existing = contributorMap.get(authorId)!;
        existing.amount += amount;
      } else {
        // Add new contributor
        contributorMap.set(authorId, {
          profile: {
            profileImage: contribution.createdBy?.authorProfile?.profileImage || '',
            fullName: contribution.createdBy?.authorProfile?.fullName || 'Anonymous',
            id: authorId,
          },
          amount,
        });
      }
    });

    // Convert map to array
    return Array.from(contributorMap.values());
  }, [openBounties]);

  return (
    <div
      className={cn(
        'bg-primary-50 rounded-lg p-4 border border-primary-100 cursor-default',
        className
      )}
    >
      {/* Top Section: Total Amount */}
      <div className="flex flex-row flex-wrap items-start justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Total Amount */}
          <div className="text-left flex sm:!block justify-between w-full sm:!w-auto items-center">
            <span className="text-gray-500 text-base mb-1 inline-block">Bounty for</span>
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

          {/* Contributors */}
          {contributors.length > 0 && (
            <div className={cn('flex justify-center mobile:!justify-end')}>
              <ContributorsButton
                contributors={contributors}
                onContribute={() => {}}
                label="Contributors"
                size="md"
                disableContribute={false}
                variant="count"
                customOnClick={() => {}}
              />
            </div>
          )}
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
