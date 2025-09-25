'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/utils/styles';
import { ID } from '@/types/root';
import { BalanceInfo } from './BalanceInfo';
import { toast } from 'react-hot-toast';
import { useUser } from '@/contexts/UserContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { FeedContentType } from '@/types/feed';
import { useTip } from '@/hooks/useTip'; // Import the useTip hook
import { formatRSC } from '@/utils/number';
import { ContentType } from '@/types/work';

interface TipContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTipSuccess?: (amount: number) => void; // Added onTipSuccess prop
  contentId: number; // ID of the content being tipped
  feedContentType: FeedContentType; // Type of content being tipped
  recipientName?: string; // Optional: Name of the recipient for display
  relatedWorkContentType?: ContentType;
  relatedWorkTopicIds: string[];
}

// Currency Input Component (reusable, slightly modified label)
const CurrencyInput = ({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) => {
  return (
    <div className="relative">
      <Input
        name="amount"
        value={value}
        onChange={onChange}
        required
        label="Tip Amount" // Changed label
        placeholder="0.00"
        type="text"
        inputMode="numeric"
        className={`w-full text-left h-12 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${error ? 'border-red-500' : ''}`}
        rightElement={
          <div className="flex items-center gap-1 pr-3 text-gray-900">
            <span className="font-medium">RSC</span>
          </div>
        }
      />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Modal Header Component (reusable)
const ModalHeader = ({
  title,
  onClose,
  subtitle,
}: {
  title: string;
  onClose: () => void;
  subtitle?: string;
}) => (
  <div className="border-b border-gray-200 -mx-6 px-6 pb-4 mb-6">
    <div className="flex justify-between items-center">
      <div>
        <Dialog.Title as="h2" className="text-xl font-semibold text-gray-900">
          {title}
        </Dialog.Title>
        {subtitle && <p className="text-sm font-medium text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <button type="button" className="text-gray-400 hover:text-gray-500" onClick={onClose}>
        <span className="sr-only">Close</span>
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
);

export function TipContentModal({
  isOpen,
  onClose,
  onTipSuccess,
  contentId,
  feedContentType,
  relatedWorkContentType,
  recipientName, // Optional recipient name
  relatedWorkTopicIds,
}: TipContentModalProps) {
  const { user } = useUser();
  const { exchangeRate, isLoading: isExchangeRateLoading } = useExchangeRate();
  const [inputAmount, setInputAmount] = useState(10); // Default tip amount
  const [error, setError] = useState<string | null>(null); // General error state
  const [amountError, setAmountError] = useState<string | undefined>(undefined); // Input specific error

  const userBalance = user?.balance || 0;

  // Use the tipping hook
  const { tip, isTipping } = useTip({
    contentId,
    feedContentType,
    relatedWorkContentType,
    topicIds: relatedWorkTopicIds,
    onTipSuccess: (response, tippedAmount) => {
      // Call the passed-in success handler
      if (onTipSuccess) {
        onTipSuccess(tippedAmount);
      }
      // Close the modal on success
      onClose();
    },
    onTipError: (err) => {
      // Let the hook handle toast notifications, just set local error if needed
      setError(err instanceof Error ? err.message : 'Failed to send tip.');
    },
  });

  // Handle amount input changes
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    const numValue = parseFloat(rawValue);

    // Reset errors on change
    setError(null);
    setAmountError(undefined);

    if (!isNaN(numValue)) {
      setInputAmount(numValue);
      if (numValue <= 0) {
        setAmountError('Tip amount must be positive');
      }
    } else if (rawValue === '') {
      setInputAmount(0); // Allow clearing the input
    } else {
      // Handle invalid input like multiple decimals etc.
      setInputAmount(inputAmount); // Keep previous valid value
      setAmountError('Please enter a valid amount');
    }
  };

  // Format the input value for display (e.g., with commas)
  const getFormattedInputValue = () => {
    if (inputAmount === 0 && !document.activeElement?.matches('input[name="amount"]')) return ''; // Show placeholder if 0 and not focused
    return inputAmount.toLocaleString();
  };

  // Handle the tip submission
  const handleTip = async () => {
    setError(null); // Clear previous errors
    setAmountError(undefined);

    if (inputAmount <= 0) {
      setAmountError('Tip amount must be positive');
      return;
    }

    if (userBalance < inputAmount) {
      setError('Insufficient balance to send tip.');
      return;
    }

    // Call the tip function from the hook
    await tip(inputAmount);
    // Success/error handling and modal closing is managed within the hook's callbacks
  };

  const insufficientBalance = userBalance < inputAmount;

  // Calculate USD equivalent for display
  const usdEquivalent =
    !isExchangeRateLoading && exchangeRate > 0 && inputAmount > 0
      ? `≈ $${(inputAmount * exchangeRate).toFixed(2)} USD`
      : '';

  const modalSubtitle = recipientName
    ? `Send ResearchCoin to ${recipientName} for their contribution`
    : 'Send ResearchCoin for this contribution';

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black !bg-opacity-25" />
        </Transition.Child>

        {/* Modal Content */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="p-6">
                  {/* Header */}
                  <ModalHeader title="Send a Tip" onClose={onClose} subtitle={modalSubtitle} />

                  <div className="space-y-6">
                    {/* Amount Input */}
                    <div>
                      <CurrencyInput
                        value={getFormattedInputValue()}
                        onChange={handleAmountChange}
                        error={amountError}
                      />
                      {!amountError && usdEquivalent && (
                        <div className="mt-1.5 text-sm text-gray-500">{usdEquivalent}</div>
                      )}
                    </div>

                    {/* Balance Info */}
                    <div>
                      <BalanceInfo amount={inputAmount} showWarning={insufficientBalance} />
                    </div>

                    {/* Error Alert */}
                    {error && <Alert variant="error">{error}</Alert>}

                    {/* Tip Button */}
                    <Button
                      type="button"
                      variant="default"
                      disabled={
                        isTipping ||
                        !inputAmount ||
                        inputAmount <= 0 ||
                        insufficientBalance ||
                        !!amountError
                      }
                      className="w-full h-12 text-base"
                      onClick={handleTip}
                    >
                      {isTipping
                        ? 'Sending Tip...'
                        : `Send ${inputAmount > 0 ? inputAmount.toLocaleString() : ''} RSC Tip`}
                    </Button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
