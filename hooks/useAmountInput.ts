import { useState, useCallback } from 'react';

interface UseAmountInputOptions {
  initialAmount?: number;
  minAmount?: number;
  validate?: (amount: number) => string | undefined;
}

export function useAmountInput({
  initialAmount = 0,
  minAmount = 0,
  validate,
}: UseAmountInputOptions = {}) {
  const [amount, setAmount] = useState<number>(initialAmount);
  const [error, setError] = useState<string | undefined>();
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    const numValue = parseFloat(rawValue);

    if (!hasInteracted) {
      setHasInteracted(true);
    }

    if (rawValue === '') {
      setAmount(0);
      setError(undefined);
      return;
    }

    if (!isNaN(numValue)) {
      setAmount(numValue);
      
      if (validate) {
        setError(validate(numValue));
      } else if (numValue < minAmount) {
        setError(`Minimum amount is ${minAmount}`);
      } else {
        setError(undefined);
      }
    } else {
      setAmount(0);
      setError('Please enter a valid amount');
    }
  }, [hasInteracted, minAmount, validate]);

  const getFormattedValue = useCallback(() => {
    if (amount === 0) return '';
    return amount.toLocaleString();
  }, [amount]);

  return {
    amount,
    setAmount,
    error,
    setError,
    handleAmountChange,
    getFormattedValue,
    hasInteracted,
  };
}
