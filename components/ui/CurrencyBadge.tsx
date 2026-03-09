'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';
import { ResearchCoinIcon } from './icons/ResearchCoinIcon';
import { Badge } from './Badge';
import { Tooltip } from './Tooltip';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatRSC } from '@/utils/number';
import Icon from './icons/Icon';
import { DollarSign } from 'lucide-react';

interface CurrencyBadgeProps {
  amount: number;
  className?: string;
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
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
  /** Custom font weight class (e.g., 'font-bold', 'font-semibold', 'font-normal') */
  fontWeight?: string;
  /** Whether to shorten large numbers (e.g., 17,500 → 17.5K) */
  shorten?: boolean;
  /** Currency to display. Defaults to RSC. */
  currency?: 'RSC' | 'USD';
  /** Whether to hide currency text for USD (show only $ symbol). Defaults to true. */
  hideUSDText?: boolean;
  /** Custom icon size in pixels. Overrides the default size calculation. */
  iconSize?: number;
  /** Custom icon color (hex string) for RSC icon. Overrides default orange color. */
  iconColor?: string;
  /**
   * If true, the amount is already in the target currency and should not be converted.
   * Useful when the caller has pre-calculated the amount (e.g., Foundation bounty flat fee).
   */
  skipConversion?: boolean;
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
  fontWeight,
  shorten,
  currency = 'RSC',
  hideUSDText = true,
  iconSize,
  iconColor,
  skipConversion = false,
}) => {
  const { exchangeRate, isLoading } = useExchangeRate();
  const isUSD = currency === 'USD';

  // Custom size classes that override Badge's default sizes
  const sizeClasses = {
    xxs: 'text-[9px] gap-0.5 py-0 px-1',
    xs: 'text-xs gap-0.5 py-0.5 px-1.5',
    sm: 'text-xs gap-1 py-0.5 px-2',
    md: 'text-sm gap-1 py-1 px-2.5',
    lg: 'text-base gap-1 py-1.5 px-3',
    xl: 'text-lg gap-1 py-2 px-4',
  };

  // Show skeleton when loading USD conversion
  if (isUSD && isLoading && !skipConversion) {
    return (
      <div className={cn('flex items-center animate-pulse', sizeClasses[size], className)}>
        {showIcon && <div className="w-4 h-4 bg-gray-200 rounded-full mr-1" />}
        <div className="w-12 h-4 bg-gray-200 rounded" />
      </div>
    );
  }

  // Convert amount based on desired currency display
  // If currency is USD but amount is in RSC, convert it (unless skipConversion is true)
  const rawUsdValue = isUSD && exchangeRate > 0 && !skipConversion ? amount * exchangeRate : amount;
  const displayValue =
    isUSD && exchangeRate > 0 && !skipConversion ? Math.round(rawUsdValue) : amount;

  const colors = {
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    hoverBorder: 'hover:border-primary-300',
    hoverBg: 'hover:bg-primary-50',
    text: textColor || 'text-primary-600',
    textDark: textColor || 'text-primary-700',
    textMedium: 'text-gray-600',
    iconColor: undefined,
    rscLabel: currencyLabelColor || textColor || 'text-primary-600',
    awardBg: 'bg-amber-100',
    awardBorder: 'border-amber-300',
    awardText: 'text-amber-700',
    awardIconColor: '#F59E0B',
    receivedBg: 'bg-green-50',
    receivedBorder: 'border-green-200',
    receivedText: 'text-green-700',
    disabledBg: 'bg-gray-100',
    disabledBorder: 'border-gray-300',
    disabledText: 'text-gray-500',
    disabledIconColor: '#6B7280',
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
    xs: isUSD ? 12 : 14,
    sm: isUSD ? 14 : 16, // $ might appear smaller, adjust base size if needed
    md: isUSD ? 16 : 18,
    lg: isUSD ? 18 : 20,
    xl: isUSD ? 20 : 22,
  };

  // Use custom iconSize if provided, otherwise use the calculated size
  const effectiveIconSize = iconSize ?? iconSizes[size];

  const formatNumber = (num: number, useShorten: boolean | undefined) => {
    if (useShorten) {
      return formatRSC({ amount: num, shorten: true, round: true });
    }
    return Math.round(num).toLocaleString();
  };

  const displayAmount =
    isUSD && rawUsdValue > 0 && rawUsdValue < 1
      ? rawUsdValue.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : formatNumber(displayValue, shorten);
  const currencyText = isUSD ? 'USD' : 'RSC';

  // Determine whether to show currency text based on currency and hideUSDText setting
  const shouldShowCurrencyText = showText && (!isUSD || !hideUSDText);

  // Create tooltip content
  const renderTooltipContent = () => {
    if (isLoading) {
      return <div className="text-gray-500 italic text-xs p-1">Loading exchange rate...</div>;
    }
    if (exchangeRate <= 0 && amount !== 0) {
      return <div className="text-gray-500 italic text-xs p-1">Exchange rate unavailable</div>;
    }

    const formatTooltipAmount = (value: number) =>
      value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (isUSD) {
      const rscAmount = skipConversion && exchangeRate > 0 ? amount / exchangeRate : amount;

      return (
        <div className="p-1">
          <div className="font-semibold text-primary-700 mb-0.5 flex items-center gap-1">
            <ResearchCoinIcon size={14} outlined />
            <span>{Math.round(rscAmount).toLocaleString()} RSC</span>
          </div>
          <div className="text-gray-700 text-xs">≈ ${displayAmount} USD</div>
        </div>
      );
    } else {
      const usdEquivalent = amount * exchangeRate;
      return (
        <div className="p-1">
          <div className="font-semibold text-primary-700 mb-0.5 flex items-center gap-1">
            <ResearchCoinIcon size={14} outlined />
            <span>{Math.round(amount).toLocaleString()} RSC</span>
          </div>
          <div className="text-gray-700 text-xs">≈ ${formatTooltipAmount(usdEquivalent)} USD</div>
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
          className="bg-primary-50 border-primary-200 shadow-md pointer-events-none"
          delay={50}
        >
          {content}
        </Tooltip>
      );
    }
    return content;
  };

  // Determine if we should inherit colors from parent (for hover effects)
  const shouldInheritColor = textColor === 'inherit' || iconColor === 'inherit';
  const effectiveTextColor = textColor === 'inherit' ? undefined : textColor;
  const effectiveIconColor = iconColor === 'inherit' ? 'currentColor' : iconColor;

  // Use simple div for text and inline variants
  if (variant === 'inline' || variant === 'text') {
    return wrapWithTooltip(
      <div
        className={cn(
          'flex items-center',
          variant === 'inline' ? 'px-2 py-1' : '',
          sizeClasses[size],
          isUSD && !shouldInheritColor ? effectiveTextColor || 'text-black' : ''
        )}
      >
        {showIcon &&
          (isUSD ? (
            <DollarSign
              size={effectiveIconSize}
              className={cn('-mr-1', className)}
              strokeWidth={2}
            />
          ) : (
            <ResearchCoinIcon
              size={effectiveIconSize}
              className="mr-1"
              outlined
              color={effectiveIconColor || undefined}
            />
          ))}
        {inverted ? (
          <div className="flex items-center">
            <span
              className={cn(
                !shouldInheritColor &&
                  (isUSD ? effectiveTextColor || colors.textDark : colors.textDark),
                fontWeight || 'font-medium',
                className
              )}
            >
              {displayAmount}
            </span>
            {shouldShowCurrencyText && (
              <span
                className={cn(
                  !shouldInheritColor && colors.rscLabel,
                  fontWeight,
                  className,
                  'ml-1'
                )}
              >
                {currencyText}
              </span>
            )}
            {label && (
              <span
                className={cn(
                  !shouldInheritColor &&
                    (isUSD ? effectiveTextColor || colors.textDark : colors.textDark),
                  'ml-1'
                )}
              >
                {label}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center">
            <span
              className={cn(
                !shouldInheritColor && (isUSD ? effectiveTextColor || colors.text : colors.text),
                fontWeight || 'font-medium',
                className
              )}
            >
              {displayAmount}
            </span>
            {shouldShowCurrencyText && (
              <span
                className={cn(
                  !shouldInheritColor && colors.rscLabel,
                  fontWeight,
                  className,
                  'ml-1'
                )}
              >
                {currencyText}
              </span>
            )}
            {label && (
              <span
                className={cn(
                  !shouldInheritColor &&
                    (isUSD ? effectiveTextColor || colors.textDark : colors.textDark),
                  'ml-1'
                )}
              >
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
              fontWeight || 'font-semibold',
              '-mr-0.5', // Tighter spacing for USD
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
            style={{ lineHeight: effectiveIconSize + 'px' }}
          >
            $
          </span>
        ) : (
          <ResearchCoinIcon
            size={effectiveIconSize}
            variant={variant === 'received' ? 'green' : variant === 'disabled' ? 'solid' : 'orange'}
            color={iconColor || (variant === 'disabled' ? colors.disabledIconColor : undefined)}
            outlined
          />
        ))}
      {variant === 'award' ? (
        <div className="flex items-center">
          <span className={cn(colors.awardText, fontWeight || 'font-semibold')}>
            + {displayAmount}
          </span>
          {shouldShowCurrencyText && (
            <span className={cn(colors.awardText, 'ml-1')}>{isUSD ? currencyText : 'Awarded'}</span>
          )}
        </div>
      ) : variant === 'received' ? (
        <div className="flex items-center">
          <span className={cn(colors.receivedText, fontWeight || 'font-semibold')}>
            + {displayAmount}
          </span>
          {shouldShowCurrencyText && (
            <span className={cn(colors.receivedText, 'ml-1')}>{currencyText}</span>
          )}
        </div>
      ) : variant === 'disabled' ? (
        <div className="flex items-center">
          <span className={cn(colors.disabledText, fontWeight || 'font-semibold')}>
            {displayAmount}
          </span>
          {shouldShowCurrencyText && (
            <span className={cn(colors.disabledText, 'ml-1')}>{currencyText}</span>
          )}
        </div>
      ) : inverted ? (
        <div className="flex items-center">
          <span
            className={cn(
              isUSD ? textColor || colors.textDark : colors.textDark,
              fontWeight || 'font-semibold'
            )}
          >
            {displayAmount}
          </span>
          {shouldShowCurrencyText && (
            <span className={cn(colors.rscLabel, 'ml-1')}>{currencyText}</span>
          )}
          {label && (
            <span className={cn(isUSD ? textColor || colors.textDark : colors.textDark, 'ml-1')}>
              {label}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center">
          <span
            className={cn(
              isUSD ? textColor || colors.text : colors.text,
              fontWeight || 'font-semibold'
            )}
          >
            {displayAmount}
          </span>
          {shouldShowCurrencyText && (
            <span className={cn(colors.rscLabel, 'ml-1')}>{currencyText}</span>
          )}
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
