'use client';

import { useState } from 'react';
import { AvatarStack } from './AvatarStack';
import { ContributorModal } from '../modals/ContributorModal';
import type { AuthorProfile } from '@/types/authorProfile';

// Define a more flexible profile type
type FlexibleProfile = {
  profileImage?: string;
  fullName: string;
  [key: string]: any; // Allow any additional properties
};

interface ContributorsButtonProps {
  contributors: Array<{
    profile: FlexibleProfile;
    amount: number;
  }>;
  onContribute?: () => void;
  label?: string;
}

export function ContributorsButton({
  contributors,
  onContribute,
  label = 'Contributors',
}: ContributorsButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const avatarItems = contributors.map(({ profile }) => ({
    src: profile.profileImage || '',
    alt: profile.fullName,
    tooltip: profile.fullName,
  }));

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center hover:opacity-80 transition-opacity"
      >
        <AvatarStack
          items={avatarItems}
          size="xs"
          maxItems={3}
          spacing={-10}
          ringColorClass="ring-white"
        />
        <div className="bg-gray-100 rounded-full px-3 -ml-[11px] ring-2 ring-white shadow-sm z-10">
          <span className="text-xs text-gray-500 font-normal whitespace-nowrap">
            {contributors.length} {label}
          </span>
        </div>
      </button>

      <ContributorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        contributors={contributors}
        onContribute={onContribute}
      />
    </>
  );
}
