'use client';

import { useState } from 'react';
import { WorkMetadata } from '@/services/metadata.service';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatRSC } from '@/utils/number';
import { Button } from '@/components/ui/Button';
import {
  ApplyToGrantModal,
  PreregistrationForModal,
  mockPreregistrations,
} from '@/components/modals/ApplyToGrantModal';
import { Work } from '@/types/work';

interface GrantAmountSectionProps {
  work: Work;
}

export const GrantAmountSection = ({ work }: GrantAmountSectionProps) => {
  console.log('GrantAmountSection', work);
  const usdAmount = work.note?.post?.grant?.amount?.usd ?? 0;
  const { exchangeRate, isLoading: isLoadingExchangeRate } = useExchangeRate();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedPreregId, setSelectedPreregId] = useState<string | null>(null);

  if (!work.note?.post?.grant?.amount) {
    return null;
  }

  const handleUseSelectedPrereg = (prereg: PreregistrationForModal) => {
    console.log(
      'Apply using selected preregistration from GrantAmountSection:',
      prereg,
      'for workId:',
      work.id
    );
    setIsApplyModalOpen(false);
    setSelectedPreregId(null);
  };

  const handleDraftNewPrereg = () => {
    console.log('Draft new preregistration from GrantAmountSection for workId:', work.id);
    setIsApplyModalOpen(false);
    setSelectedPreregId(null);
  };

  return (
    <>
      <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Total Funding Available</h3>
        <div className="flex items-end gap-2 -ml-1">
          <CurrencyBadge
            amount={usdAmount}
            currency="USD"
            showText={true}
            showIcon={true}
            variant="text"
            size="md"
            textColor="text-indigo-700"
            className="text-4xl font-bold"
            shorten={false}
            showExchangeRate={true}
          />
          <div className="relative -top-[8px] right-[6px]">
            {!isLoadingExchangeRate && exchangeRate && exchangeRate > 0 && usdAmount > 0 && (
              <div className="flex items-center text-gray-500">
                <span className="text-sm font-medium">
                  {formatRSC({ amount: usdAmount / exchangeRate, shorten: true, round: true })} RSC
                </span>
              </div>
            )}
            {isLoadingExchangeRate && usdAmount > 0 && (
              <div className="text-gray-500 text-base font-medium italic">Loading RSC...</div>
            )}
          </div>
        </div>
        {usdAmount > 0 && (
          <p className="text-sm text-gray-600 mt-2 mb-4">
            Multiple qualified applicants may be selected.
          </p>
        )}

        <Button
          onClick={() => {
            setSelectedPreregId(null);
            setIsApplyModalOpen(true);
          }}
          className="w-full mt-3"
          size="lg"
        >
          Apply for Grant
        </Button>
      </div>

      <ApplyToGrantModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        preregistrations={mockPreregistrations}
        selectedPreregId={selectedPreregId}
        onSelectPreregId={setSelectedPreregId}
        onUseSelected={handleUseSelectedPrereg}
        onDraftNew={handleDraftNewPrereg}
      />
    </>
  );
};
