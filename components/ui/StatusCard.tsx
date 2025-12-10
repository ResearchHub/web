'use client';

import { FC, ReactNode } from 'react';
import { cn } from '@/utils/styles';

interface StatusCardProps {
  variant?: 'active' | 'inactive' | 'orange';
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
  const getVariantStyles = () => {
    switch (variant) {
      case 'active':
        return 'bg-primary-50 border-primary-100';
      case 'orange':
        return 'bg-orange-50 border-orange-100';
      case 'inactive':
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={cn('rounded-lg p-3 border cursor-default', getVariantStyles(), className)}>
      {children}
    </div>
  );
};
