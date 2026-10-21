'use client';

import { useState, useCallback } from 'react';
import { type PaymentMethodType } from './constants';

interface UsePaymentMethodOptions {
  /** Callback when RSC is selected */
  onRSCSelect?: () => void;
  /** Callback when Credit Card is selected */
  onCreditCardSelect?: () => void;
  /** Callback when Endaoment is selected */
  onEndaomentSelect?: () => void;
  /** Called with each method picked, or null once cleared; the caller keeps the selection. */
  onMethodChange?: (method: PaymentMethodType | null) => void;
}

interface UsePaymentMethodReturn {
  /** Whether the payment options are expanded/visible */
  isExpanded: boolean;
  /** Toggle the expansion state */
  toggleExpanded: () => void;
  /** Select a payment method (auto-collapses after selection) */
  selectMethod: (method: PaymentMethodType) => void;
  /** Reset the selection and collapse */
  resetSelection: () => void;
  /** Expand the payment options */
  expand: () => void;
  /** Collapse the payment options */
  collapse: () => void;
}

/**
 * Hook for the payment method list: whether it is open, and what picking a
 * method does. Auto-collapses after selection to show the selected method.
 */
export function usePaymentMethod(options: UsePaymentMethodOptions = {}): UsePaymentMethodReturn {
  const { onRSCSelect, onCreditCardSelect, onEndaomentSelect, onMethodChange } = options;

  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const expand = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const collapse = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const selectMethod = useCallback(
    (method: PaymentMethodType) => {
      onMethodChange?.(method);
      // Auto-collapse after selection
      setIsExpanded(false);

      // Fire callbacks
      switch (method) {
        case 'rsc':
          onRSCSelect?.();
          break;
        case 'credit_card':
          onCreditCardSelect?.();
          break;
        case 'endaoment':
          onEndaomentSelect?.();
          break;
      }
    },
    [onRSCSelect, onCreditCardSelect, onEndaomentSelect, onMethodChange]
  );

  const resetSelection = useCallback(() => {
    onMethodChange?.(null);
    setIsExpanded(false);
  }, [onMethodChange]);

  return {
    isExpanded,
    toggleExpanded,
    selectMethod,
    resetSelection,
    expand,
    collapse,
  };
}
