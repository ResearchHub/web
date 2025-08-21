'use client';

import { Coins } from 'lucide-react';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { calculateOpenBountiesAmount } from '@/components/Bounty/lib/bountyUtil';
import { buildWorkUrl } from '@/utils/url';
import { useRouter } from 'next/navigation';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { useBountiesFeed } from '@/hooks/useBountiesFeed';

interface EarningOpportunityBannerProps {
  work: Work;
  metadata: WorkMetadata;
  onViewBounties?: () => void;
}

export const EarningOpportunityBanner = ({
  work,
  metadata,
  onViewBounties,
}: EarningOpportunityBannerProps) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const router = useRouter();

  // Get bounty data with complete information using the feed hook
  const { entries: bountyEntries } = useBountiesFeed(10, 'OPEN');

  // Custom function to calculate banner amount using feed data
  const calculateBannerAmount = (showUSD: boolean, exchangeRate: number): number => {
    if (!bountyEntries || bountyEntries.length === 0) return 0;

    // Filter bounties for this specific work
    const workBounties = bountyEntries.filter((entry) => {
      const bountyContent = entry.content as any;
      return bountyContent.bounty && bountyContent.relatedDocumentId === work.id;
    });

    return workBounties.reduce((sum, entry) => {
      const bountyContent = entry.content as any;
      const bounty = bountyContent.bounty;
      const feedAuthor = bountyContent.createdBy;

      // Check if this is a ResearchHub Foundation bounty (userId 23)
      const isResearchHubFoundationBounty =
        bounty.createdBy?.id === 153359 || feedAuthor?.id === 153359;

      if (isResearchHubFoundationBounty) {
        // Use fixed $150 USD or its RSC equivalent for ResearchHub Foundation bounties
        if (showUSD) {
          return sum + 150;
        } else {
          return sum + Math.round(150 / exchangeRate);
        }
      } else {
        // Use actual bounty amount for other users
        const actualAmount = parseFloat(bounty.amount || bounty.totalAmount || '0');
        if (showUSD) {
          // Convert RSC to USD for display
          return sum + Math.round(actualAmount * exchangeRate);
        } else {
          // Show RSC amount
          return sum + actualAmount;
        }
      }
    }, 0);
  };

  // Don't show banner if no open bounties
  if (!metadata.bounties || metadata.openBounties === 0) {
    return null;
  }

  // Debug logging in development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    const calculatedAmount = calculateBannerAmount(showUSD, exchangeRate);
    console.log('EarningOpportunityBanner debug:', {
      bountyEntries: bountyEntries?.map((entry) => {
        const bountyContent = entry.content as any;
        return {
          id: bountyContent.bounty?.id,
          amount: bountyContent.bounty?.amount,
          totalAmount: bountyContent.bounty?.totalAmount,
          status: bountyContent.bounty?.status,
          relatedDocumentId: bountyContent.relatedDocumentId,
          workId: work.id,
          createdBy: {
            id: bountyContent.bounty?.createdBy?.id,
            fullName: bountyContent.bounty?.createdBy?.fullName,
            email: bountyContent.bounty?.createdBy?.email,
          },
          feedAuthor: {
            id: bountyContent.createdBy?.id,
            fullName: bountyContent.createdBy?.fullName,
            email: bountyContent.createdBy?.email,
          },
          isResearchHubFoundation:
            bountyContent.bounty?.createdBy?.id === 153359 ||
            bountyContent.createdBy?.id === 153359,
        };
      }),
      openBounties: metadata.openBounties,
      calculatedAmount,
      showUSD,
      exchangeRate,
      finalDisplayValue: calculatedAmount,
    });
  }

  const handleViewBounties = () => {
    if (onViewBounties) {
      onViewBounties();
    } else {
      const bountiesUrl = buildWorkUrl({
        id: work.id,
        contentType: work.contentType === 'paper' ? 'paper' : 'post',
        slug: work.slug,
        tab: 'bounties',
      });
      router.push(bountiesUrl);
    }
  };

  return (
    <div className="mb-6">
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
        <div className="p-4">
          <div className="flex flex-col gap-4 mobile:!flex-row mobile:!items-center mobile:!justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Coins className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-orange-900 flex items-center gap-1">
                  <span className="font-semibold">
                    {showUSD ? '$' : ''}
                    {calculateBannerAmount(showUSD, exchangeRate).toLocaleString()}
                    {!showUSD ? ' RSC' : ''}
                  </span>
                  <span>Earning Opportunity</span>
                </h2>
                <p className="mt-1 text-sm text-orange-700">
                  Earn ResearchCoin by completing bounties on this paper
                </p>
              </div>
            </div>
            <button
              onClick={handleViewBounties}
              className="px-4 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
            >
              View Bounties
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
