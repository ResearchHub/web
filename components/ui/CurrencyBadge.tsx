'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { Badge } from './Badge';
import { Tooltip } from './Tooltip';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { InfoIcon } from 'lucide-react';
import { formatRSC } from '@/utils/number';

interface CurrencyBadgeProps {
  amount: number;
  className?: string;
  size?: 'xxs' | 'xs' | 'sm' | 'md';
  variant?: 'inline' | 'badge' | 'contribute' | 'text' | 'award' | 'received' | 'disabled';
  /** Whether to show currency text (e.g. "RSC" or "USD") after the amount */
  showText?: boolean;
  /** Whether to show the currency icon (RSC icon or $ sign) */
  showIcon?: boolean;
  /** Whether to invert colors between amount and currency text */
  inverted?: boolean;
  /** Custom label to show after currency text (e.g., "awarded") */
  label?: string;
  /** Whether to show the exchange rate tooltip */
  showExchangeRate?: boolean;
  /** Position of the tooltip relative to the badge */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** Custom text color class (e.g., 'text-blue-500') to override default orange color */
  textColor?: string;
  /** Custom text color for the currency label (if different from amount) */
  currencyLabelColor?: string;
  /** Whether to shorten large numbers (e.g., 17,500 → 17.5K) */
  shorten?: boolean;
  /** Currency to display. Defaults to RSC. */
  currency?: 'RSC' | 'USD';
}

