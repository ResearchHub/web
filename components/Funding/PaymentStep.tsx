'use client';

import { useState, useCallback } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Tooltip } from '@/components/ui/Tooltip';
import { PaymentWidget } from './PaymentWidget';
import { InsufficientBalanceAlert } from './InsufficientBalanceAlert';
import { usePaymentCalculations, type PaymentMethodType } from './lib';
import {
  PLATFORM_FEE_PERCENTAGE,
  PAYMENT_PROCESSING_FEE,
  METHODS_WITH_PROCESSING_FEE,
} from './lib/constants';

interface PaymentStepProps {
  /** Amount in RSC (before fees) */
  amountInRsc: number;
  /** Amount in USD */
  amountInUsd: number;
  /** Amount display string */
  amountDisplay: string;
  /** User's current RSC balance */
  rscBalance: number;
  /** Whether the action is being processed */
  isProcessing?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Called when payment is confirmed */
  onConfirmPayment: (paymentMethod: Exclude<PaymentMethodType, 'endaoment' | 'other'>) => void;
  /** Called when user wants to deposit RSC */
  onDepositRsc?: () => void;
  /** Called when user wants to buy RSC */
  onBuyRsc?: () => void;
}

/**
 * Payment step component combining payment method selection with receipt-style line items.
 * This is the second step in the funding flow.
 */
export function PaymentStep({
  amountInRsc,
  amountInUsd,
  amountDisplay,
  rscBalance,
  isProcessing = false,
  error,
  onConfirmPayment,
  onDepositRsc,
  onBuyRsc,
}: PaymentStepProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>('credit_card');
  const [isCreditCardComplete, setIsCreditCardComplete] = useState(false);

  // Get RSC balance check
  const paymentMethodForCalc =
    (selectedMethod as Exclude<PaymentMethodType, 'endaoment' | 'other'>) || 'rsc';
  const { insufficientBalance } = usePaymentCalculations({
    amountInRsc,
    rscBalance,
    paymentMethod: paymentMethodForCalc,
  });

  // Calculate fees in USD - fees are SUBTRACTED from user's input
  const platformFeeUsd = amountInUsd * (PLATFORM_FEE_PERCENTAGE / 100);

  // Payment processing fee only for non-RSC methods
  const hasProcessingFee = selectedMethod && METHODS_WITH_PROCESSING_FEE.includes(selectedMethod);
  const processingFeeUsd = hasProcessingFee
    ? amountInUsd * (PAYMENT_PROCESSING_FEE.percentage / 100) +
      PAYMENT_PROCESSING_FEE.fixedCents / 100
    : 0;

  // Net amount = user's input minus all fees
  const netAmountUsd = amountInUsd - platformFeeUsd - processingFeeUsd;

  // Format USD
  const formatUsd = (amount: number) =>
    `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Check if selected method has insufficient balance
  const isRscInsufficientBalance = selectedMethod === 'rsc' && insufficientBalance;

  // Check if credit card is selected but not complete
  const isCreditCardIncomplete = selectedMethod === 'credit_card' && !isCreditCardComplete;

  // Determine if button should be disabled
  const isDisabled =
    isProcessing ||
    !selectedMethod ||
    isRscInsufficientBalance ||
    isCreditCardIncomplete ||
    selectedMethod === 'endaoment';

  const handleConfirm = useCallback(() => {
    if (selectedMethod && selectedMethod !== 'endaoment') {
      onConfirmPayment(selectedMethod);
    }
  }, [selectedMethod, onConfirmPayment]);

  // Handle payment method selection from widget
  const handlePaymentMethodChange = useCallback((method: PaymentMethodType | null) => {
    setSelectedMethod(method);
    // Reset credit card completeness when changing methods
    if (method !== 'credit_card') {
      setIsCreditCardComplete(false);
    }
  }, []);

  // Dummy handlers for PaymentWidget (we handle the action in this component)
  const handlePreviewTransaction = useCallback(() => {
    // No-op - we use the confirm button below instead
  }, []);

  return (
    <div className="space-y-6">
      {/* Payment Method Selector */}
      <PaymentWidget
        amountInRsc={amountInRsc}
        amountInUsd={amountInUsd}
        amountDisplay={amountDisplay}
        rscBalance={rscBalance}
        onPreviewTransaction={handlePreviewTransaction}
        onDepositRsc={onDepositRsc}
        onBuyRsc={onBuyRsc}
        selectedPaymentMethod={selectedMethod}
        onPaymentMethodChange={handlePaymentMethodChange}
        onCreditCardCompleteChange={setIsCreditCardComplete}
        hideButton
      />

      {/* Receipt-style line items */}
      {selectedMethod && selectedMethod !== 'endaoment' && (
        <div className="space-y-4">
          {/* Line items */}
          <div className="space-y-1">
            {/* Funding contribution (net amount going to fundraise) */}
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-sm text-gray-600">Funding contribution</span>
              <span className="text-sm text-gray-900">{formatUsd(netAmountUsd)}</span>
            </div>

            {/* Platform fee with tooltip */}
            <div className="py-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-600">
                  Platform fee ({PLATFORM_FEE_PERCENTAGE}%)
                </span>
                <Tooltip
                  content={
                    <div className="text-xs space-y-1">
                      <p>7% to ResearchHub Inc</p>
                      <p>2% to ResearchHub Foundation</p>
                    </div>
                  }
                >
                  <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                </Tooltip>
                {selectedMethod === 'rsc' && (
                  <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    Lowest fee
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-600">{formatUsd(platformFeeUsd)}</span>
            </div>

            {/* Payment processing fee - only for non-RSC methods */}
            {hasProcessingFee && (
              <div className="py-1.5 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Payment processing ({PAYMENT_PROCESSING_FEE.percentage}% + $0.30)
                </span>
                <span className="text-sm text-gray-600">{formatUsd(processingFeeUsd)}</span>
              </div>
            )}

            {/* Total due with divider */}
            <div className="pt-3 mt-2 flex items-center justify-between border-t border-gray-200">
              <span className="text-base font-semibold text-gray-900">Total Due</span>
              <span className="text-lg font-bold text-gray-900">{formatUsd(amountInUsd)}</span>
            </div>
          </div>

          {/* Insufficient balance alert for RSC */}
          {isRscInsufficientBalance && onDepositRsc && onBuyRsc && (
            <InsufficientBalanceAlert onDepositRsc={onDepositRsc} onBuyRsc={onBuyRsc} />
          )}

          {/* Error Alert */}
          {error && <Alert variant="error">{error}</Alert>}

          {/* Confirm Button */}
          <Button
            type="button"
            variant="default"
            disabled={isDisabled}
            className="w-full h-12 text-base"
            onClick={handleConfirm}
          >
            {isProcessing ? 'Processing...' : 'Confirm & Pay'}
          </Button>
        </div>
      )}

      {/* Prompt to select payment method */}
      {!selectedMethod && (
        <p className="text-sm text-gray-500 text-center">
          Select a payment method above to continue
        </p>
      )}
    </div>
  );
}
