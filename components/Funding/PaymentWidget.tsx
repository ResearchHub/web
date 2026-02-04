'use client';

import React, { useState } from 'react';
import { CreditCard, Plus, Minus, Check, Info } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faApplePay, faGooglePay, faPaypal } from '@fortawesome/free-brands-svg-icons';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';
import Image from 'next/image';
import {
  usePaymentMethod,
  usePaymentCalculations,
  HIDDEN_PAYMENT_METHODS,
  type PaymentMethodType,
} from './lib';
import { MOCK_DAF_ACCOUNTS } from './lib/mockEndaomentData';
import { CreditCardForm, type StripePaymentContext } from './CreditCardForm';
import { DAFAccountSelector } from './DAFAccountSelector';
import { InsufficientDAFFundsAlert } from './InsufficientDAFFundsAlert';

interface PaymentOption {
  id: PaymentMethodType;
  title: string;
  description?: string; // Optional - only for RSC and Endaoment
  icon: React.ReactNode;
  badge?: string;
}

interface PaymentWidgetProps {
  /** Amount in RSC for payment calculations */
  amountInRsc: number;
  /** Amount in USD for DAF account comparison */
  amountInUsd: number;
  /** Amount display string (e.g., "$100.00") */
  amountDisplay: string;
  /** User's RSC balance */
  rscBalance: number;
  /** Called when user clicks "Preview Payment" (for payment methods with preview) */
  onPreviewTransaction: (paymentMethod: Exclude<PaymentMethodType, 'endaoment' | 'other'>) => void;
  /** Called when user clicks "Login to Endaoment" */
  onEndaomentLogin?: () => void;
  /** Called when user wants to deposit RSC */
  onDepositRsc?: () => void;
  /** Called when user wants to buy RSC */
  onBuyRsc?: () => void;
  /** Whether the CTA button should be disabled */
  isButtonDisabled?: boolean;
  /** Initial/controlled selected payment method */
  selectedPaymentMethod?: PaymentMethodType | null;
  /** Callback when payment method changes (for lifting state) */
  onPaymentMethodChange?: (method: PaymentMethodType | null) => void;
  /** Callback when credit card completeness changes */
  onCreditCardCompleteChange?: (isComplete: boolean) => void;
  /** Callback when Stripe context is ready for payment confirmation */
  onStripeReady?: (context: StripePaymentContext | null) => void;
  /** Callback when DAF account selection changes */
  onDafAccountChange?: (accountId: string | null) => void;
  /** Callback when DAF account insufficient funds status changes */
  onDafInsufficientFundsChange?: (hasInsufficientFunds: boolean) => void;
  /** Whether to hide the CTA button (when used inside PaymentStep) */
  hideButton?: boolean;
  /** Whether the browser is Safari (determines Apple Pay vs Google Pay visibility) */
  isSafari?: boolean;
}

/**
 * Payment method selection widget.
 * Click header to expand/collapse. Selection auto-collapses.
 * CC form appears below widget when Credit Card is selected.
 */
