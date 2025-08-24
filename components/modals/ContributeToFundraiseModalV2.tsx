'use client';

import { FC, useState } from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { useUser } from '@/contexts/UserContext';
import { useCreateContribution } from '@/hooks/useFundraise';
import { X, TrendingUp, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Fundraise } from '@/types/funding';
import { CurrencyInput } from '../ui/form/CurrencyInput';
import { StripeWrapper } from '@/components/StripeWrapper';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const PROCESSING_FEE_PERCENTAGE = 0.025; // 2.5%

interface ContributeToFundraiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContributeSuccess?: () => void;
  fundraise: Fundraise;
  fundraiseTitle?: string;
}

export const ContributeToFundraiseModalV2: FC<ContributeToFundraiseModalProps> = ({
  isOpen,
  onClose,
  onContributeSuccess,
  fundraise,
  fundraiseTitle,
}) => {
  const { user } = useUser();
  const [inputAmount, setInputAmount] = useState(100);
  const [isContributing, setIsContributing] = useState(false);
  const [amountError, setAmountError] = useState<string | undefined>(undefined);
  const [currentStep, setCurrentStep] = useState<'contribute' | 'purchase'>('contribute');

  const [{ isLoading, error }, createContribution] = useCreateContribution();

  // Calculate user balance and fundraise progress
  const userBalance = user?.balance || 0;
  const lockedBalance = user?.lockedBalance || 0;
  const totalAvailableBalance = userBalance + lockedBalance;

  const goalAmount = fundraise.goalAmount.rsc;
  const amountRaised = fundraise.amountRaised.rsc;
  const progressPercentage = Math.min((amountRaised / goalAmount) * 100, 100);

  // Calculate user's impact based on the contribution amount
  const calculateUserImpact = (amount: number) => {
    if (amount === 0 || goalAmount === 0) return '0.0%';
    const impactPercentage = (amount / goalAmount) * 100;
    return `+${impactPercentage.toFixed(1)}%`;
  };

  const userImpact = calculateUserImpact(inputAmount);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numValue = parseInt(rawValue);

    if (!isNaN(numValue)) {
      setInputAmount(numValue);

      // Validate minimum amount
      if (numValue < 10) {
        setAmountError('Minimum contribution amount is 10 RSC');
      } else if (numValue > totalAvailableBalance) {
        setAmountError('Amount exceeds your available balance');
      } else {
        setAmountError(undefined);
      }
    } else {
      setInputAmount(0);
      setAmountError('Please enter a valid amount');
    }
  };

  const handleContribute = async () => {
    if (amountError || inputAmount < 10) {
      return;
    }

    try {
      setIsContributing(true);
      await createContribution(fundraise.id, { amount: inputAmount });

      toast.success('Contribution successful!');

      if (onContributeSuccess) {
        onContributeSuccess();
      }

      onClose();
    } catch (error) {
      console.error('Contribution failed:', error);
      toast.error('Failed to contribute. Please try again.');
    } finally {
      setIsContributing(false);
    }
  };

  const insufficientBalance = inputAmount > totalAvailableBalance;

  const handleBuyRSC = () => {
    setCurrentStep('purchase');
  };

  const handleBackToContribute = () => {
    setCurrentStep('contribute');
  };

  const renderHeader = () => (
    <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl p-6">
      {/* Close button - always on the right */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="absolute top-5 right-5 text-white hover:text-gray-200 hover:bg-white/10"
      >
        <X size={20} />
      </Button>

      {/* Back button - only show on second step */}
      {currentStep === 'purchase' && (
        <Button
          onClick={handleBackToContribute}
          variant="ghost"
          size="icon"
          className="absolute top-5 left-5 text-white hover:text-gray-200 hover:bg-white/10"
        >
          <ArrowLeft size={20} />
        </Button>
      )}

      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-2xl font-bold text-white mb-1">Fund Proposal</h2>
          <span className="bg-white/10 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full border border-white/20">
            RSC
          </span>
        </div>
        <p className="text-white/80 text-sm">Support cutting-edge research.</p>
      </div>

      {/* Your Balance Section */}
      <div className="mt-3 flex justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white text-center shadow-lg border border-white/20">
          <p className="text-sm text-white/80 mb-1">Your Balance</p>
          <p className="text-3xl font-bold">
            {totalAvailableBalance.toLocaleString()}{' '}
            <span className="text-white/80 text-base">RSC</span>
          </p>
        </div>
      </div>
    </div>
  );

  const renderContributeStep = () => (
    <>
      {renderHeader()}
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        {/* Proposal Details Section */}
        <div className="px-6 py-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4 leading-tight">
              {fundraiseTitle}
            </h3>

            {/* Amount to Fund Section */}
            <div className="relative mb-6">
              <CurrencyInput
                value={inputAmount.toLocaleString()}
                onChange={handleAmountChange}
                error={amountError}
                currency="RSC"
                label="Amount to Fund"
                onCurrencyToggle={() => {}}
                disableCurrencyToggle={true}
                required={true}
              />
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Funding Progress</span>
                <span className="text-sm font-semibold text-gray-900">
                  {progressPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
                {/* Preview of new progress after contribution */}
                {inputAmount > 0 && (
                  <div
                    className="absolute top-0 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-300 opacity-60"
                    style={{
                      left: `${progressPercentage}%`,
                      width: `${(inputAmount / goalAmount) * 100}%`,
                    }}
                  />
                )}
              </div>
              {inputAmount > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  +{((inputAmount / goalAmount) * 100).toFixed(1)}% with your contribution
                </p>
              )}
            </div>

            {/* Key Metrics */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <div className="text-center min-w-[80px]">
                <p className="text-2xl font-bold text-gray-900">{amountRaised.toLocaleString()}</p>
                <p className="text-sm text-gray-600">RSC Raised</p>
              </div>
              <div className="text-center min-w-[80px]">
                <p className="text-2xl font-bold text-gray-900">{goalAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-600">RSC Goal</p>
              </div>
              <div className="text-center min-w-[80px]">
                <p className="text-2xl font-bold text-green-600">{userImpact}</p>
                <p className="text-sm text-gray-600">Your Impact</p>
              </div>
            </div>

            {/* Amounts Section */}
            <div className="pt-6 border-t border-gray-100">
              <div className="space-y-3">
                {/* Funding Amount */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Funding amount</span>
                  <span className="text-sm font-medium text-gray-900">
                    {inputAmount.toLocaleString()} RSC
                  </span>
                </div>

                {/* Payment Processing Fee */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Payment processing fee</span>
                  <span className="text-sm font-medium text-gray-900">
                    {(inputAmount * PROCESSING_FEE_PERCENTAGE).toFixed(0)} RSC
                  </span>
                </div>

                {/* Total Amount */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-sm font-semibold text-gray-700">Total amount</span>
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    {(inputAmount + inputAmount * PROCESSING_FEE_PERCENTAGE).toFixed(0)} RSC
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6">
          {insufficientBalance && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-xs font-bold">!</span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">Insufficient Balance</h3>
                  <div className="mt-1 text-sm text-red-700">
                    <p>
                      You need{' '}
                      <strong>
                        {(inputAmount - totalAvailableBalance).toLocaleString()} more RSC
                      </strong>{' '}
                      to complete this contribution.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {insufficientBalance ? (
            <Button
              onClick={handleBuyRSC}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <TrendingUp size={20} />
                Buy RSC to Continue
              </div>
            </Button>
          ) : (
            <Button
              onClick={handleContribute}
              disabled={isContributing || isLoading || !!amountError || insufficientBalance}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg"
            >
              {isContributing || isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <TrendingUp size={20} />
                  Fund This Research
                </div>
              )}
            </Button>
          )}
        </div>
      </div>
    </>
  );

  const PaymentForm: React.FC<{ amount: number }> = ({ amount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!stripe || !elements) return;

      setIsProcessing(true);

      try {
        // Create PaymentIntent first
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amount,
            metadata: {
              fundraiseId: fundraise.id,
              userId: user?.id,
              rscAmount: inputAmount - totalAvailableBalance,
            },
          }),
        });

        const { clientSecret } = await response.json();

        // Confirm the payment
        const result = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/payment-result`,
          },
          redirect: 'if_required', // Only redirect for payment methods that require it
        });

        if (result.error) {
          setMessage(result.error.message || 'Payment failed');
        } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
          setMessage('Payment successful! RSC will be added to your account shortly.');
          // You could close the modal or show success state here
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } catch (error) {
        setMessage('An error occurred. Please try again.');
        console.error('Payment error:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Your Purchase</h3>
          <p className="text-sm text-gray-600 mb-6">
            You need <strong>{(inputAmount - totalAvailableBalance).toLocaleString()} RSC</strong>{' '}
            to complete your contribution.
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Amount needed:</span>
            <span className="font-medium text-gray-900">
              {(inputAmount - totalAvailableBalance).toLocaleString()} RSC
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-gray-600">Current balance:</span>
            <span className="font-medium text-gray-900">
              {totalAvailableBalance.toLocaleString()} RSC
            </span>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <PaymentElement />
        </div>

        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg disabled:opacity-50"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing Payment...
            </div>
          ) : (
            `Purchase ${(inputAmount - totalAvailableBalance).toLocaleString()} RSC`
          )}
        </Button>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.includes('successful')
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message}
          </div>
        )}
      </form>
    );
  };

  const renderPurchaseStep = () => (
    <>
      {renderHeader()}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <StripeWrapper
              options={{
                mode: 'payment',
                amount: Math.round(inputAmount - totalAvailableBalance), // Convert to cents and ensure integer
                currency: 'usd',
                paymentMethodTypes: ['card'],
              }}
            >
              <PaymentForm amount={Math.round(inputAmount - totalAvailableBalance)} />
            </StripeWrapper>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      maxWidth="max-w-lg"
      padding="p-0"
      fixedWidth={true}
    >
      {currentStep === 'contribute' ? renderContributeStep() : renderPurchaseStep()}
    </BaseModal>
  );
};
