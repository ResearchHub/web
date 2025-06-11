'use client';

import { useState } from 'react';
import { AvatarStack } from './AvatarStack';
import { ContributorModal } from '../modals/ContributorModal';
import type { AuthorProfile } from '@/types/authorProfile';
import { cn } from '@/utils/styles';

// Define a more flexible profile type
type FlexibleProfile = {
  profileImage?: string;
  fullName: string;
  [key: string]: any; // Allow any additional properties
};

interface LabelBadgeProps {
  count: number;
  label: string;
  size?: number | 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
}

// Extract the label badge as a separate component
export function LabelBadge({ count, label, size = 'xs' }: LabelBadgeProps) {
  // Use singular form if there's only one
  const displayLabel = count === 1 ? label.replace(/s$/, '') : label;

  // Size-based styles
  const getFontSize = () => {
    if (typeof size === 'number') {
      return `text-[${Math.max(size * 0.6, 12)}px]`;
    }

    switch (size) {
      case 'lg':
        return 'text-base font-medium';
      case 'md':
        return 'text-sm font-medium';
      case 'sm':
        return 'text-xs font-medium';
      case 'xxs':
      case 'xs':
      default:
        return 'text-xs';
    }
  };

  const getPadding = () => {
    if (typeof size === 'number') {
      const paddingX = Math.max(Math.floor(size * 0.25), 3);
      const paddingY = Math.max(Math.floor(size * 0.1), 1);
      return `px-${paddingX} py-${paddingY}`;
    }

    switch (size) {
      case 'lg':
        return 'px-5 py-1.5';
      case 'md':
        return 'px-4 py-1';
      case 'sm':
        return 'px-3 py-0.5';
      case 'xxs':
      case 'xs':
      default:
        return 'px-3 py-0.5';
    }
  };

  const getMargin = () => {
    if (typeof size === 'number') {
      return `-ml-[${Math.max(Math.floor(size * 0.3), 11)}px]`;
    }

    switch (size) {
      case 'lg':
        return '-ml-[18px]';
      case 'md':
        return '-ml-[16px]';
      case 'sm':
        return '-ml-[14px]';
      case 'xxs':
      case 'xs':
      default:
        return '-ml-[11px]';
    }
  };

  // Get ring size based on badge size
  const getRingSize = () => {
    if (typeof size === 'number') {
      return size >= 32 ? 'ring-[3px]' : 'ring-2';
    }

    switch (size) {
      case 'lg':
        return 'ring-[3px]';
      case 'md':
        return 'ring-[2.5px]';
      default:
        return 'ring-2';
    }
  };

  return (
    <div
      className={cn(
        'bg-gray-100 rounded-full ring-white shadow-sm z-10',
        getRingSize(),
        getPadding(),
        getMargin()
      )}
    >
      <span className={cn('text-gray-900 whitespace-nowrap', getFontSize())}>
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
  hideLabel?: boolean;
  size?: number | 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
  disableContribute?: boolean;
}

export function ContributorsButton({
  contributors,
  onContribute,
  label = 'Contributors',
  hideLabel = false,
  size = 'xs',
  disableContribute,
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

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center hover:opacity-80 transition-opacity"
      >
        <AvatarStack
          items={avatarItems}
          size={getAvatarSize()}
          maxItems={3}
          spacing={getSpacing()}
          ringColorClass="ring-white"
        />
        {!hideLabel && <LabelBadge count={contributors.length} label={label} size={size} />}
      </button>

      <ContributorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        contributors={contributors}
        onContribute={onContribute}
        disableContribute={disableContribute}
      />
    </>
  );
}
