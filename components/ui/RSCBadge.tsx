'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { Badge } from './Badge';

interface RSCBadgeProps {
  amount: number;
  className?: string;
  size?: 'xxs' | 'xs' | 'sm' | 'md';
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
  // Custom size classes that override Badge's default sizes
  const sizeClasses = {
    xxs: 'text-[10px] gap-0.5 py-0 px-1',
    xs: 'text-xs gap-1',
    sm: 'text-sm gap-1.5',
    md: 'text-base gap-2',
  };

  // Define orange theme colors
  const colors = {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    hoverBorder: 'hover:border-orange-300',
    hoverBg: 'hover:bg-orange-50',
    text: 'text-orange-500',
    textDark: 'text-orange-600',
    textMedium: 'text-gray-600',
    iconColor: '#F97316', // orange-500
  };

  // Map our custom variants to classes
  const variantClasses = {
    badge: `${colors.bg}`,
    inline: '',
    contribute: `${colors.hoverBorder} ${colors.hoverBg}`,
  };

  // Map our size to Badge size
  const badgeSize = size === 'xxs' || size === 'xs' ? 'sm' : size === 'sm' ? 'default' : 'lg';

  const iconSizes = {
    xxs: 12,
    xs: 16,
    sm: 18,
    md: 20,
  };

  // Only use Badge for badge and contribute variants
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center px-2 py-0.5', sizeClasses[size], className)}>
        {showIcon && (
          <ResearchCoinIcon size={iconSizes[size]} outlined={true} color={colors.iconColor} />
        )}
        {inverted ? (
          <div className="flex items-center">
            {label && (
              <span className={cn(colors.textDark, 'mr-0.5 text-[10px] font-bold')}>{label}</span>
            )}
            <span className={cn(colors.textDark)}>{amount.toLocaleString()}</span>
            {showText && <span className={cn(colors.textMedium, 'text-xs ml-1')}>RSC</span>}
          </div>
        ) : (
          <div className="flex items-center">
            {label && (
              <span className={cn(colors.textDark, 'mr-0.5 text-[10px] font-bold')}>{label}</span>
            )}
            <span className={colors.text}>{amount.toLocaleString()}</span>
            {showText && <span className={cn(colors.textMedium, 'ml-1')}>RSC</span>}
          </div>
        )}
      </div>
    );
  }

  return (
    <Badge
      variant="orange"
      size={badgeSize}
      className={cn(
        'flex items-center',
        sizeClasses[size],
        variantClasses[variant],
        variant === 'badge' || variant === 'contribute' ? 'py-1.5 px-3' : '',
        size === 'xxs' && 'py-0.5 px-1.5',
        className
      )}
    >
      {showIcon && (
        <ResearchCoinIcon size={iconSizes[size]} outlined={false} color={colors.iconColor} />
      )}
      {inverted ? (
        <div className="flex items-center">
          {label && (
            <span className={cn(colors.textDark, 'mr-0.5 text-[10px] font-bold')}>{label}</span>
          )}
          <span className={cn(colors.textDark)}>{amount.toLocaleString()}</span>
          {showText && (
            <span
              className={cn(
                colors.textMedium,
                size === 'xxs' || size === 'xs' ? 'text-[10px]' : 'text-xs',
                'ml-1'
              )}
            >
              RSC
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center">
          {label && (
            <span className={cn(colors.textDark, 'mr-0.5 text-[10px] font-bold')}>{label}</span>
          )}
          <span className={colors.text}>{amount.toLocaleString()}</span>
          {showText && (
            <span
              className={cn(
                colors.textMedium,
                size === 'xxs' || size === 'xs' ? 'text-[10px]' : 'text-xs',
                'ml-1'
              )}
            >
              RSC
            </span>
          )}
        </div>
      )}
    </Badge>
  );
};
