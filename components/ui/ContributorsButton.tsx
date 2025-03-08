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

interface LabelBadgeProps {
  count: number;
  label: string;
}

// Extract the label badge as a separate component
export function LabelBadge({ count, label }: LabelBadgeProps) {
  // Use singular form if there's only one
  const displayLabel = count === 1 ? label.replace(/s$/, '') : label;

  return (
    <div className="bg-indigo-100 rounded-full px-3 -ml-[11px] ring-2 ring-white shadow-sm z-10">
      <span className="text-xs text-indigo-600 font-normal whitespace-nowrap">
        {count} {displayLabel}
      </span>
    </div>
  );
}

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
        <LabelBadge count={contributors.length} label={label} />
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
