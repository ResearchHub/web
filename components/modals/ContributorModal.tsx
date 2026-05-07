'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { ContributionTotals, getContributionTotal } from '@/types/funding';

interface Contributor {
  profile: {
    id?: number;
    profileImage?: string | null;
    fullName: string;
  };
  amounts: ContributionTotals;
}

interface ContributorModalProps {
  isOpen: boolean;
  onClose: () => void;
  contributors: Contributor[];
  onContribute?: () => void;
  disableContribute?: boolean;
  isCompleted?: boolean;
  /**
   * Rate used to combine RSC + direct USD contributions.
   * Pass the fundraise goal rate when COMPLETED; falls back to the live exchange rate.
   */
  rscToUsdRate?: number;
}

export const ContributorModal: FC<ContributorModalProps> = ({
  isOpen,
  onClose,
  contributors = [],
  isCompleted = false,
  rscToUsdRate,
}) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const effectiveRate = rscToUsdRate ?? exchangeRate;
  const displayCurrency: 'USD' | 'RSC' = showUSD ? 'USD' : 'RSC';
  const totalAmount = contributors.reduce(
    (sum, c) => sum + getContributionTotal(c.amounts, displayCurrency, effectiveRate),
    0
  );
  const formattedTotal = showUSD ? Math.round(totalAmount) : totalAmount;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full rounded-lg bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div className="flex flex-col">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                {contributors.length === 1 ? 'Funder' : 'Funders'} ({contributors.length})
              </Dialog.Title>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <span>Total:</span>
                <CurrencyBadge
                  amount={formattedTotal}
                  variant="text"
                  size="xs"
                  currency={displayCurrency}
                  showText={true}
                  textColor="text-gray-700"
                  fontWeight="font-semibold"
                  showExchangeRate={false}
                  skipConversion={true}
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <div className="px-4 py-3 max-h-[60vh] overflow-y-auto">
            <div className="space-y-3">
              {contributors.map((contributor, index) => (
                <div
                  key={contributor.profile.fullName + index}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={contributor.profile.profileImage}
                      alt={contributor.profile.fullName}
                      size="sm"
                      authorId={contributor.profile.id}
                    />
                    {contributor.profile.id ? (
                      <Link
                        href={`/author/${contributor.profile.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {contributor.profile.fullName}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-gray-900">
                        {contributor.profile.fullName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm font-medium font-mono text-primary-600">
                    <span className="mr-0.5">+</span>
                    <CurrencyBadge
                      amount={(() => {
                        const total = getContributionTotal(
                          contributor.amounts,
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
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
