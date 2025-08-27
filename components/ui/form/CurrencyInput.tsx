import React from 'react';
import { Input, InputProps } from './Input';
import { ChevronDown } from 'lucide-react';
import { Currency } from '@/types/root';

interface CurrencyInputProps extends InputProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currency: Currency;
  onCurrencyToggle: () => void;
  convertedAmount?: string;
  suggestedAmount?: string;
  error?: string;
  isExchangeRateLoading?: boolean;
  label?: string;
  className?: string;
  disableCurrencyToggle?: boolean;
  required?: boolean;
}

export const CurrencyInput = ({
  value,
  onChange,
  currency,
  onCurrencyToggle,
  convertedAmount,
  suggestedAmount,
  error,
  isExchangeRateLoading,
  label = 'I am offering',
  className = '',
  disableCurrencyToggle = false,
  required = false,
  ...props
}: CurrencyInputProps) => {
  const currentAmount =
    typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) || 0 : value;
  const suggestedAmountValue = suggestedAmount
    ? parseFloat(suggestedAmount.replace(/[^0-9.]/g, ''))
    : 0;

  const isBelowSuggested = currentAmount < suggestedAmountValue;
  const suggestedTextColor = !currentAmount
    ? 'text-gray-500'
    : isBelowSuggested
      ? 'text-orange-500'
      : 'text-green-500';

  return (
    <div className="relative">
      <Input
        name="amount"
        value={value === 0 ? '' : value.toString()}
        onChange={onChange}
        required={required}
        label={label}
        placeholder="0.00"
        type="text"
        inputMode="numeric"
        className={`w-full text-left h-12 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${error ? 'border-red-500' : ''} ${className}`}
        rightElement={
          disableCurrencyToggle ? (
            <div className="flex items-center gap-1 pr-3 text-gray-900">
              <span className="font-medium">{currency}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onCurrencyToggle}
              className="flex items-center gap-1 pr-3 text-gray-900 hover:text-gray-600"
            >
              <span className="font-medium">{currency}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          )
        }
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      {suggestedAmount && !error && (
        <p className={`mt-1.5 text-xs ${suggestedTextColor}`}>
          Suggested amount for peer review: {suggestedAmount}
          {currency === 'RSC' &&
            !isExchangeRateLoading &&
            !suggestedAmount.includes('Loading') &&
            ' (150 USD)'}
        </p>
      )}
      {isExchangeRateLoading ? (
        <div className="mt-1.5 text-sm text-gray-500">Loading exchange rate...</div>
      ) : (
        convertedAmount && <div className="mt-1.5 text-sm text-gray-500">{convertedAmount}</div>
      )}
    </div>
  );
};
