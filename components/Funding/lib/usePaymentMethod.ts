'use client';

import { useState, useCallback } from 'react';
import { type PaymentMethodType } from './constants';

interface UsePaymentMethodOptions {
  /** Called with each method picked; the caller keeps the selection. */
  onMethodChange?: (method: PaymentMethodType) => void;
}

interface UsePaymentMethodReturn {
  /** Whether the payment options are expanded/visible */
  isExpanded: boolean;
  /** Toggle the expansion state */
  toggleExpanded: () => void;
  /** Select a payment method (auto-collapses after selection) */
  selectMethod: (method: PaymentMethodType) => void;
}

/**
 * Hook for the payment method list: whether it is open, and what picking a
 * method does. Auto-collapses after selection to show the selected method.
 */
export function usePaymentMethod({
  onMethodChange,
}: UsePaymentMethodOptions = {}): UsePaymentMethodReturn {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const selectMethod = useCallback(
    (method: PaymentMethodType) => {
      onMethodChange?.(method);
      setIsExpanded(false);
    },
    [onMethodChange]
  );

  return { isExpanded, toggleExpanded, selectMethod };
}
