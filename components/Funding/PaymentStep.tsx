'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Tooltip } from '@/components/ui/Tooltip';
import { Logo } from '@/components/ui/Logo';
import { PaymentWidget } from './PaymentWidget';
import { PaymentRequestButton } from './PaymentRequestButton';
import { InsufficientBalanceAlert } from './InsufficientBalanceAlert';
import { StripeProvider } from './StripeProvider';
import {
  usePaymentCalculations,
  usePaymentRequest,
  getDefaultPaymentMethod,
  type PaymentMethodType,
} from './lib';
import type { StripePaymentContext } from './CreditCardForm';
import { useIsSafari } from '@/hooks/useIsSafari';
import {
  PAYMENT_FEES,
  PLATFORM_FEE_PERCENTAGE_RSC,
  PAYMENT_PROCESSING_FEE,
  METHODS_WITH_PROCESSING_FEE,
} from './lib/constants';
import { ID } from '@/types/root';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';

interface PaymentStepProps {
  /** Amount in RSC (before fees) */
  amountInRsc: number;
  /** Amount in USD */
  amountInUsd: number;
  /** Amount display string */
  amountDisplay: string;
  /** User's current RSC balance */
  rscBalance: number;
  /** Fundraise ID for payment request button */
  fundraiseId: ID;
  /** Whether the action is being processed */
  isProcessing?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Called when payment is confirmed (excludes endaoment which has separate flow) */
  onConfirmPayment: (
    paymentMethod: Exclude<PaymentMethodType, 'endaoment'>
  ) => void | Promise<void>;
  /** Called when Apple Pay/Google Pay payment succeeds */
  onPaymentRequestSuccess?: (paymentMethod?: 'apple_pay' | 'google_pay') => void;
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
 *
 * Wrapped with StripeProvider so the usePaymentRequest hook can check
 * wallet payment method availability (Apple Pay, Google Pay, Link).
 */
export function PaymentStep(props: PaymentStepProps) {
  return (
    <StripeProvider>
      <PaymentStepInner {...props} />
    </StripeProvider>
  );
}

function PaymentStepInner({
  amountInRsc,
  amountInUsd,
  amountDisplay,
  rscBalance,
  fundraiseId,
  isProcessing = false,
  error,
  onConfirmPayment,
  onPaymentRequestSuccess,
  onDepositRsc,
  onBuyRsc,
  onStripeReady,
}: PaymentStepProps) {
  const isSafari = useIsSafari();

  // Compute the default payment method based on balance and browser
  // Use RSC fee percentage since we're checking if user can afford RSC payment
  const defaultPaymentMethod = useMemo(
    () => getDefaultPaymentMethod(rscBalance, amountInRsc, PLATFORM_FEE_PERCENTAGE_RSC, isSafari),
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
  // Fee percentage depends on the selected payment method
  const currentFeePercentage =
    selectedMethod && selectedMethod in PAYMENT_FEES
      ? PAYMENT_FEES[selectedMethod as keyof typeof PAYMENT_FEES]
      : PLATFORM_FEE_PERCENTAGE_RSC;
  const platformFeeUsd = amountInUsd * (currentFeePercentage / 100);

  // Payment processing fee only for non-RSC methods
  const hasProcessingFee = selectedMethod && METHODS_WITH_PROCESSING_FEE.includes(selectedMethod);
  const processingFeeUsd = hasProcessingFee
    ? amountInUsd * (PAYMENT_PROCESSING_FEE.percentage / 100) +
      PAYMENT_PROCESSING_FEE.fixedCents / 100
    : 0;

  // Total due = user's input plus all fees
  const totalDueUsd = amountInUsd + platformFeeUsd + processingFeeUsd;

  // Check wallet payment method availability via Stripe
  const { paymentRequest, availability } = usePaymentRequest({
    amountCents: Math.round(totalDueUsd * 100),
    label: 'Fund Research',
  });

  // Auto-fallback: if user has a wallet method selected but availability resolved
  // and that method isn't available, switch to credit card
  useEffect(() => {
    if (availability.checking) return;

    if (selectedMethod === 'apple_pay' && !availability.applePay && !availability.link) {
      setSelectedMethod('credit_card');
    } else if (selectedMethod === 'google_pay' && !availability.googlePay && !availability.link) {
      setSelectedMethod('credit_card');
    }
  }, [availability, selectedMethod]);

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
  const handlePaymentMethodChange = useCallback(
    (method: PaymentMethodType | null) => {
      setSelectedMethod(method);
      // Reset credit card completeness when changing methods
      if (method !== 'credit_card') {
        setIsCreditCardComplete(false);
      }
      // Track payment method selection
      if (method) {
        AnalyticsService.logEvent(LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_METHOD_SELECTED, {
          fundraise_id: fundraiseId,
          payment_method: method,
          amount_usd: amountInUsd,
        });
      }
    },
    [fundraiseId, amountInUsd]
  );

  // Dummy handlers for PaymentWidget (we handle the action in this component)
  const handlePreviewTransaction = useCallback(() => {
    // No-op - we use the confirm button below instead
  }, []);

  // Determine if the selected wallet method should show the PaymentRequestButton
  const showPaymentRequestButton =
    paymentRequest &&
    (selectedMethod === 'apple_pay' || selectedMethod === 'google_pay') &&
    !availability.checking;

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
          walletAvailability={
            availability.checking
              ? undefined
              : { applePay: availability.applePay, googlePay: availability.googlePay }
          }
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
                    Platform fee ({currentFeePercentage}%)
                  </span>
                  <Tooltip
                    content={
                      <div className="text-left space-y-3 py-1">
                        {/* Header with logo */}
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                          <Logo noText size={32} />
                          <span className="text-base font-medium text-gray-800">Platform Fee</span>
                        </div>

                        {/* Fee breakdown */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">ResearchHub Inc</span>
                            <span className="font-medium text-gray-800">
                              {currentFeePercentage - 2}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">ResearchHub Foundation</span>
                            <span className="font-medium text-gray-800">2%</span>
                          </div>
                        </div>

                        {/* Footer note */}
                        <p className="text-xs text-gray-600 pt-1 border-t border-gray-100">
                          Supports open science infrastructure
                        </p>
                      </div>
                    }
                    width="w-64"
                  >
                    <Info className="h-4 w-4 text-gray-500 cursor-help" />
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

      {/* Payment Button - pinned to bottom */}
      {selectedMethod && (
        <div className="pt-6">
          {showPaymentRequestButton ? (
            <PaymentRequestButton
              paymentRequest={paymentRequest}
              amountInRsc={amountInRsc}
              fundraiseId={fundraiseId}
              onSuccess={() =>
                onPaymentRequestSuccess?.(selectedMethod as 'apple_pay' | 'google_pay')
              }
              onError={(err) => console.error('Payment request error:', err)}
            />
          ) : (
            <Button
              type="button"
              variant="default"
              disabled={isDisabled}
              className="w-full h-12 text-base"
              onClick={handleConfirm}
            >
              {isProcessing ? 'Processing...' : 'Confirm & Pay'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
