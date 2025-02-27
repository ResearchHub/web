'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { Plus } from 'lucide-react';

interface RSCBadgeProps {
  amount: number;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'inline' | 'badge' | 'contribute';
  /** Whether to show "RSC" text after the amount */
  showText?: boolean;
  /** Whether to show the RSC icon */
  showIcon?: boolean;
  /** Whether to invert colors between amount and RSC text */
  inverted?: boolean;
  /** Custom label to show after "RSC" (e.g., "awarded") */
  label?: string;
}

export const RSCBadge: FC<RSCBadgeProps> = ({
  amount,
  className,
  size = 'sm',
  variant = 'badge',
  showText = true,
  showIcon = true,
  inverted = false,
  label,
}) => {
  const sizeClasses = {
    xs: 'text-xs gap-1',
    sm: 'text-sm gap-1.5',
    md: 'text-base gap-2',
  };

  const variantClasses = {
    badge: 'rounded-md border border-orange-200 bg-orange-50 py-1.5 px-3',
    inline: '',
    contribute:
      'rounded-md border border-orange-200 hover:border-orange-300 hover:bg-orange-50 py-1.5 px-3',
  };

  const iconSizes = {
    xs: 16,
    sm: 18,
    md: 20,
  };

  return (
    <div className={cn('flex items-center', sizeClasses[size], variantClasses[variant], className)}>
      {showIcon && <ResearchCoinIcon size={iconSizes[size]} outlined={variant === 'inline'} />}
      {inverted ? (
        <div className="flex items-center">
          <span className="text-orange-800 mr-1">{amount.toLocaleString()}</span>
          {showText && (
            <span className="text-orange-600 text-xs">RSC{label ? ` ${label}` : ''}</span>
          )}
        </div>
      ) : (
        <span className="text-orange-500">
          {amount.toLocaleString()}
          {showText && ` RSC${label ? ` ${label}` : ''}`}
        </span>
      )}
    </div>
  );
};
