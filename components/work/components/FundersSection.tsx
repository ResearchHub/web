'use client';

import { FC, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { formatRSC } from '@/utils/number';
import { Fundraise } from '@/types/funding';
import { isDeadlineInFuture } from '@/utils/date';
import { ContributorModal } from '@/components/modals/ContributorModal';
import { Users } from 'lucide-react';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useRouter } from 'next/navigation';
import { useShareModalContext } from '@/contexts/ShareContext';

interface FundersSectionProps {
  fundraise: Fundraise;
  fundraiseTitle: string;
}

export const FundersSection: FC<FundersSectionProps> = ({ fundraise, fundraiseTitle }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const { showUSD } = useCurrencyPreference();
  const { showShareModal } = useShareModalContext();
  const router = useRouter();
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
      profileImage: contributor.authorProfile.profileImage,
      fullName: contributor.authorProfile.fullName,
    },
    amount: contributor.totalContribution,
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
        <div className="flex items-center gap-2 mb-3">
          <Users size={18} className="text-gray-700" />
          <h3 className="text-base font-semibold text-gray-900">Funders</h3>
        </div>

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
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {contributor.authorProfile.fullName}
                    </span>
                  </div>
                  <div className="flex items-center text-sm font-medium text-orange-500">
                    <span className="mr-0.5">+</span>
                    <CurrencyBadge
                      amount={contributor.totalContribution}
                      variant="text"
                      size="xs"
                      currency={showUSD ? 'USD' : 'RSC'}
                      showText={true}
                      className="text-orange-500 font-medium"
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
          onContribute={handleContributeClick}
          disableContribute={!isActive}
        />
      )}

      <ContributeToFundraiseModal
        isOpen={isContributeModalOpen}
        onClose={() => setIsContributeModalOpen(false)}
        onContributeSuccess={handleContributeSuccess}
        fundraise={fundraise}
      />
    </>
  );
};
