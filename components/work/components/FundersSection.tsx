'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { computeGoalRate, Fundraise, getContributionTotal } from '@/types/funding';
import { Work } from '@/types/work';
import { isDeadlineInFuture } from '@/utils/date';
import { ContributorModal } from '@/components/modals/ContributorModal';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { SidebarHeader } from '@/components/ui/SidebarHeader';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { useRouter } from 'next/navigation';
import { useShareModalContext } from '@/contexts/ShareContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';

interface FundersSectionProps {
  fundraise: Fundraise;
  fundraiseTitle: string;
  /** Work object containing author information */
  work?: Work;
}

export const FundersSection: FC<FundersSectionProps> = ({ fundraise, fundraiseTitle, work }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const { showShareModal } = useShareModalContext();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const router = useRouter();
  const isCompleted = fundraise.status === 'COMPLETED';
  // For COMPLETED fundraises, use the goal rate so per-contributor totals sum to the goal.
  // For active fundraises, use the live RSC→USD rate.
  const goalRate = computeGoalRate(
    fundraise.status,
    fundraise.goalAmount.usd,
    fundraise.amountRaised.rsc
  );
  const effectiveRate = goalRate ?? exchangeRate;
  const displayCurrency: 'USD' | 'RSC' = showUSD ? 'USD' : 'RSC';
  const hasContributors =
    fundraise.contributors &&
    fundraise.contributors.numContributors > 0 &&
    fundraise.contributors.topContributors.length > 0;

  const topContributors = hasContributors ? fundraise.contributors.topContributors : [];
  const displayLimit = 5; // Show only top 5 contributors in the sidebar
  const displayedContributors = topContributors.slice(0, displayLimit);
  const hasMoreContributors = topContributors.length > displayLimit;

  // Check if fundraise is active
  const isActive =
    fundraise.status === 'OPEN' &&
    (fundraise.endDate ? isDeadlineInFuture(fundraise.endDate) : true);

  // Format contributors for modal
  const modalContributors = topContributors.map((contributor) => ({
    profile: {
      id: contributor.authorProfile.id,
      profileImage: contributor.authorProfile.profileImage,
      fullName: contributor.authorProfile.fullName,
    },
    amounts: contributor.totalContribution,
  }));

  const handleContributeClick = () => {
    setIsContributeModalOpen(true);
  };

  const handleContributeSuccess = () => {
    setIsContributeModalOpen(false);
    router.refresh();
    showShareModal({
      url: window.location.href,
      docTitle: fundraiseTitle,
      action: 'USER_FUNDED_PROPOSAL',
    });
    // Here you could add logic to refresh the data
  };

  return (
    <>
      <div>
        <SidebarHeader title="Funders" className="mb-3" />

        {hasContributors ? (
          <>
            <div className="space-y-3">
              {displayedContributors.map((contributor, index) => (
                <div
                  key={`${contributor.id}-${index}`}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={contributor.authorProfile.profileImage}
                      alt={contributor.authorProfile.fullName}
                      size="xs"
                      authorId={contributor.authorProfile.id}
                    />
                    <Link
                      href={`/author/${contributor.authorProfile.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      {contributor.authorProfile.fullName}
                    </Link>
                  </div>
                  <div className="flex items-center text-sm font-medium font-mono text-primary-600">
                    <span className="mr-0.5">+</span>
                    <CurrencyBadge
                      amount={(() => {
                        const total = getContributionTotal(
                          contributor.totalContribution,
                          displayCurrency,
                          effectiveRate
                        );
                        return showUSD ? Math.round(total) : total;
                      })()}
                      variant="text"
                      size="xs"
                      currency={displayCurrency}
                      showText={true}
                      textColor="text-primary-600"
                      fontWeight="font-semibold"
                      className="font-mono"
                      skipConversion={true}
                    />
                  </div>
                </div>
              ))}
            </div>

            {hasMoreContributors && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-3 w-full text-center"
              >
                View all funders ({fundraise.contributors.numContributors})
              </button>
            )}
          </>
        ) : (
          <div className="py-1">
            <p className="text-sm text-gray-500">No funders yet</p>
          </div>
        )}
      </div>

      {hasContributors && (
        <ContributorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          contributors={modalContributors}
          isCompleted={isCompleted}
          rscToUsdRate={effectiveRate}
        />
      )}

      <ContributeToFundraiseModal
        isOpen={isContributeModalOpen}
        onClose={() => setIsContributeModalOpen(false)}
        onContributeSuccess={handleContributeSuccess}
        fundraise={fundraise}
        proposalTitle={fundraiseTitle}
        work={work}
      />
    </>
  );
};
