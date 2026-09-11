'use client';

import { useCallback, useMemo, useState, type ChangeEvent } from 'react';

interface UseUsdAmountOptions {
  /** Starting amount, also restored by `reset`. */
  initialAmount?: number;
  minAmount?: number;
  /** Unset leaves the amount unbounded. */
  maxAmount?: number;
  /** Word used in validation messages, e.g. "contribution". */
  noun?: string;
}

const formatWholeUsd = (amount: number) =>
  `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

/**
 * USD amount entry shared by checkout flows: a free-text input plus quick
 * amount presets, with min/max validation.
 */
export function useUsdAmount({
  initialAmount = 100,
  minAmount = 1,
  maxAmount,
  noun = 'amount',
}: UseUsdAmountOptions = {}) {
  const [amountUsd, setAmountUsd] = useState(initialAmount);
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(initialAmount);
  const [amountError, setAmountError] = useState<string | undefined>(undefined);

  const validate = useCallback(
    (value: number): string | undefined => {
      if (value < minAmount) return `Minimum ${noun} is ${formatWholeUsd(minAmount)}`;
      if (maxAmount != null && value > maxAmount) {
        return `Maximum ${noun} is ${formatWholeUsd(maxAmount)}`;
      }
      return undefined;
    },
    [minAmount, maxAmount, noun]
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const numValue = parseFloat(e.target.value.replace(/[^0-9.]/g, ''));
      if (isNaN(numValue)) {
        setAmountUsd(0);
        setAmountError('Please enter a valid amount');
        return;
      }
      setAmountUsd(numValue);
      setSelectedQuickAmount(null);
      setAmountError(validate(numValue));
    },
    [validate]
  );

  const selectQuickAmount = useCallback((amount: number) => {
    setSelectedQuickAmount(amount);
    setAmountUsd(amount);
    setAmountError(undefined);
  }, []);

  /** Programmatic set (e.g. a slider); `quickAmount` marks a preset as selected. */
  const setAmount = useCallback((amount: number, quickAmount: number | null = null) => {
    setAmountUsd(amount);
    setSelectedQuickAmount(quickAmount);
    setAmountError(undefined);
  }, []);

  const reset = useCallback(() => {
    setAmountUsd(initialAmount);
    setSelectedQuickAmount(initialAmount);
    setAmountError(undefined);
  }, [initialAmount]);

  const inputValue = useMemo(
    () =>
      amountUsd === 0
        ? ''
        : amountUsd.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }),
    [amountUsd]
  );

  return {
    amountUsd,
    inputValue,
    amountError,
    selectedQuickAmount,
    isValid: amountUsd >= minAmount && !amountError,
    validate,
    handleInputChange,
    selectQuickAmount,
    setAmount,
    reset,
  };
}
