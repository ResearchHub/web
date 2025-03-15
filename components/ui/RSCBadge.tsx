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
  variant?: 'inline' | 'badge' | 'contribute' | 'text';
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
  /** Custom text color class (e.g., 'text-blue-500') to override default orange color */
  textColor?: string;
  /** Custom text color for the RSC label (if different from amount) */
  rscLabelColor?: string;
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
  textColor,
  rscLabelColor,
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
    text: textColor || 'text-orange-500',
    textDark: textColor || 'text-orange-600',
    textMedium: 'text-gray-600',
    iconColor: textColor ? undefined : '#F97316', // orange-500
    rscLabel: rscLabelColor || textColor || 'text-orange-500',
  };

  // Map our custom variants to classes
  const variantClasses = {
    badge: `${colors.bg}`,
    inline: '',
    contribute: `${colors.hoverBorder} ${colors.hoverBg}`,
    text: '',
  };

  // Map our size to Badge size
  const badgeSize = size === 'xxs' || size === 'xs' ? 'sm' : size === 'sm' ? 'default' : 'lg';

  const iconSizes = {
    xxs: 10,
    xs: 12,
    sm: 16,
    md: 18,
  };

  // Calculate USD value
  const usdValue = !isLoading && exchangeRate > 0 ? (amount * exchangeRate).toFixed(2) : null;

  // Create tooltip content
  const tooltipContent = (
    <div className="p-1">
      <div className="font-semibold text-orange-700 mb-0.5 flex items-center gap-1 [u">
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

  // Use simple div for text and inline variants
  if (variant === 'inline' || variant === 'text') {
    return wrapWithTooltip(
      <div
        className={cn(
          'flex items-center',
          variant === 'inline' ? 'px-2 py-1' : '',
          sizeClasses[size],
          className
        )}
      >
        {showIcon && (
          <ResearchCoinIcon
            size={iconSizes[size]}
            outlined={variant === 'text' ? false : true}
            color={colors.iconColor}
            className="mr-1"
          />
        )}
        {inverted ? (
          <div className="flex items-center">
            <span className={cn(colors.textDark, 'font-medium')}>{amount.toLocaleString()}</span>
            {showText && <span className={cn(colors.rscLabel, 'ml-1')}>RSC</span>}
            {/* {label && <span className={cn(colors.textDark, 'ml-1')}>{label}</span>} */}
          </div>
        ) : (
          <div className="flex items-center">
            <span className={cn(colors.text, 'font-medium')}>{amount.toLocaleString()}</span>
            {showText && <span className={cn(colors.rscLabel, 'ml-1')}>RSC</span>}
            {/* {label && <span className={cn(colors.textDark, 'ml-1')}>{label}</span>} */}
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
        variant === 'badge' || variant === 'contribute' ? 'py-1 px-2' : '',
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
          {showText && <span className={cn(colors.rscLabel, 'ml-1')}>RSC</span>}
          {/* {label && <span className={cn(colors.textDark, 'ml-1')}>{label}</span>} */}
        </div>
      ) : (
        <div className="flex items-center">
          <span className={cn(colors.text)}>{amount.toLocaleString()}</span>
          {showText && <span className={cn(colors.rscLabel, 'ml-1')}>RSC</span>}
          {/* {label && <span className={cn(colors.textDark, 'ml-1')}>{label}</span>} */}
        </div>
      )}
    </Badge>
  );
};
