'use client';

import { useState, useCallback } from 'react';
import { type PaymentMethodType } from './constants';

interface UsePaymentMethodOptions {
  /** Initial selected method (for controlled mode) */
  initialMethod?: PaymentMethodType | null;
  /** Callback when RSC is selected */
  onRSCSelect?: () => void;
  /** Callback when Credit Card is selected */
  onCreditCardSelect?: () => void;
  /** Callback when Endaoment is selected */
  onEndaomentSelect?: () => void;
  /** Callback when any method is selected (for lifting state) */
  onMethodChange?: (method: PaymentMethodType | null) => void;
}

interface UsePaymentMethodReturn {
  /** Whether the payment options are expanded/visible */
  isExpanded: boolean;
  /** Currently selected payment method */
  selectedMethod: PaymentMethodType | null;
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
 * Hook for managing payment method selection state.
 * Auto-collapses after selection to show the selected method in collapsed state.
 */
export function usePaymentMethod(options: UsePaymentMethodOptions = {}): UsePaymentMethodReturn {
  const {
    initialMethod = null,
    onRSCSelect,
    onCreditCardSelect,
    onEndaomentSelect,
    onMethodChange,
  } = options;

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(initialMethod);

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
      setSelectedMethod(method);
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
    setSelectedMethod(null);
    onMethodChange?.(null);
    setIsExpanded(false);
  }, [onMethodChange]);

  return {
    isExpanded,
    selectedMethod,
    toggleExpanded,
    selectMethod,
    resetSelection,
    expand,
    collapse,
  };
}
