'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Alert } from '@/components/ui/Alert';
import { Tooltip } from '@/components/ui/Tooltip';
import { Currency, ID } from '@/types/root';
import { BalanceInfo } from './BalanceInfo';
import { toast } from 'react-hot-toast';
import { FundraiseService } from '@/services/fundraise.service';
import { useUser } from '@/contexts/UserContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { Fundraise } from '@/types/funding';
import { CheckCircle, CreditCard, Wallet, ArrowRight, DollarSign, Plus } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { Progress } from '@/components/ui/Progress';

interface ContributeToFundraiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContributeSuccess?: () => void;
  fundraise: Fundraise;
}

// POC: Define the steps for the modal
type ModalStep = 'contribute' | 'buy-rsc' | 'success';

// POC: Payment method component
const PaymentMethodSelector = ({
  selectedMethod,
  onSelect,
}: {
  selectedMethod: 'card' | 'crypto';
  onSelect: (method: 'card' | 'crypto') => void;
}) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">Select payment method</label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onSelect('card')}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedMethod === 'card'
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <CreditCard className="w-6 h-6 mx-auto mb-2 text-gray-700" />
          <p className="text-sm font-medium">Credit Card</p>
          <p className="text-xs text-gray-500 mt-1">Visa, Mastercard, etc.</p>
        </button>

        <button
          type="button"
          onClick={() => onSelect('crypto')}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedMethod === 'crypto'
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Wallet className="w-6 h-6 mx-auto mb-2 text-gray-700" />
          <p className="text-sm font-medium">Cryptocurrency</p>
          <p className="text-xs text-gray-500 mt-1">ETH, USDC</p>
        </button>
      </div>
    </div>
  );
};

// POC: Success page component
const SuccessView = ({
  contributionAmount,
  purchasedAmount,
  onClose,
}: {
  contributionAmount: number;
  purchasedAmount: number;
  onClose: () => void;
}) => {
  return (
    <div className="text-center py-8">
      <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>

      <h3 className="text-2xl font-semibold text-gray-900 mb-2">Contribution Successful!</h3>
      <p className="text-gray-600 mb-8">Thank you for supporting this fundraise</p>

      <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">RSC Purchased:</span>
          <span className="font-semibold text-gray-900">
            {purchasedAmount.toLocaleString()} RSC
          </span>
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Contributed to Fundraise:</span>
            <span className="font-semibold text-gray-900">
              {contributionAmount.toLocaleString()} RSC
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button type="button" variant="default" className="w-full" onClick={onClose}>
          Done
        </Button>

        <p className="text-sm text-gray-500">
          Your contribution has been added to the fundraise.
          <br />
          You can track the progress on the fundraise page.
        </p>
      </div>
    </div>
  );
};