export function PaymentWidget({
  amountInRsc,
  amountInUsd,
  amountDisplay,
  rscBalance,
  onPreviewTransaction,
  onEndaomentLogin,
  onDepositRsc,
  onBuyRsc,
  isButtonDisabled = false,
  selectedPaymentMethod,
  onPaymentMethodChange,
  onCreditCardCompleteChange,
  onStripeReady,
  onDafAccountChange,
  onDafInsufficientFundsChange,
  hideButton = false,
  isSafari = false,
}: PaymentWidgetProps) {
  const { isExpanded, selectedMethod, toggleExpanded, selectMethod } = usePaymentMethod({
    initialMethod: selectedPaymentMethod,
    onMethodChange: onPaymentMethodChange,
  });

  // State for selected DAF account (Endaoment)
  const [selectedDafAccountId, setSelectedDafAccountId] = useState<string | null>(null);

  // Handler for DAF account selection that also notifies parent
  const handleDafAccountSelect = (accountId: string) => {
    setSelectedDafAccountId(accountId);
    onDafAccountChange?.(accountId);
  };

  // State for credit card completeness
  const [isCreditCardComplete, setIsCreditCardComplete] = useState(false);

  // Handler for credit card completeness that also notifies parent
  const handleCreditCardComplete = (isComplete: boolean) => {
    setIsCreditCardComplete(isComplete);
    onCreditCardCompleteChange?.(isComplete);
  };

  // Calculate if RSC balance is insufficient (only when RSC is selected)
  const { insufficientBalance } = usePaymentCalculations({
    amountInRsc,
    rscBalance,
    paymentMethod: 'rsc', // Always calculate for RSC to check balance
  });

  // Calculate if selected DAF account has insufficient funds
  const selectedDafAccount = MOCK_DAF_ACCOUNTS.find((acc) => acc.id === selectedDafAccountId);
  const isDafInsufficientBalance = Boolean(
    selectedMethod === 'endaoment' &&
    selectedDafAccount &&
    selectedDafAccount.balanceUsd < amountInUsd
  );

  // Notify parent when DAF insufficient funds status changes
  React.useEffect(() => {
    if (selectedMethod === 'endaoment') {
      onDafInsufficientFundsChange?.(isDafInsufficientBalance);
    }
  }, [selectedMethod, isDafInsufficientBalance, onDafInsufficientFundsChange]);

  const formatRsc = (amount: number) =>
    `${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} RSC`;

  const paymentOptions: PaymentOption[] = [
    {
      id: 'rsc',
      title: 'ResearchCoin',
      description: `Balance: ${formatRsc(rscBalance)}`,
      icon: <ResearchCoinIcon size={18} />,
    },
    {
      id: 'endaoment',
      title: 'Endaoment',
      description: 'Contribute from your DAF',
      icon: (
        <Image
          src="/logos/endaoment_color.svg"
          alt="Endaoment"
          width={18}
          height={18}
          className="object-contain"
        />
      ),
    },
    {
      id: 'credit_card',
      title: 'Credit Card',
      icon: <CreditCard className="h-[18px] w-[18px] text-gray-600" />,
    },
    {
      id: 'apple_pay',
      title: 'Apple Pay',
      icon: <FontAwesomeIcon icon={faApplePay} className="h-6 w-6 text-gray-800" />,
    },
    {
      id: 'google_pay',
      title: 'Google Pay',
      icon: <FontAwesomeIcon icon={faGooglePay} className="h-6 w-6 text-gray-600" />,
    },
    {
      id: 'paypal',
      title: 'PayPal',
      icon: <FontAwesomeIcon icon={faPaypal} className="h-[18px] w-[18px] text-[#003087]" />,
    },
  ];

  // Filter out hidden payment methods and browser-specific payment methods
  // Safari: show Apple Pay, hide Google Pay
  // Non-Safari: show Google Pay, hide Apple Pay
  const visiblePaymentOptions = paymentOptions.filter((option) => {
    if (HIDDEN_PAYMENT_METHODS.includes(option.id)) return false;
    if (option.id === 'apple_pay' && !isSafari) return false;
    if (option.id === 'google_pay' && isSafari) return false;
    return true;
  });

  // Get the selected payment option details
  const selectedOption = paymentOptions.find((opt) => opt.id === selectedMethod);

  // Check if RSC is selected and balance is insufficient
  const isRscInsufficientBalance = selectedMethod === 'rsc' && insufficientBalance;

  // Determine CTA button text and action based on selected method
  const getButtonConfig = (): {
    text: string;
    onClick: () => void;
    disabled: boolean;
    icon?: React.ReactNode;
  } => {
    switch (selectedMethod) {
      case 'rsc':
        return {
          text: 'Preview Payment',
          onClick: () => onPreviewTransaction('rsc'),
          disabled: isButtonDisabled || isRscInsufficientBalance,
        };
      case 'credit_card':
        return {
          text: 'Preview Payment',
          onClick: () => onPreviewTransaction(selectedMethod),
          disabled: isButtonDisabled || !isCreditCardComplete,
        };
      case 'apple_pay':
      case 'google_pay':
      case 'paypal':
        return {
          text: 'Preview Payment',
          onClick: () => onPreviewTransaction(selectedMethod),
          disabled: isButtonDisabled,
        };
      case 'endaoment':
        return {
          text: 'Preview Payment',
          onClick: () => onEndaomentLogin?.(),
          disabled:
            isButtonDisabled ||
            !onEndaomentLogin ||
            !selectedDafAccountId ||
            isDafInsufficientBalance,
        };
      default:
        return {
          text: 'Preview Payment',
          onClick: () => {},
          disabled: true,
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="space-y-4">
      {/* Payment Method Selector - unified dropdown container */}
      <div
        className={cn(
          'rounded-xl border overflow-hidden transition-all duration-200',
          isExpanded ? 'border-primary-500' : 'border-gray-200'
        )}
      >
        {/* Header - click to expand/collapse */}
        <button
          type="button"
          onClick={toggleExpanded}
          className={cn(
            'w-full py-3 px-4 transition-all duration-200',
            'flex items-center justify-between',
            'hover:bg-gray-50',
            'focus:outline-none',
            !isExpanded && 'focus:ring-2 focus:ring-primary-500 focus:ring-inset',
            isExpanded ? 'bg-primary-50/30' : 'bg-white'
          )}
        >
          <div className="flex items-center gap-2.5">
            {selectedOption ? (
              <>
                <div className="flex-shrink-0 w-5 flex items-center justify-center">
                  {selectedOption.icon}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-medium text-gray-900">{selectedOption.title}</span>
                  {selectedOption.description && (
                    <span className="text-xs text-gray-500">{selectedOption.description}</span>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex-shrink-0 w-5 flex items-center justify-center">
                  <CreditCard className="h-[18px] w-[18px] text-gray-400" />
                </div>
                <span className="font-medium text-gray-700">Select payment option</span>
              </>
            )}
          </div>
          <div className="flex-shrink-0">
            {isExpanded ? (
              <Minus className="h-5 w-5 text-gray-400" />
            ) : (
              <Plus className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </button>

        {/* Expanded payment options - compact single-line layout */}
        {isExpanded && (
          <div className="border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
            {visiblePaymentOptions.map((option, index) => (
              <button
                key={option.id}
                type="button"
                onClick={() => selectMethod(option.id)}
                className={cn(
                  'w-full py-2.5 px-3 transition-all duration-200',
                  'flex items-center gap-2.5',
                  'hover:bg-primary-50',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset',
                  index !== visiblePaymentOptions.length - 1 && 'border-b border-gray-200',
                  selectedMethod === option.id ? 'bg-primary-50' : 'bg-white'
                )}
              >
                {/* Icon - no circular container */}
                <div className="flex-shrink-0 w-5 flex items-center justify-center">
                  {option.icon}
                </div>

                {/* Title and optional description */}
                <div className="flex-1 flex flex-col text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">{option.title}</span>
                    {option.badge && (
                      <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 whitespace-nowrap">
                        {option.badge}
                      </span>
                    )}
                  </div>
                  {option.description && (
                    <span className="text-xs text-gray-500">{option.description}</span>
                  )}
                </div>

                {/* Checkmark for selected option */}
                {selectedMethod === option.id && (
                  <div className="flex-shrink-0">
                    <Check className="h-4 w-4 text-primary-600" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Credit Card Form - appears below widget when CC is selected */}
      {selectedMethod === 'credit_card' && !isExpanded && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          <CreditCardForm
            amountDisplay={amountDisplay}
            isSubmitting={false}
            hideSubmitButton
            onCardComplete={handleCreditCardComplete}
            onStripeReady={onStripeReady}
          />
        </div>
      )}

      {/* DAF Account Selector - appears below widget when Endaoment is selected */}
      {selectedMethod === 'endaoment' && !isExpanded && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          <DAFAccountSelector
            accounts={MOCK_DAF_ACCOUNTS}
            selectedAccountId={selectedDafAccountId}
            onSelectAccount={handleDafAccountSelect}
            requiredAmountUsd={amountInUsd}
          />
        </div>
      )}

      {/* Insufficient DAF Funds Alert - appears when selected DAF has insufficient balance */}
      {isDafInsufficientBalance && !isExpanded && <InsufficientDAFFundsAlert />}

      {/* CTA Button - hidden when used inside PaymentStep */}
      {!hideButton && (
        <Button
          type="button"
          variant="default"
          disabled={buttonConfig.disabled}
          className="w-full h-12 text-base"
          onClick={buttonConfig.onClick}
        >
          {buttonConfig.icon && <span className="mr-2 flex items-center">{buttonConfig.icon}</span>}
          {buttonConfig.text}
        </Button>
      )}
    </div>
  );
}
