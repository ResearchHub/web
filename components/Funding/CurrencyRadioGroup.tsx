'use client';

import { DollarSign } from 'lucide-react';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { ResearchCoinTooltip } from '@/components/ui/ResearchCoinTooltip';
import { cn } from '@/utils/styles';

export type ContributionCurrency = 'RSC' | 'USD';

interface CurrencyOption {
  id: ContributionCurrency;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: 'success' | 'info';
  showTooltip?: boolean;
}

interface CurrencyRadioGroupProps {
  selectedCurrency: ContributionCurrency;
  onCurrencyChange: (currency: ContributionCurrency) => void;
  /** When true, shows "Lowest Fees" badge on RSC option */
  showLowestFeesBadge?: boolean;
  className?: string;
}

/**
 * Radio group for selecting between RSC and USD currencies.
 * Used in contribution modal and other funding-related contexts.
 */
export function CurrencyRadioGroup({
  selectedCurrency,
  onCurrencyChange,
  showLowestFeesBadge = true,
  className,
}: CurrencyRadioGroupProps) {
  const currencyOptions: CurrencyOption[] = [
    {
      id: 'RSC',
      label: 'RSC',
      sublabel: 'ResearchCoin',
      icon: <ResearchCoinIcon size={24} />,
      badge: showLowestFeesBadge ? 'Lowest Fees' : undefined,
      badgeVariant: 'success',
      showTooltip: true,
    },
    {
      id: 'USD',
      label: 'USD',
      sublabel: 'US Dollar',
      icon: (
        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
          <DollarSign className="h-4 w-4 text-green-600" />
        </div>
      ),
    },
  ];

  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
      {currencyOptions.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onCurrencyChange(option.id)}
          className={cn(
            'relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200',
            selectedCurrency === option.id
              ? 'border-primary-500 bg-primary-50/50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          )}
        >
          <div className="flex-shrink-0">{option.icon}</div>
          <div className="text-left flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-900">{option.label}</span>
              {option.showTooltip && <ResearchCoinTooltip iconSize={14} />}
            </div>
            <span className="text-xs text-gray-500">{option.sublabel}</span>
          </div>
          {option.badge && (
            <span
              className={cn(
                'absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-semibold rounded-full',
                option.badgeVariant === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
              )}
            >
              {option.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
