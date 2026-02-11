'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { formatRSC } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { ModalContainer } from '@/components/ui/Modal/ModalContainer';
import { ModalHeader } from '@/components/ui/Modal/ModalHeader';

interface Contributor {
  profile: {
    id?: number;
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
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <ModalHeader
          title={sortedContributors.length === 1 ? 'Contributor' : 'Contributors'}
          onClose={onClose}
          subtitle={`Total: ${formatRSC({ amount: totalAmount, round: true })} RSC`}
        />

        <div className="space-y-4">
          <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-2">
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
                      authorId={contributor.profile.id}
                    />
                    {contributor.profile.id ? (
                      <Link
                        href={`/author/${contributor.profile.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {contributor.profile.fullName}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-gray-900">
                        {contributor.profile.fullName}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-orange-500">
                    +{formatRSC({ amount: contributor.amount, round: true })} RSC
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Button
              variant="contribute"
              size="lg"
              onClick={onContribute}
              className="w-full flex items-center justify-center gap-2"
              disabled={disableContribute}
            >
              <ResearchCoinIcon size={20} contribute />
              Contribute RSC
            </Button>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
};
