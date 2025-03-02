'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { Badge } from './Badge';
import { Tooltip } from './Tooltip';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { InfoIcon } from 'lucide-react';

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
  /** Whether to show the exchange rate tooltip */
  showExchangeRate?: boolean;
  /** Position of the tooltip relative to the badge */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export const RSCBadge: FC<RSCBadgeProps> = ({
  amount,
  className,
  size = 'xs',
  variant = 'badge',
  showText = true,
  showIcon = true,
  inverted = false,
  label,
  showExchangeRate = true,
  tooltipPosition = 'top',
}) => {
  const { exchangeRate, isLoading } = useExchangeRate();

  // Custom size classes that override Badge's default sizes
  const sizeClasses = {
    xxs: 'text-[9px] gap-0.5 py-0 px-1',
    xs: 'text-xs gap-0.5 py-0.5 px-1.5',
    sm: 'text-xs gap-1 py-0.5 px-2',
    md: 'text-sm gap-1 py-1 px-2.5',
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
    xxs: 10,
    xs: 12,
    sm: 14,
    md: 16,
  };

  // Calculate USD value
  const usdValue = !isLoading && exchangeRate > 0 ? (amount * exchangeRate).toFixed(2) : null;

  // Create tooltip content
  const tooltipContent = (
    <div className="p-1">
      <div className="font-semibold text-orange-700 mb-0.5 flex items-center gap-1">
        <ResearchCoinIcon size={14} outlined={false} color={colors.iconColor} />
        <span>{amount.toLocaleString()} RSC</span>
      </div>
      {usdValue ? (
        <div className="text-gray-700 text-xs">≈ ${usdValue} USD</div>
      ) : (
        <div className="text-gray-500 italic text-xs">Loading exchange rate...</div>
      )}
    </div>
  );

  // Wrap content with tooltip if exchange rate should be shown
  const wrapWithTooltip = (content: React.ReactNode) => {
    if (showExchangeRate) {
      return (
        <Tooltip
          content={tooltipContent}
          position={tooltipPosition}
          className="bg-orange-50 border-orange-200 shadow-md"
          delay={50}
        >
          {content}
        </Tooltip>
      );
    }
    return content;
  };

  // Only use Badge for badge and contribute variants
  if (variant === 'inline') {
    return wrapWithTooltip(
      <div className={cn('flex items-center px-2 py-0.5', sizeClasses[size], className)}>
        {showIcon && (
          <ResearchCoinIcon size={iconSizes[size]} outlined={true} color={colors.iconColor} />
        )}
        {inverted ? (
          <div className="flex items-center">
            <span className={cn(colors.textDark)}>{amount.toLocaleString()}</span>
            {label && <span className={cn(colors.textDark, 'ml-1')}>{label}</span>}
          </div>
        ) : (
          <div className="flex items-center">
            <span className={colors.text}>{amount.toLocaleString()}</span>
            {label && <span className={cn(colors.textDark, 'ml-1')}>{label}</span>}
          </div>
        )}
      </div>
    );
  }

  return wrapWithTooltip(
    <Badge
      variant="orange"
      size={badgeSize}
      className={cn(
        'flex items-center',
        sizeClasses[size],
        variantClasses[variant],
        variant === 'badge' || variant === 'contribute' ? 'py-0.5 px-2' : '',
        size === 'xxs' && 'py-0 px-1',
        className
      )}
    >
      {showIcon && (
        <ResearchCoinIcon size={iconSizes[size]} outlined={false} color={colors.iconColor} />
      )}
      {inverted ? (
        <div className="flex items-center">
          <span className={cn(colors.textDark)}>{amount.toLocaleString()}</span>
          {label && <span className={cn(colors.textDark, 'ml-1')}>{label}</span>}
        </div>
      ) : (
        <div className="flex items-center">
          <span className={colors.text}>{amount.toLocaleString()}</span>
          {label && <span className={cn(colors.textDark, 'ml-1')}>{label}</span>}
        </div>
      )}
    </Badge>
  );
};
