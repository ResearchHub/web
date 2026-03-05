'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { formatRSC } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import type { ContributionTotals } from '@/types/funding';

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
}

export const ContributorModal: FC<ContributorModalProps> = ({
  isOpen,
  onClose,
  contributors = [],
  onContribute,
  disableContribute,
}) => {
  const totalUsd = contributors.reduce((sum, c) => sum + c.amounts.usd, 0);
  const totalRsc = contributors.reduce((sum, c) => sum + c.amounts.rsc, 0);
  const hasUsdTotal = totalUsd > 0;
  const hasRscTotal = totalRsc > 0;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full rounded-lg bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div className="flex flex-col">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                {contributors.length === 1 ? 'Contributor' : 'Contributors'} ({contributors.length})
              </Dialog.Title>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span>Total:</span>
                {hasUsdTotal && (
                  <CurrencyBadge
                    amount={Math.round(totalUsd)}
                    variant="text"
                    size="xs"
                    currency="USD"
                    showText={true}
                    hideUSDText={false}
                    skipConversion={true}
                    showExchangeRate={false}
                  />
                )}
                {hasRscTotal && (
                  <CurrencyBadge
                    amount={Math.round(totalRsc)}
                    variant="text"
                    size="xs"
                    currency="RSC"
                    showText={true}
                    showExchangeRate={false}
                  />
                )}
                {!hasUsdTotal && !hasRscTotal && (
                  <span>{formatRSC({ amount: 0, round: true })} RSC</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="contribute"
                size="sm"
                onClick={onContribute}
                className="flex items-center gap-2"
                disabled={disableContribute}
              >
                <ResearchCoinIcon size={16} contribute />
                Contribute RSC
              </Button>
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
                  <div className="flex items-center gap-2 text-sm font-medium text-orange-500">
                    <span className="mr-0.5">+</span>
                    {contributor.amounts.usd > 0 && (
                      <CurrencyBadge
                        amount={Math.round(contributor.amounts.usd)}
                        variant="text"
                        size="xs"
                        currency="USD"
                        showText={true}
                        hideUSDText={false}
                        skipConversion={true}
                        showExchangeRate={false}
                      />
                    )}
                    {contributor.amounts.rsc > 0 && (
                      <CurrencyBadge
                        amount={Math.round(contributor.amounts.rsc)}
                        variant="text"
                        size="xs"
                        currency="RSC"
                        showText={true}
                        showExchangeRate={false}
                      />
                    )}
                    {contributor.amounts.usd <= 0 && contributor.amounts.rsc <= 0 && (
                      <span>{formatRSC({ amount: 0, round: true })} RSC</span>
                    )}
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
