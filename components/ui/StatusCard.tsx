'use client';

import { FC, ReactNode } from 'react';
import { cn } from '@/utils/styles';

interface StatusCardProps {
  /** Variant determines the color scheme: 'active' for blue, 'inactive' for gray */
  variant?: 'active' | 'inactive';
  /** Additional className for the outer container */
  className?: string;
  /** Content to render inside the card */
  children: ReactNode;
}

/**
 * StatusCard component that provides consistent styling for active/inactive states
 * Used in FundraiseProgress, GrantInfo, and BountyInfo components
 */
export const StatusCard: FC<StatusCardProps> = ({ variant = 'active', className, children }) => {
  const isActive = variant === 'active';

  return (
    <div
      className={cn(
        'rounded-lg p-3 border cursor-default',
        isActive ? 'bg-primary-50 border-primary-100' : 'bg-gray-50 border-gray-200',
        className
      )}
    >
      {children}
    </div>
  );
};
