'use client';

import { FC } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { formatRSC } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';

interface Contributor {
  profile: {
    profileImage?: string | null;
    fullName: string;
  };
  amount: number;
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
  const sortedContributors = [...contributors].sort((a, b) => b.amount - a.amount);
  const totalAmount = contributors.reduce((sum, c) => sum + c.amount, 0);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full rounded-lg bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div className="flex flex-col">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                {sortedContributors.length === 1 ? 'Contributor' : 'Contributors'} (
                {sortedContributors.length})
              </Dialog.Title>
              <div className="text-sm text-gray-500">
                Total: {formatRSC({ amount: totalAmount, round: true })} RSC
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
              {sortedContributors.map((contributor, index) => (
                <div
                  key={contributor.profile.fullName + index}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={contributor.profile.profileImage}
                      alt={contributor.profile.fullName}
                      size="sm"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {contributor.profile.fullName}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-orange-500">
                    +{formatRSC({ amount: contributor.amount, round: true })} RSC
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
