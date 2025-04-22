'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { Badge } from './Badge';
import { Tooltip } from './Tooltip';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { InfoIcon } from 'lucide-react';
import { formatRSC } from '@/utils/number';

interface RSCBadgeProps {
  amount: number;
  className?: string;
  size?: 'xxs' | 'xs' | 'sm' | 'md';
  variant?: 'inline' | 'badge' | 'contribute' | 'text' | 'award' | 'received' | 'disabled';
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
  /** Whether to shorten large numbers (e.g., 17,500 → 17.5K) */
  shorten?: boolean;
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
  shorten,
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
    rscLabel: rscLabelColor || textColor || 'text-amber-600"',
    // Add gold colors for award variant
    awardBg: 'bg-amber-100',
    awardBorder: 'border-amber-300',
    awardText: 'text-amber-700',
    awardIconColor: '#F59E0B', // amber-500
    // Add green colors for received variant
    receivedBg: 'bg-green-50',
    receivedBorder: 'border-green-200',
    receivedText: 'text-green-700',
    // Add gray colors for disabled variant
    disabledBg: 'bg-gray-100',
    disabledBorder: 'border-gray-300',
    disabledText: 'text-gray-500',
    disabledIconColor: '#6B7280', // gray-500
  };

  // Map our custom variants to classes
  const variantClasses = {
    badge: `${colors.bg}`,
    inline: '',
    contribute: `${colors.hoverBorder} ${colors.hoverBg}`,
    text: '',
    award: `${colors.awardBg} ${colors.awardBorder}`,
    received: `${colors.receivedBg} ${colors.receivedBorder}`,
    disabled: `${colors.disabledBg} ${colors.disabledBorder}`,
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
        <ResearchCoinIcon size={14} color={colors.iconColor} />
        <span>{Math.round(amount).toLocaleString()} RSC</span>
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
            outlined={false}
            color={colors.iconColor}
            className="mr-1"
          />
        )}
        {inverted ? (
          <div className="flex items-center">
            <span className={cn(colors.textDark, 'font-semibold')}>
              {shorten ? formatRSC({ amount, shorten: true }) : Math.round(amount).toLocaleString()}
            </span>
            {showText && <span className={cn(colors.rscLabel, 'ml-1')}>RSC</span>}
            {label && <span className={cn(colors.textDark, 'ml-1')}>{label}</span>}
          </div>
        ) : (
          <div className="flex items-center">
            <span className={cn(colors.text, 'font-semibold')}>
              {shorten ? formatRSC({ amount, shorten: true }) : Math.round(amount).toLocaleString()}
            </span>
            {showText && <span className={cn(colors.rscLabel, 'ml-1')}>RSC</span>}
            {label && <span className={cn(colors.textDark, 'ml-1')}>{label}</span>}
          </div>
        )}
      </div>
    );
  }

  return wrapWithTooltip(
    <Badge
      variant={
        variant === 'award' || variant === 'received' || variant === 'disabled'
          ? 'default'
          : 'orange'
      }
      size={badgeSize}
      className={cn(
        'flex items-center',
        sizeClasses[size],
        variantClasses[variant],
        variant === 'badge' ||
          variant === 'contribute' ||
          variant === 'award' ||
          variant === 'received' ||
          variant === 'disabled'
          ? 'py-1 px-2'
          : '',
        size === 'xxs' && 'py-0 px-1',
        className
      )}
    >
      {showIcon && (
        <ResearchCoinIcon
          size={iconSizes[size]}
          color={
            variant === 'award'
              ? colors.awardIconColor
              : variant === 'received'
                ? '#16A34A'
                : variant === 'disabled'
                  ? colors.disabledIconColor
                  : colors.iconColor
          }
          outlined={false}
          variant={variant === 'received' ? 'green' : variant === 'disabled' ? 'solid' : 'orange'}
        />
      )}
      {variant === 'award' ? (
        <div className="flex items-center">
          <span className={cn(colors.awardText, 'font-semibold')}>
            + {shorten ? formatRSC({ amount, shorten: true }) : Math.round(amount).toLocaleString()}
          </span>
          {showText && <span className={cn(colors.awardText, 'ml-1')}>Awarded</span>}
        </div>
      ) : variant === 'received' ? (
        <div className="flex items-center">
          <span className={cn(colors.receivedText, 'font-semibold')}>
            + {shorten ? formatRSC({ amount, shorten: true }) : Math.round(amount).toLocaleString()}
          </span>
          {showText && <span className={cn(colors.receivedText, 'ml-1')}>RSC</span>}
        </div>
      ) : variant === 'disabled' ? (
        <div className="flex items-center">
          <span className={cn(colors.disabledText, 'font-semibold')}>
            {shorten ? formatRSC({ amount, shorten: true }) : Math.round(amount).toLocaleString()}
          </span>
          {showText && <span className={cn(colors.disabledText, 'ml-1')}>RSC</span>}
        </div>
      ) : inverted ? (
        <div className="flex items-center">
          <span className={cn(colors.textDark)}>
            {shorten ? formatRSC({ amount, shorten: true }) : Math.round(amount).toLocaleString()}
          </span>
          {showText && <span className={cn(colors.rscLabel, 'ml-1')}>RSC</span>}
          {label && <span className={cn(colors.textDark, 'ml-1')}>{label}</span>}
        </div>
      ) : (
        <div className="flex items-center">
          <span className={cn(colors.text)}>
            {shorten ? formatRSC({ amount, shorten: true }) : Math.round(amount).toLocaleString()}
          </span>
          {showText && <span className={cn(colors.rscLabel, 'ml-1')}>RSC</span>}
          {label && <span className={cn(colors.textDark, 'ml-1')}>{label}</span>}
        </div>
      )}
    </Badge>
  );
};
