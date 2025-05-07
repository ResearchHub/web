'use client';

import { WorkMetadata } from '@/services/metadata.service';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { formatRSC } from '@/utils/number';

interface GrantAmountSectionProps {
  metadata: WorkMetadata;
}

export const GrantAmountSection = ({ metadata }: GrantAmountSectionProps) => {
  // Ensure fundraising and goalAmount exist, and prioritize USD
  const usdAmount = metadata.fundraising?.goalAmount?.usd ?? 0;
  const { exchangeRate, isLoading: isLoadingExchangeRate } = useExchangeRate();

  // If there's no USD amount to display (e.g., if only RSC was provided and we are strictly showing USD based on input)
  // we might still want to show the section if fundraising data exists, or hide it.
  // For now, if usdAmount is 0 (either truly 0 or because it was not provided), it will display $0.
  // We will only return null if there is no fundraising data at all.
  if (!metadata.fundraising) {
    return null;
  }

  return (
    <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Total Funding Available</h3>
      <div className="flex items-end gap-2 -ml-1">
        <CurrencyBadge
          amount={usdAmount} // Use the USD amount
          currency="USD" // Set currency to USD
          showText={true}
          showIcon={true}
          variant="text"
          size="md" // Affects icon size and some internal badge calculations
          textColor="text-indigo-700" // A slightly deeper indigo for more punch
          className="text-4xl font-bold" // Excitingly large and bold text!
          shorten={false}
          showExchangeRate={true} // Shows RSC equivalent in tooltip if exchange rate is available
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
      {/* Optional: Add a small note if usdAmount was 0 but RSC amount exists, e.g. "(Primary funding in RSC)" */}
      {/* Or a general note like the one below */}
      {usdAmount > 0 && (
        <p className="text-sm text-gray-600 mt-2">Multiple qualified applicants may be selected.</p>
      )}
    </div>
  );
};
