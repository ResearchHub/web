'use client';

import { useState } from 'react';
import { AvatarStack } from './AvatarStack';
import { ContributorModal } from '../modals/ContributorModal';
import type { ContributionTotals } from '@/types/funding';
import { cn } from '@/utils/styles';

// Define a more flexible profile type
type FlexibleProfile = {
  profileImage?: string;
  fullName: string;
  [key: string]: any; // Allow any additional properties
};

interface ContributorsButtonProps {
  contributors: Array<{
    profile: FlexibleProfile;
    amounts: ContributionTotals;
  }>;
  onContribute?: () => void;
  label?: string;
  hideLabel?: boolean;
  size?: number | 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
  disableContribute?: boolean;
  isCompleted?: boolean;
}

export function ContributorsButton({
  contributors,
  onContribute,
  label = 'Contributors',
  hideLabel = false,
  size = 'xs',
  disableContribute,
  isCompleted = false,
}: ContributorsButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const avatarItems = contributors.map(({ profile }) => ({
    src: profile.profileImage || '',
    alt: profile.fullName,
    tooltip: profile.fullName,
  }));

  // Convert size to AvatarStack size
  const getAvatarSize = () => {
    if (typeof size === 'number') {
      // For numeric sizes, map to the closest supported size
      if (size <= 16) return 'xxs';
      if (size <= 24) return 'xs';
      if (size <= 32) return 'sm';
      return 'md';
    }

    // Map string sizes to AvatarStack sizes
    switch (size) {
      case 'lg':
        return 'md';
      case 'md':
        return 'sm';
      case 'sm':
        return 'xs';
      case 'xs':
        return 'xxs';
      default:
        return size; // for 'xxs', 'xs', 'sm', 'md'
    }
  };

  // Calculate spacing based on avatar size
  const getSpacing = () => {
    const avatarSize = getAvatarSize();
    switch (avatarSize) {
      case 'md':
        return -16;
      case 'sm':
        return -12;
      case 'xs':
        return -10;
      case 'xxs':
        return -8;
      default:
        return -10;
    }
  };

  // Get label font size based on button size
  const getLabelFontSize = () => {
    if (typeof size === 'number') {
      return 'text-xs';
    }
    switch (size) {
      case 'lg':
        return 'text-base';
      case 'md':
        return 'text-sm';
      default:
        return 'text-xs';
    }
  };

  // Get display label (singular/plural)
  const displayLabel = contributors.length === 1 ? label.replace(/s$/, '') : label;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full px-2 py-1 transition-colors"
      >
        {!hideLabel && (
          <span
            className={cn('text-gray-700 font-medium pl-1 whitespace-nowrap', getLabelFontSize())}
          >
            {contributors.length} {displayLabel}
          </span>
        )}
        <AvatarStack
          items={avatarItems}
          size={getAvatarSize()}
          maxItems={3}
          spacing={getSpacing()}
          ringColorClass="ring-gray-50"
          showLabel={false}
        />
      </button>

      <ContributorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        contributors={contributors}
        isCompleted={isCompleted}
      />
    </>
  );
}
