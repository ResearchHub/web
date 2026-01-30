'use client';

import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { FundraiseService } from '@/services/fundraise.service';
import { PaymentService } from '@/services/payment.service';
import { useUser } from '@/contexts/UserContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { Fundraise } from '@/types/funding';
import { Work } from '@/types/work';
import { ArrowLeft, MoveRight, DollarSign } from 'lucide-react';
import {
  PaymentStep,
  FundingImpactPreview,
  QuickAmountSelector,
  type PaymentMethodType,
  type StripePaymentContext,
} from '@/components/Funding';
import { Input } from '@/components/ui/form/Input';
import { Button } from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/BaseModal';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import { useIsMobile } from '@/hooks/useIsMobile';

// Import inline deposit views
import { DepositRSCView } from './DepositRSCView';
import { BuyModal } from './ResearchCoin/BuyModal';

interface ContributeToFundraiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContributeSuccess?: () => void;
  fundraise: Fundraise;
  /** Title of the proposal being funded */
  proposalTitle?: string;
  /** Work object containing author information */
  work?: Work;
}

type ModalView = 'funding' | 'payment' | 'deposit-rsc';

export function ContributeToFundraiseModal({
  isOpen,
  onClose,
  onContributeSuccess,
  fundraise,
  proposalTitle,
  work,
}: ContributeToFundraiseModalProps) {
  const { user, refreshUser } = useUser();
  const { exchangeRate } = useExchangeRate();
  const isMobile = useIsMobile();
  const [amountUsd, setAmountUsd] = useState(100);
  const [isContributing, setIsContributing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | undefined>(undefined);
  const [currentView, setCurrentView] = useState<ModalView>('funding');
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(100);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSliderControlled, setIsSliderControlled] = useState(false);

  // Store Stripe context for credit card payments
  const stripeContextRef = useRef<StripePaymentContext | null>(null);

  // Handle Stripe context updates from CreditCardForm
  const handleStripeReady = useCallback((context: StripePaymentContext | null) => {
    stripeContextRef.current = context;
  }, []);

  // Get balance from user fields
  // Use totalRsc since users can use both available RSC and funding credits for funding
  const rscBalance = user?.totalRsc ?? 0;

  // Calculate conversions
  const rscToUsd = (rsc: number) => (exchangeRate ? rsc * exchangeRate : 0);
  const usdToRsc = (usd: number) => (exchangeRate ? usd / exchangeRate : 0);

  // Get amount in RSC (derived from USD amount)
  const amountInRsc = usdToRsc(amountUsd);

  const minAmountUsd = 1;

  // Format helpers
  const formatUsd = (amount: number) => {
    return `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Handlers
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    const numValue = parseFloat(rawValue);

    if (!isNaN(numValue)) {
      setAmountUsd(numValue);
      setSelectedQuickAmount(null);
      setIsSliderControlled(false); // Input sets scaled visual mode

      if (numValue < minAmountUsd) {
        setAmountError(`Minimum contribution is $${minAmountUsd}`);
      } else {
        setAmountError(undefined);
      }
    } else {
      setAmountUsd(0);
      setAmountError('Please enter a valid amount');
    }
  };

  const getFormattedInputValue = () => {
    if (amountUsd === 0) return '';
    return amountUsd.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const handleDepositSuccess = useCallback(() => {
    refreshUser?.();
    setCurrentView('payment');
  }, [refreshUser]);

  const handleContinueToPayment = useCallback(() => {
    setCurrentView('payment');
  }, []);

  const handleConfirmPayment = async (paymentMethod: Exclude<PaymentMethodType, 'endaoment'>) => {
    try {
      if (amountUsd < minAmountUsd) {
        setError(`Minimum contribution is $${minAmountUsd}`);
        return;
      }

      setIsContributing(true);
      setError(null);

      if (paymentMethod === 'rsc') {
        // Direct RSC payment from user's balance
        await FundraiseService.contributeToFundraise(fundraise.id, amountInRsc, 'rsc');
        toast.success('Your contribution has been successfully added to the fundraise.');
      } else if (paymentMethod === 'credit_card') {
        // Credit card payment flow:
        // 1. Create payment intent (backend adds fees)
        // 2. Confirm payment with Stripe
        // 3. On success, create contribution

        const stripeContext = stripeContextRef.current;
        if (!stripeContext) {
          setError('Payment form is not ready. Please try again.');
          setIsContributing(false);
          return;
        }

        const { stripe, cardElement } = stripeContext;

        // Step 1: Create payment intent with amount and fundraise ID (backend adds fees and handles contribution)
        const { clientSecret } = await PaymentService.createPaymentIntent(
          amountInRsc,
          fundraise.id
        );

        // Step 2: Confirm payment with Stripe
        const { error: stripeError, paymentIntent: stripePaymentIntent } =
          await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: cardElement,
            },
          });

        if (stripeError) {
          setError(
            'We had an issue processing your credit card. Choose a different payment method.'
          );
          setIsContributing(false);
          return;
        }

        if (stripePaymentIntent?.status !== 'succeeded') {
          setError(
            'We had an issue processing your credit card. Choose a different payment method.'
          );
          setIsContributing(false);
          return;
        }

        // Payment succeeded - backend handles contribution automatically
        toast.success('Your contribution has been successfully added to the fundraise.');
      } else if (paymentMethod === 'paypal') {
        // PayPal not yet implemented
        toast.error('PayPal is not yet available. Please use Credit Card or ResearchCoin.');
        setIsContributing(false);
        return;
      }
      // Note: apple_pay and google_pay are handled by PaymentRequestButton

      // Refresh user data to update balance
      refreshUser?.();

      if (onContributeSuccess) {
        onContributeSuccess();
      }

      handleClose();
    } catch (err) {
      console.error('Failed to contribute to fundraise:', err);
      if (paymentMethod === 'credit_card') {
        setError('We had an issue processing your credit card. Choose a different payment method.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsContributing(false);
    }
  };

  const handleOpenDeposit = useCallback(() => {
    setCurrentView('deposit-rsc');
  }, []);

  const handleBuyRsc = useCallback(() => {
    setIsBuyModalOpen(true);
  }, []);

  // Handle quick amount selection
  const handleQuickAmountSelect = useCallback((amount: number) => {
    setSelectedQuickAmount(amount);
    setAmountUsd(amount);
    setAmountError(undefined);
    setIsSliderControlled(false); // Quick buttons set scaled visual mode
  }, []);

  // Calculate amounts in USD for display
  const currentAmountUsd = fundraise.amountRaised?.usd ?? 0;
  const goalAmountUsd = fundraise.goalAmount?.usd ?? 0;
  const remainingGoalUsd = Math.max(0, goalAmountUsd - currentAmountUsd);

  const handleBack = useCallback(() => {
    if (currentView === 'deposit-rsc') {
      setCurrentView('payment');
    } else if (currentView === 'payment') {
      setCurrentView('funding');
    }
  }, [currentView]);

  const handleClose = useCallback(() => {
    setCurrentView('funding');
    setSelectedQuickAmount(100);
    setAmountUsd(100);
    setError(null);
    setAmountError(undefined);
    setIsSliderControlled(false);
    onClose();
  }, [onClose]);

  // Handle Apple Pay / Google Pay success
  const handlePaymentRequestSuccess = useCallback(() => {
    toast.success('Your contribution has been successfully added to the fundraise.');
    refreshUser?.();
    if (onContributeSuccess) {
      onContributeSuccess();
    }
    handleClose();
  }, [refreshUser, onContributeSuccess, handleClose]);

  // Get title based on current view
  const getTitle = () => {
    switch (currentView) {
      case 'funding':
        return 'Fund Proposal';
      case 'payment':
        return 'Select Payment Method';
      case 'deposit-rsc':
        return 'Deposit RSC';
      default:
        return 'Fund Proposal';
    }
  };

  // Get subtitle - show proposal title on funding and payment screens
  const getSubtitle = () => {
    if (currentView === 'funding' || currentView === 'payment') {
      return proposalTitle;
    }
    return undefined;
  };

  // Get amount display for payment widget
  const getAmountDisplay = () => {
    return formatUsd(amountUsd);
  };

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'deposit-rsc':
        return <DepositRSCView currentBalance={rscBalance} onSuccess={handleDepositSuccess} />;

      case 'payment':
        return (
          <PaymentStep
            amountInRsc={amountInRsc}
            amountInUsd={amountUsd}
            amountDisplay={getAmountDisplay()}
            rscBalance={rscBalance}
            fundraiseId={fundraise.id}
            isProcessing={isContributing}
            error={error}
            onConfirmPayment={handleConfirmPayment}
            onPaymentRequestSuccess={handlePaymentRequestSuccess}
            onDepositRsc={handleOpenDeposit}
            onBuyRsc={handleBuyRsc}
            onStripeReady={handleStripeReady}
          />
        );

      case 'funding':
      default:
        return (
          <div className="flex flex-col h-full">
            {/* Content area */}
            <div className="space-y-10 flex-1">
              {/* Amount Input + Quick Amount Selector grouped together */}
              <div className="space-y-3">
                <Input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={getFormattedInputValue()}
                  onChange={handleAmountChange}
                  icon={<DollarSign className="h-5 w-5 text-gray-500" />}
                  error={amountError}
                  label="Funding amount"
                  className="text-lg"
                />

                {/* Quick Amount Selector */}
                <QuickAmountSelector
                  selectedAmount={selectedQuickAmount}
                  onAmountSelect={handleQuickAmountSelect}
                  remainingGoalUsd={remainingGoalUsd}
                />
              </div>

              {/* Funding Impact Preview with Slider */}
              {goalAmountUsd > 0 && (
                <FundingImpactPreview
                  currentAmountUsd={currentAmountUsd}
                  goalAmountUsd={goalAmountUsd}
                  previewAmountUsd={amountUsd}
                  isSliderControlled={isSliderControlled}
                  onAmountChange={(amount) => {
                    setAmountUsd(amount);
                    setSelectedQuickAmount(null);
                    setAmountError(undefined);
                    setIsSliderControlled(true); // Slider sets linear visual mode
                  }}
                  authors={work?.authors.map((a) => a.authorProfile)}
                />
              )}
            </div>

            {/* Continue to Payment Button - pinned to bottom */}
            <div className="pt-6">
              <Button
                type="button"
                variant="default"
                disabled={amountUsd < minAmountUsd || !!amountError}
                className="w-full h-12 text-base"
                onClick={handleContinueToPayment}
              >
                Continue to Payment
                <MoveRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        );
    }
  };

  // Back button for header
  const headerAction =
    currentView !== 'funding' ? (
      <button
        type="button"
        className="p-1 -ml-1 text-gray-400 hover:text-gray-600 transition-colors"
        onClick={handleBack}
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
    ) : undefined;

  // Custom title element with optional subtitle
  const subtitle = getSubtitle();
  const modalTitle = (
    <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
      <span className="text-lg font-semibold text-gray-900">{getTitle()}</span>
      {subtitle && <span className="text-sm text-gray-500 truncate">{subtitle}</span>}
    </div>
  );

  return (
    <>
      {isMobile ? (
        <SwipeableDrawer isOpen={isOpen} onClose={handleClose} height="70vh" showCloseButton={true}>
          <div className="flex flex-col h-full">
            {/* Header with back button and title */}
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-200">
              {currentView !== 'funding' && (
                <button
                  type="button"
                  className="p-1 -ml-1 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              {modalTitle}
            </div>
            <div className="flex-1 flex flex-col">{renderContent()}</div>
          </div>
        </SwipeableDrawer>
      ) : (
        <BaseModal
          isOpen={isOpen}
          onClose={handleClose}
          title={modalTitle}
          maxWidth="max-w-md"
          headerAction={headerAction}
          className="md:min-w-[400px]"
        >
          {renderContent()}
        </BaseModal>
      )}

      {/* Buy RSC Modal */}
      <BuyModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} />
    </>
  );
}
