'use client';

import { FC, useState, useMemo } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { formatRSC } from '@/utils/number';
import { Tip } from '@/types/tip';
import { HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { Icon } from '@/components/ui/icons/Icon';
import { Work } from '@/types/work';
import { TipContentModal } from '@/components/modals/TipContentModal';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';

interface SupportersSectionProps {
  tips: Tip[];
  documentId: number;
  onTip?: () => void;
}

export const SupportersSection: FC<SupportersSectionProps> = ({ tips = [], documentId, onTip }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllSupporters, setShowAllSupporters] = useState(false);
  const { showUSD } = useCurrencyPreference();

  const consolidatedTips = useMemo(() => {
    const byUser = tips.reduce((acc, { user, amount }) => {
      const existing = acc.get(user.id);
      return acc.set(user.id, {
        user,
        amount: (existing?.amount || 0) + amount,
      });
    }, new Map<number, { user: Tip['user']; amount: number }>());
    return Array.from(byUser.values()).sort((a, b) => b.amount - a.amount);
  }, [tips]);

  const hasSupporters = consolidatedTips.length > 0;
  const displayLimit = 5; // Show only top 5 supporters in the sidebar
  const displayedSupporters = showAllSupporters
    ? consolidatedTips
    : consolidatedTips.slice(0, displayLimit);
  const hasMoreSupporters = consolidatedTips.length > displayLimit;

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
        <HeartHandshake className="w-6 h-6 text-gray-600" />
        <h3 className="text-base font-semibold text-gray-900">Supporters</h3>
      </div>

      {hasSupporters ? (
        <>
          <div className="space-y-3">
            {displayedSupporters.map((supporter) => (
              <div key={supporter.user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar
                    src={supporter.user.authorProfile?.profileImage || ''}
                    alt={supporter.user.fullName}
                    size="xs"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {supporter.user.fullName}
                  </span>
                </div>
                <div className="flex items-center text-sm font-medium text-orange-500">
                  <span className="mr-0.5">+</span>
                  <CurrencyBadge
                    amount={supporter.amount}
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

          {hasMoreSupporters && (
            <button
              onClick={() => setShowAllSupporters(!showAllSupporters)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-3 w-full text-center"
            >
              {showAllSupporters ? 'Show less' : `View all supporters (${consolidatedTips.length})`}
            </button>
          )}

          <div className="mt-4">
            <Button
              onClick={handleTipClick}
              variant="ghost"
              size="sm"
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
            >
              <Icon name="tipRSC" size={16} />
              <span className="text-sm">Add your support</span>
            </Button>
          </div>
        </>
      ) : (
        <div className="py-1">
          <p className="text-sm text-gray-500 mb-3">Support the authors with ResearchCoin</p>
          <Button
            onClick={handleTipClick}
            variant="outlined"
            size="sm"
            className="w-full flex items-center justify-center gap-2 text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            <Icon name="tipRSC" size={18} />
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
