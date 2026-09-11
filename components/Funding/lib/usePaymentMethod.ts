'use client';

import { useState, useCallback } from 'react';
import { type PaymentMethodType } from './constants';

interface UsePaymentMethodOptions {
  /** Initial selected method (for controlled mode) */
  initialMethod?: PaymentMethodType | null;
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
}

/**
 * Hook for managing payment method selection state.
 * Auto-collapses after selection to show the selected method in collapsed state.
 */
export function usePaymentMethod(options: UsePaymentMethodOptions = {}): UsePaymentMethodReturn {
  const { initialMethod = null, onMethodChange } = options;

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(initialMethod);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const selectMethod = useCallback(
    (method: PaymentMethodType) => {
      setSelectedMethod(method);
      onMethodChange?.(method);
      // Auto-collapse after selection
      setIsExpanded(false);
    },
    [onMethodChange]
  );

  return { isExpanded, selectedMethod, toggleExpanded, selectMethod };
}
