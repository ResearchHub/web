'use client';

import { useState } from 'react';
import { WorkMetadata } from '@/services/metadata.service';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatRSC } from '@/utils/number';
import { Button } from '@/components/ui/Button';
import { ApplyToGrantModal } from '@/components/modals/ApplyToGrantModal';
import { PreregistrationForModal } from '@/services/post.service';
import { Work } from '@/types/work';
import { Plus } from 'lucide-react';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';

interface GrantAmountSectionProps {
  work: Work;
}

export const GrantAmountSection = ({ work }: GrantAmountSectionProps) => {
  const usdAmount = work.note?.post?.grant?.amount?.usd ?? 0;
  const { exchangeRate, isLoading: isLoadingExchangeRate } = useExchangeRate();
  const { showUSD } = useCurrencyPreference();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

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
  };

  return (
    <>
      <div className="bg-primary-50 border border-primary-200 p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Total Funding Available</h3>
        <div className="flex flex-col gap-1 overflow-hidden">
          <div className="flex items-center gap-2 min-w-0">
            <CurrencyBadge
              amount={usdAmount}
              currency={showUSD ? 'USD' : 'RSC'}
              showText={showUSD}
              showIcon={true}
              variant="text"
              size="md"
              textColor="text-orange-600"
              className="text-2xl sm:text-3xl font-bold min-w-0 flex-shrink truncate"
              shorten={false}
              showExchangeRate={true}
            />
          </div>
          {/* Show conversion hint only when displaying USD and we have exchange rate */}

          {showUSD && isLoadingExchangeRate && usdAmount > 0 && (
            <div className="text-gray-500 text-base font-medium italic -mt-1">Loading RSC...</div>
          )}
        </div>
        {usdAmount > 0 && (
          <p className="text-sm text-gray-600 mt-2 mb-4">
            Multiple qualified applicants may be selected.
          </p>
        )}

        <Button
          onClick={() => {
            setIsApplyModalOpen(true);
          }}
          className="w-full mt-3 flex items-center justify-center gap-1"
          size="lg"
        >
          <Plus className="h-4 w-4" /> Submit application
        </Button>
      </div>

      <ApplyToGrantModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onUseSelected={handleUseSelectedPrereg}
        grantId={work.note?.post?.grant?.id || 0}
      />
    </>
  );
};