export const CurrencyBadge: FC<CurrencyBadgeProps> = ({
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
  currencyLabelColor,
  shorten,
  currency = 'RSC',
}) => {
  const { exchangeRate, isLoading } = useExchangeRate();
  const isUSD = currency === 'USD';

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
    iconColor: textColor ? undefined : '#F97316', // orange-500 for RSC Icon
    rscLabel: currencyLabelColor || textColor || 'text-amber-600', // Fixed trailing quote here
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
    xxs: isUSD ? 10 : 10, // Adjust if $ size needs to differ
    xs: isUSD ? 12 : 12,
    sm: isUSD ? 14 : 16, // $ might appear smaller, adjust base size if needed
    md: isUSD ? 16 : 18,
  };

  const formatNumber = (num: number, useShorten: boolean | undefined) => {
    if (useShorten) {
      // Assuming formatRSC can handle generic number shortening.
      // If formatRSC specifically adds "RSC" text, this needs adjustment.
      return formatRSC({ amount: num, shorten: true });
    }
    return Math.round(num).toLocaleString();
  };

  const displayAmount = formatNumber(amount, shorten);
  const currencyText = isUSD ? 'USD' : 'RSC';

  // Create tooltip content
  const renderTooltipContent = () => {
    if (isLoading) {
      return <div className="text-gray-500 italic text-xs p-1">Loading exchange rate...</div>;
    }
    if (exchangeRate <= 0 && amount !== 0) {
      return <div className="text-gray-500 italic text-xs p-1">Exchange rate unavailable</div>;
    }

    if (isUSD) {
      // Main display is USD, tooltip shows RSC equivalent
      const rscEquivalent = amount / exchangeRate; // Assumes exchangeRate is USD_PER_RSC
      return (
        <div className="p-1">
          <div className="font-semibold text-orange-700 mb-0.5 flex items-center gap-1">
            <ResearchCoinIcon size={14} color={colors.iconColor} />
            <span>≈ {Math.round(rscEquivalent).toLocaleString()} RSC</span>
          </div>
        </div>
      );
    } else {
      // Main display is RSC, tooltip shows RSC and USD equivalent
      const usdEquivalent = amount * exchangeRate; // Assumes exchangeRate is USD_PER_RSC
      return (
        <div className="p-1">
          <div className="font-semibold text-orange-700 mb-0.5 flex items-center gap-1">
            <ResearchCoinIcon size={14} color={colors.iconColor} />
            <span>{Math.round(amount).toLocaleString()} RSC</span>
          </div>
          <div className="text-gray-700 text-xs">≈ ${usdEquivalent.toFixed(2)} USD</div>
        </div>
      );
    }
  };

  // Wrap content with tooltip if exchange rate should be shown
  const wrapWithTooltip = (content: React.ReactNode) => {
    if (showExchangeRate && (exchangeRate > 0 || isLoading)) {
      return (
        <Tooltip
          content={renderTooltipContent()}
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
          isUSD ? textColor || 'text-black' : '', // Example: Different base color for USD text variant
          className
        )}
      >
        {showIcon &&
          (isUSD ? (
            <span
              className={cn(
                'font-semibold mr-1',
                size === 'xxs'
                  ? 'text-[10px]'
                  : size === 'xs'
                    ? 'text-xs'
                    : size === 'sm'
                      ? 'text-sm'
                      : 'text-base', // md and larger
                textColor || (inverted ? colors.textDark : colors.text)
              )}
              style={{ lineHeight: iconSizes[size] + 'px' }} // Align $ better with text
            >
              $
            </span>
          ) : (
            <ResearchCoinIcon
              size={iconSizes[size]}
              outlined={false}
              color={colors.iconColor}
              className="mr-1"
            />
          ))}
        {inverted ? (
          <div className="flex items-center">
            <span
              className={cn(
                isUSD ? textColor || colors.textDark : colors.textDark,
                'font-semibold'
              )}
            >
              {displayAmount}
            </span>
            {showText && <span className={cn(colors.rscLabel, 'ml-1')}>{currencyText}</span>}
            {label && (
              <span className={cn(isUSD ? textColor || colors.textDark : colors.textDark, 'ml-1')}>
                {label}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center">
            <span className={cn(isUSD ? textColor || colors.text : colors.text, 'font-semibold')}>
              {displayAmount}
            </span>
            {/* {showText && <span className={cn(colors.rscLabel, 'ml-1')}>{currencyText}</span>} */}
            {label && (
              <span className={cn(isUSD ? textColor || colors.textDark : colors.textDark, 'ml-1')}>
                {label}
              </span>
            )}
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
      {showIcon &&
        (isUSD ? (
          <span
            className={cn(
              'font-semibold mr-1', // Ensure spacing consistency
              variant === 'award'
                ? colors.awardText
                : variant === 'received'
                  ? colors.receivedText
                  : variant === 'disabled'
                    ? colors.disabledText
                    : textColor || (inverted ? colors.textDark : colors.text),
              size === 'xxs'
                ? 'text-[10px]'
                : size === 'xs'
                  ? 'text-xs'
                  : size === 'sm'
                    ? 'text-sm'
                    : 'text-base'
            )}
            style={{ lineHeight: iconSizes[size] + 'px' }}
          >
            $
          </span>
        ) : (
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
        ))}
      {variant === 'award' ? (
        <div className="flex items-center">
          <span className={cn(colors.awardText, 'font-semibold')}>+ {displayAmount}</span>
          {showText && (
            <span className={cn(colors.awardText, 'ml-1')}>{isUSD ? currencyText : 'Awarded'}</span>
          )}
        </div>
      ) : variant === 'received' ? (
        <div className="flex items-center">
          <span className={cn(colors.receivedText, 'font-semibold')}>+ {displayAmount}</span>
          {showText && <span className={cn(colors.receivedText, 'ml-1')}>{currencyText}</span>}
        </div>
      ) : variant === 'disabled' ? (
        <div className="flex items-center">
          <span className={cn(colors.disabledText, 'font-semibold')}>{displayAmount}</span>
          {showText && <span className={cn(colors.disabledText, 'ml-1')}>{currencyText}</span>}
        </div>
      ) : inverted ? (
        <div className="flex items-center">
          <span
            className={cn(isUSD ? textColor || colors.textDark : colors.textDark, 'font-semibold')}
          >
            {displayAmount}
          </span>
          {showText && <span className={cn(colors.rscLabel, 'ml-1')}>{currencyText}</span>}
          {label && (
            <span className={cn(isUSD ? textColor || colors.textDark : colors.textDark, 'ml-1')}>
              {label}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center">
          <span className={cn(isUSD ? textColor || colors.text : colors.text, 'font-semibold')}>
            {displayAmount}
          </span>
          {showText && <span className={cn(colors.rscLabel, 'ml-1')}>{currencyText}</span>}
          {label && (
            <span className={cn(isUSD ? textColor || colors.textDark : colors.textDark, 'ml-1')}>
              {label}
            </span>
          )}
        </div>
      )}
    </Badge>
  );
};
