'use client';

import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { CreditCard } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faApplePay, faGooglePay, faPaypal } from '@fortawesome/free-brands-svg-icons';
import { InsufficientBalanceAlert } from './InsufficientBalanceAlert';
import { usePaymentCalculations, PAYMENT_METHOD_LABELS, type PaymentMethodType } from './lib';

interface PaymentPreviewProps {
  /** Payment method type */
  paymentMethod: Exclude<PaymentMethodType, 'endaoment' | 'other'>;
  /** Amount in RSC (before fees) */
  amountInRsc: number;
  /** User's current RSC balance */
  rscBalance: number;
  /** Whether the action is being processed */
  isProcessing?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Button text */
  buttonText: string;
  /** Called when the button is clicked */
  onAction: () => void;
  /** Called when user wants to deposit RSC (only for RSC) */
  onDepositRsc?: () => void;
  /** Called when user wants to buy RSC (only for RSC) */
  onBuyRsc?: () => void;
}

/**
 * Payment preview component showing fee breakdown and action button.
 * Styled as a receipt with line items.
 */
export function PaymentPreview({
  paymentMethod,
  amountInRsc,
  rscBalance,
  isProcessing = false,
  error,
  buttonText,
  onAction,
  onDepositRsc,
  onBuyRsc,
}: PaymentPreviewProps) {
  const {
    platformFee,
    totalAmount,
    insufficientBalance,
    feePercentage,
    formatRsc,
    formatUsd,
    rscToUsd,
  } = usePaymentCalculations({ amountInRsc, rscBalance, paymentMethod });

  // Get icon based on payment method
  const PaymentIcon = () => {
    switch (paymentMethod) {
      case 'rsc':
        return <ResearchCoinIcon size={16} variant="gray" />;
      case 'credit_card':
        return <CreditCard className="h-4 w-4 text-gray-600" />;
      case 'apple_pay':
        return <FontAwesomeIcon icon={faApplePay} className="h-4 w-4 text-gray-800" />;
      case 'google_pay':
        return <FontAwesomeIcon icon={faGooglePay} className="h-4 w-4 text-gray-600" />;
      case 'paypal':
        return <FontAwesomeIcon icon={faPaypal} className="h-4 w-4 text-[#003087]" />;
      default:
        return null;
    }
  };

  // Determine if button should be disabled
  const isDisabled = isProcessing || (paymentMethod === 'rsc' && insufficientBalance);

  return (
    <div className="space-y-4">
      {/* Receipt-style table */}
      <div>
        {/* Payment method line item */}
        <div className="py-2 flex items-center justify-between">
          <span className="text-sm text-gray-600">Payment method</span>
          <div className="flex items-center gap-2">
            <PaymentIcon />
            <span className="text-sm font-medium text-gray-900">
              {PAYMENT_METHOD_LABELS[paymentMethod]}
            </span>
          </div>
        </div>

        {/* Funding amount line item */}
        <div className="py-2 flex items-center justify-between">
          <span className="text-sm text-gray-600">Funding amount</span>
          <span className="text-sm font-medium text-gray-900">{formatRsc(amountInRsc)}</span>
        </div>

        {/* Platform fee line item */}
        <div className="py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Platform fee ({feePercentage}%)</span>
            {paymentMethod === 'rsc' && (
              <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                Lowest fee
              </span>
            )}
          </div>
          <span className="text-sm text-gray-600">+ {formatRsc(platformFee)}</span>
        </div>

        {/* Total line item - with divider above */}
        <div className="py-2 flex items-center justify-between border-t border-gray-200">
          <span className="text-sm font-semibold text-gray-900">Total</span>
          <div className="text-right">
            <span className="text-base font-bold text-gray-900">{formatRsc(totalAmount)}</span>
            <p className="text-xs text-gray-500">≈ {formatUsd(rscToUsd(totalAmount))}</p>
          </div>
        </div>
      </div>

      {/* Balance check - only for RSC */}
      {paymentMethod === 'rsc' && insufficientBalance && <InsufficientBalanceAlert />}

      {/* Error Alert */}
      {error && <Alert variant="error">{error}</Alert>}

      {/* Action Button */}
      <Button
        type="button"
        variant="default"
        disabled={isDisabled}
        className="w-full h-12 text-base"
        onClick={onAction}
      >
        {isProcessing ? 'Processing...' : buttonText}
      </Button>
    </div>
  );
}
