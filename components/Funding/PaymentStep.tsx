'use client';

import { useState, useCallback, useMemo } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Tooltip } from '@/components/ui/Tooltip';
import { PaymentWidget } from './PaymentWidget';
import { InsufficientBalanceAlert } from './InsufficientBalanceAlert';
import { usePaymentCalculations, getDefaultPaymentMethod, type PaymentMethodType } from './lib';
import type { StripePaymentContext } from './CreditCardForm';
import { useIsSafari } from '@/hooks/useIsSafari';
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
  /** Called when payment is confirmed (excludes endaoment which has separate flow) */
  onConfirmPayment: (
    paymentMethod: Exclude<PaymentMethodType, 'endaoment'>
  ) => void | Promise<void>;
  /** Called when user wants to deposit RSC */
  onDepositRsc?: () => void;
  /** Called when user wants to buy RSC */
  onBuyRsc?: () => void;
  /** Called when Stripe context is ready for payment confirmation */
  onStripeReady?: (context: StripePaymentContext | null) => void;
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
  onStripeReady,
}: PaymentStepProps) {
  const isSafari = useIsSafari();

  // Compute the default payment method based on balance and browser
  const defaultPaymentMethod = useMemo(
    () => getDefaultPaymentMethod(rscBalance, amountInRsc, PLATFORM_FEE_PERCENTAGE, isSafari),
    [rscBalance, amountInRsc, isSafari]
  );

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(
    defaultPaymentMethod
  );
  const [isCreditCardComplete, setIsCreditCardComplete] = useState(false);

  // Get RSC balance check (only relevant for RSC payment method)
  const { insufficientBalance } = usePaymentCalculations({
    amountInRsc,
    rscBalance,
    paymentMethod: 'rsc',
  });

  // Calculate fees in USD - fees are ADDED on top of user's input
  const platformFeeUsd = amountInUsd * (PLATFORM_FEE_PERCENTAGE / 100);

  // Payment processing fee only for non-RSC methods
  const hasProcessingFee = selectedMethod && METHODS_WITH_PROCESSING_FEE.includes(selectedMethod);
  const processingFeeUsd = hasProcessingFee
    ? amountInUsd * (PAYMENT_PROCESSING_FEE.percentage / 100) +
      PAYMENT_PROCESSING_FEE.fixedCents / 100
    : 0;

  // Total due = user's input plus all fees
  const totalDueUsd = amountInUsd + platformFeeUsd + processingFeeUsd;

  // Format USD
  const formatUsd = (amount: number) =>
    `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Check if selected method has insufficient balance
  const isRscInsufficientBalance = selectedMethod === 'rsc' && insufficientBalance;

  // Check if credit card is selected but not complete
  const isCreditCardIncomplete = selectedMethod === 'credit_card' && !isCreditCardComplete;

  // Determine if button should be disabled
  const isDisabled =
    isProcessing || !selectedMethod || isRscInsufficientBalance || isCreditCardIncomplete;

  const handleConfirm = useCallback(() => {
    // Endaoment has a separate flow, so we only handle other payment methods here
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
    <div className="flex flex-col h-full">
      {/* Content area */}
      <div className="space-y-6 flex-1">
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
          onStripeReady={onStripeReady}
          hideButton
        />

        {/* Receipt-style line items */}
        {selectedMethod && (
          <div className="space-y-4">
            {/* Line items */}
            <div className="space-y-1">
              {/* Funding contribution (amount going to fundraise) */}
              <div className="py-1.5 flex items-center justify-between">
                <span className="text-sm text-gray-600">Funding contribution</span>
                <span className="text-sm text-gray-900">{formatUsd(amountInUsd)}</span>
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
                <span className="text-lg font-bold text-gray-900">{formatUsd(totalDueUsd)}</span>
              </div>
            </div>

            {/* Insufficient balance alert for RSC */}
            {isRscInsufficientBalance && <InsufficientBalanceAlert />}

            {/* Error Alert */}
            {error && <Alert variant="error">{error}</Alert>}
          </div>
        )}

        {/* Prompt to select payment method */}
        {!selectedMethod && (
          <p className="text-sm text-gray-500 text-center">
            Select a payment method above to continue
          </p>
        )}
      </div>

      {/* Confirm Button - pinned to bottom */}
      {selectedMethod && (
        <div className="pt-6">
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
    </div>
  );
}
