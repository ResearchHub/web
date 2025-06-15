'use client';

import { FC, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { formatRSC } from '@/utils/number';
import { Tip } from '@/types/tip';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { Icon } from '@/components/ui/icons/Icon';
import { Work } from '@/types/work';
import { TipContentModal } from '@/components/modals/TipContentModal';

interface SupportersSectionProps {
  tips: Tip[];
  documentId: number;
  onTip?: () => void;
}

export const SupportersSection: FC<SupportersSectionProps> = ({ tips = [], documentId, onTip }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllSupporters, setShowAllSupporters] = useState(false);

  const hasSupporters = tips && tips.length > 0;
  const displayLimit = 5; // Show only top 5 supporters in the sidebar
  const displayedSupporters = showAllSupporters ? tips : tips.slice(0, displayLimit);
  const hasMoreSupporters = tips.length > displayLimit;

  const handleTipSuccess = (amount: number) => {
    // Close the modal and potentially refresh data
    setIsModalOpen(false);
  };

  const handleTipClick = () => {
    if (onTip) {
      onTip();
    } else {
      // Open the tip modal
      setIsModalOpen(true);
    }
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Icon name="openGrant" size={22} color="#6b7280" />
        <h3 className="text-base font-semibold text-gray-900">Supporters</h3>
      </div>

      {hasSupporters ? (
        <>
          <div className="space-y-3">
            {displayedSupporters.map((tip, index) => (
              <div key={`${tip.user.id}-${index}`} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar
                    src={tip.user.authorProfile?.profileImage || ''}
                    alt={tip.user.fullName}
                    size="xs"
                  />
                  <span className="text-sm font-medium text-gray-900">{tip.user.fullName}</span>
                </div>
                <span className="text-sm font-medium text-orange-500">
                  +{formatRSC({ amount: tip.amount, round: true })} RSC
                </span>
              </div>
            ))}
          </div>

          {hasMoreSupporters && (
            <button
              onClick={() => setShowAllSupporters(!showAllSupporters)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-3 w-full text-center"
            >
              {showAllSupporters ? 'Show less' : `View all supporters (${tips.length})`}
            </button>
          )}
        </>
      ) : (
        <div className="py-1">
          <p className="text-sm text-gray-500 mb-3">Support the authors with ResearchCoin</p>
          <Button
            onClick={handleTipClick}
            variant="outlined"
            className="w-full flex items-center justify-center gap-2 text-primary-600 border-primary-300 hover:bg-primary-50"
          >
            <Icon name="tipRSC" size={20} />
            <span>Tip RSC</span>
          </Button>
        </div>
      )}

      {/* Tip Modal */}
      <TipContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contentId={documentId}
        feedContentType="PAPER"
        onTipSuccess={handleTipSuccess}
      />
    </section>
  );
};