// POC: Buy RSC view component
const BuyRSCView = ({
  requiredAmount,
  onPurchaseComplete,
  onBack,
}: {
  requiredAmount: number;
  onPurchaseComplete: (purchasedAmount: number) => void;
  onBack: () => void;
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card');
  const [purchaseAmount, setPurchaseAmount] = useState(requiredAmount);
  const [isProcessing, setIsProcessing] = useState(false);
  const { exchangeRate } = useExchangeRate();

  const usdAmount = purchaseAmount / (exchangeRate || 1);

  const handlePurchase = async () => {
    setIsProcessing(true);

    try {
      if (paymentMethod === 'card') {
        // POC: Create Stripe checkout session
        // In production, this would call your backend API to create a Stripe session
        const checkoutData = {
          rscAmount: purchaseAmount,
          usdAmount: usdAmount.toFixed(2),
          currency: 'usd',
          // Additional metadata for tracking
          metadata: {
            userId: 'user-id', // Would come from user context
            purchaseType: 'rsc_purchase',
            rscRate: exchangeRate || 1,
          },
        };

        // POC: For demo purposes, show what would be sent to Stripe
        console.log('Stripe Checkout Data:', checkoutData);

        // POC: Simulate Stripe redirect
        toast(`Redirecting to Stripe checkout for $${usdAmount.toFixed(2)}...`);

        // In production:
        // 1. Call your backend: POST /api/stripe/create-checkout-session
        // 2. Backend creates Stripe session with line items
        // 3. Backend returns checkout URL
        // 4. Redirect: window.location.href = checkoutUrl

        // Simulate success for POC
        await new Promise((resolve) => setTimeout(resolve, 2000));
        toast.success('Payment processed successfully!');
        onPurchaseComplete(purchaseAmount);
      } else {
        // Crypto payment flow
        toast('Crypto payments integration coming soon!');
        // Could integrate with Coinbase Commerce or similar
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('Failed to initiate purchase. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to contribution
      </button>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Buy ResearchCoin</h3>
        <p className="text-sm text-gray-600">
          You need to purchase RSC to complete your contribution
        </p>
      </div>

      {/* Purchase amount input */}
      <div>
        <Input
          label="Amount to purchase"
          value={purchaseAmount.toLocaleString()}
          onChange={(e) => {
            const value = parseFloat(e.target.value.replace(/[^0-9.]/g, ''));
            if (!isNaN(value)) setPurchaseAmount(value);
          }}
          rightElement={<span className="text-gray-600 pr-3">RSC</span>}
        />
        <p className="text-sm text-gray-500 mt-2">≈ ${usdAmount.toFixed(2)} USD</p>
      </div>

      {/* Payment method selector */}
      <PaymentMethodSelector selectedMethod={paymentMethod} onSelect={setPaymentMethod} />

      {/* Purchase summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="text-sm text-blue-900">
            <p className="font-medium">Purchase Summary</p>
            <p className="mt-1">
              You're buying {purchaseAmount.toLocaleString()} RSC
              {paymentMethod === 'card' ? ' with your credit card' : ' with cryptocurrency'}
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        <Button
          variant="default"
          className="w-full"
          onClick={handlePurchase}
          disabled={isProcessing || purchaseAmount <= 0}
        >
          {isProcessing ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            <>Purchase RSC</>
          )}
        </Button>

        <p className="text-xs text-center text-gray-500">
          {paymentMethod === 'card'
            ? 'Your card will be charged securely via our payment processor'
            : 'You will be redirected to complete the crypto transaction'}
        </p>
      </div>
    </div>
  );
};

// Currency Input Component
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
        label="I am contributing"
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

// Fee Breakdown Component
const FeeBreakdown = ({
  contributionAmount,
  platformFee,
  totalAmount,
}: {
  contributionAmount: number;
  platformFee: number;
  totalAmount: number;
}) => (
  <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
    <div className="flex justify-between items-center">
      <span className="text-gray-900">Your contribution:</span>
      <span className="text-gray-900">{contributionAmount.toLocaleString()} RSC</span>
    </div>

    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-gray-600">Platform fees (9%)</span>
        </div>
        <span className="text-gray-600">+ {platformFee.toLocaleString()} RSC</span>
      </div>
    </div>

    <div className="border-t border-gray-200" />

    <div className="flex justify-between items-center">
      <span className="font-semibold text-gray-900">Total amount:</span>
      <span className="font-semibold text-gray-900">{totalAmount.toLocaleString()} RSC</span>
    </div>
  </div>
);

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

export function ContributeToFundraiseModal({
  isOpen,
  onClose,
  onContributeSuccess,
  fundraise,
}: ContributeToFundraiseModalProps) {
  const { user } = useUser();
  const [inputAmount, setInputAmount] = useState(100);
  const [isContributing, setIsContributing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [amountError, setAmountError] = useState<string | undefined>(undefined);

  // POC: Step management
  const [currentStep, setCurrentStep] = useState<ModalStep>('contribute');
  const [purchasedRSCAmount, setPurchasedRSCAmount] = useState(0);

  // POC: Tab management
  const [activeTab, setActiveTab] = useState<'fund' | 'buy-rsc'>('fund');

  // Force re-render when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset to fund tab when modal opens with a slight delay to ensure modal is rendered
      const timer = setTimeout(() => {
        setActiveTab('fund');
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Calculate total available balance including locked balance for fundraise contributions
  const userBalance = user?.balance || 0;
  const lockedBalance = user?.lockedBalance || 0;
  const totalAvailableBalance = userBalance + lockedBalance;

  // Utility functions
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    const numValue = parseFloat(rawValue);

    if (!isNaN(numValue)) {
      setInputAmount(numValue);

      // Validate minimum amount
      if (numValue < 10) {
        setAmountError('Minimum contribution amount is 10 RSC');
      } else {
        setAmountError(undefined);
      }
    } else {
      setInputAmount(0);
      setAmountError('Please enter a valid amount');
    }
  };

  const getFormattedInputValue = () => {
    if (inputAmount === 0) return '';
    return inputAmount.toLocaleString();
  };

  const handleContribute = async () => {
    try {
      // Validate minimum amount before proceeding
      if (inputAmount < 10) {
        setError('Minimum contribution amount is 10 RSC');
        return;
      }

      setError(null);

      // POC: Check if user has enough balance
      if (insufficientBalance) {
        setError('Insufficient balance. Please buy more RSC to complete this contribution.');
        return;
      }

      setIsContributing(true);

      // Pass the contribution amount without the platform fee
      // The API expects the net contribution amount
      await FundraiseService.contributeToFundraise(fundraise.id, inputAmount);

      toast.success('Your contribution has been successfully added to the fundraise.');

      // Set success flag
      setIsSuccess(true);

      // POC: Show success view
      setCurrentStep('success');

      // Call onContributeSuccess if provided
      if (onContributeSuccess) {
        onContributeSuccess();
      }
    } catch (error) {
      console.error('Failed to contribute to fundraise:', error);
      setError(error instanceof Error ? error.message : 'Failed to contribute to fundraise');
    } finally {
      setIsContributing(false);
    }
  };

  // POC: Handle RSC purchase completion
  const handlePurchaseComplete = async (purchasedAmount: number) => {
    setPurchasedRSCAmount(purchasedAmount);

    // After purchase, try to contribute again
    setIsContributing(true);
    try {
      await FundraiseService.contributeToFundraise(fundraise.id, inputAmount);
      toast.success('Your contribution has been successfully added to the fundraise.');
      setIsSuccess(true);
      setCurrentStep('success');

      if (onContributeSuccess) {
        onContributeSuccess();
      }
    } catch (error) {
      console.error('Failed to contribute to fundraise:', error);
      setError(error instanceof Error ? error.message : 'Failed to contribute to fundraise');
      setCurrentStep('contribute'); // Go back to contribution view on error
    } finally {
      setIsContributing(false);
    }
  };

  const platformFee = Math.round(inputAmount * 0.09 * 100) / 100;
  const totalAmount = inputAmount + platformFee;
  const insufficientBalance = totalAvailableBalance < totalAmount;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[100]"
        onClose={() => {
          // Reset state when modal is closed
          if (!isSuccess) {
            setIsSuccess(false);
          }
          setCurrentStep('contribute');
          setPurchasedRSCAmount(0);
          setActiveTab('fund');
          onClose();
        }}
      >
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
                  {/* POC: Render different views based on step */}
                  {currentStep === 'success' ? (
                    <SuccessView
                      contributionAmount={inputAmount}
                      purchasedAmount={purchasedRSCAmount}
                      onClose={onClose}
                    />
                  ) : currentStep === 'buy-rsc' ? (
                    <BuyRSCView
                      requiredAmount={totalAmount}
                      onPurchaseComplete={handlePurchaseComplete}
                      onBack={() => setCurrentStep('contribute')}
                    />
                  ) : (
                    <>
                      <ModalHeader
                        title="Contribute to Fundraise"
                        onClose={onClose}
                        subtitle="Support this fundraise by contributing ResearchCoin"
                      />

                      {/* POC: Single flow content without tabs */}
                      <div className="space-y-5 mt-6">
                        {/* Amount Input Section */}
                        <div>
                          <CurrencyInput
                            value={getFormattedInputValue()}
                            onChange={handleAmountChange}
                            error={amountError}
                          />
                        </div>

                        {/* Balance Display with Buy RSC button */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Balance</p>
                              <p className="text-xl font-semibold text-gray-900">
                                {totalAvailableBalance.toLocaleString()} RSC
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outlined"
                              onClick={() => setCurrentStep('buy-rsc')}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-blue-600 text-blue-600"
                            >
                              <Plus className="w-4 h-4" />
                              Buy RSC
                            </Button>
                          </div>
                        </div>

                        {/* Fees Breakdown Section */}
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 mb-3">Details</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Your contribution:</span>
                              <span className="font-medium text-gray-900">
                                {inputAmount.toLocaleString()} RSC
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1">
                                <span className="text-gray-700">Platform fees (9%)</span>
                              </div>
                              <span className="font-medium text-gray-900">
                                + {platformFee.toLocaleString()} RSC
                              </span>
                            </div>
                            <div className="pt-3 border-t border-gray-300">
                              <div className="flex justify-between items-center">
                                <span className="text-base font-semibold text-gray-900">
                                  Total amount:
                                </span>
                                <span className="text-base font-semibold text-gray-900">
                                  {totalAmount.toLocaleString()} RSC
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Error Alert */}
                        {error && <Alert variant="error">{error}</Alert>}

                        {/* Insufficient Balance Alert */}
                        {insufficientBalance && (
                          <Alert variant="error">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4s1 1 0 102 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="text-sm">
                                Cannot contribute to your own fundraise
                              </span>
                            </div>
                          </Alert>
                        )}

                        {/* Contribute Button */}
                        <Button
                          type="button"
                          variant="default"
                          disabled={
                            isContributing ||
                            !inputAmount ||
                            !!amountError ||
                            inputAmount < 10 ||
                            insufficientBalance
                          }
                          className="w-full h-12 text-base font-medium"
                          onClick={handleContribute}
                        >
                          {isContributing ? (
                            <div className="flex items-center justify-center gap-2">
                              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              <span>Processing...</span>
                            </div>
                          ) : (
                            'Contribute to Fundraise'
                          )}
                        </Button>

                        {/* Fundraise Progress with User Impact */}
                        <div className="space-y-3 mt-6">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Fundraise Progress</span>
                            <span className="text-gray-900 font-medium">
                              {fundraise.goalCurrency === 'RSC'
                                ? `${fundraise.amountRaised.rsc.toLocaleString()} / ${fundraise.goalAmount.rsc.toLocaleString()} RSC`
                                : `$${fundraise.amountRaised.usd.toLocaleString()} / $${fundraise.goalAmount.usd.toLocaleString()}`}
                            </span>
                          </div>

                          {/* Progress Bar with Impact Preview */}
                          <div className="relative">
                            <Progress
                              value={
                                fundraise.goalCurrency === 'RSC'
                                  ? fundraise.amountRaised.rsc
                                  : fundraise.amountRaised.usd
                              }
                              max={
                                fundraise.goalCurrency === 'RSC'
                                  ? fundraise.goalAmount.rsc
                                  : fundraise.goalAmount.usd
                              }
                              variant={
                                inputAmount > 0 &&
                                (fundraise.goalCurrency === 'RSC'
                                  ? fundraise.amountRaised.rsc
                                  : fundraise.amountRaised.usd) +
                                  inputAmount >=
                                  (fundraise.goalCurrency === 'RSC'
                                    ? fundraise.goalAmount.rsc
                                    : fundraise.goalAmount.usd)
                                  ? 'success'
                                  : 'default'
                              }
                              size="md"
                            />

                            {/* User's contribution impact overlay */}
                            {inputAmount > 0 && (
                              <div
                                className={`absolute top-0 h-full rounded-lg transition-all duration-300 ${
                                  (fundraise.goalCurrency === 'RSC'
                                    ? fundraise.amountRaised.rsc
                                    : fundraise.amountRaised.usd) +
                                    inputAmount >=
                                  (fundraise.goalCurrency === 'RSC'
                                    ? fundraise.goalAmount.rsc
                                    : fundraise.goalAmount.usd)
                                    ? 'bg-green-500 opacity-50'
                                    : 'bg-indigo-500 opacity-50'
                                }`}
                                style={{
                                  left: `${Math.min(100, ((fundraise.goalCurrency === 'RSC' ? fundraise.amountRaised.rsc : fundraise.amountRaised.usd) / (fundraise.goalCurrency === 'RSC' ? fundraise.goalAmount.rsc : fundraise.goalAmount.usd)) * 100)}%`,
                                  width: `${Math.min(
                                    100 -
                                      ((fundraise.goalCurrency === 'RSC'
                                        ? fundraise.amountRaised.rsc
                                        : fundraise.amountRaised.usd) /
                                        (fundraise.goalCurrency === 'RSC'
                                          ? fundraise.goalAmount.rsc
                                          : fundraise.goalAmount.usd)) *
                                        100,
                                    (inputAmount /
                                      (fundraise.goalCurrency === 'RSC'
                                        ? fundraise.goalAmount.rsc
                                        : fundraise.goalAmount.usd)) *
                                      100
                                  )}%`,
                                }}
                              />
                            )}
                          </div>

                          {/* Impact Message */}
                          {inputAmount > 0 && (
                            <p className="text-sm text-gray-600 text-center">
                              Your contribution will bring this fundraise to{' '}
                              <span
                                className={`font-medium ${
                                  (fundraise.goalCurrency === 'RSC'
                                    ? fundraise.amountRaised.rsc
                                    : fundraise.amountRaised.usd) +
                                    inputAmount >=
                                  (fundraise.goalCurrency === 'RSC'
                                    ? fundraise.goalAmount.rsc
                                    : fundraise.goalAmount.usd)
                                    ? 'text-green-700'
                                    : 'text-gray-900'
                                }`}
                              >
                                {Math.min(
                                  100,
                                  (((fundraise.goalCurrency === 'RSC'
                                    ? fundraise.amountRaised.rsc
                                    : fundraise.amountRaised.usd) +
                                    inputAmount) /
                                    (fundraise.goalCurrency === 'RSC'
                                      ? fundraise.goalAmount.rsc
                                      : fundraise.goalAmount.usd)) *
                                    100
                                ).toFixed(1)}
                                %
                              </span>{' '}
                              of its goal
                              {(fundraise.goalCurrency === 'RSC'
                                ? fundraise.amountRaised.rsc
                                : fundraise.amountRaised.usd) +
                                inputAmount >=
                                (fundraise.goalCurrency === 'RSC'
                                  ? fundraise.goalAmount.rsc
                                  : fundraise.goalAmount.usd) && (
                                <span className="text-green-700"> 🎉</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
