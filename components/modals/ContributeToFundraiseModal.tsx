'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FundraiseService } from '@/services/fundraise.service';
import { PaymentService } from '@/services/payment.service';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { useUser } from '@/contexts/UserContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { Fundraise } from '@/types/funding';
import { Work } from '@/types/work';
import { ArrowLeft, MoveRight, DollarSign } from 'lucide-react';
import {
  PaymentStep,
  FundingImpactPreview,
  QuickAmountSelector,
  StripeProvider,
  useWalletAvailability,
  type PaymentMethodType,
  type StripePaymentContext,
} from '@/components/Funding';
import { Input } from '@/components/ui/form/Input';
import { Button } from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/BaseModal';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import { useIsMobile } from '@/hooks/useIsMobile';
import { CurrencyInput } from '@/components/ui/form/CurrencyInput';

// Import inline deposit views
import { DepositRSCView } from './DepositRSCView';
import { BuyModal } from './ResearchCoin/BuyModal';
import AuthContent from '@/components/Auth/AuthContent';
import { UserService } from '@/services/user.service';

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

type ModalView = 'funding' | 'auth' | 'payment' | 'deposit-rsc';

/**
 * Outer wrapper that lazily provides StripeProvider context.
 *
 * StripeProvider (and Stripe.js) are only mounted the first time the modal
 * opens. Once mounted, they stay mounted so the wallet availability check
 * persists across open/close cycles and exit animations still work.
 *
 * This prevents unnecessary Stripe.js loading and API calls on pages
 * where the modal is rendered but never opened.
 */
export function ContributeToFundraiseModal(props: ContributeToFundraiseModalProps) {
  // Track whether the modal has been opened at least once.
  // Using a ref for the flag (no extra render) and state to trigger the
  // initial mount when isOpen first becomes true.
  const hasBeenOpenedRef = useRef(false);
  const [mountStripe, setMountStripe] = useState(false);

  if (props.isOpen && !hasBeenOpenedRef.current) {
    hasBeenOpenedRef.current = true;
    if (!mountStripe) setMountStripe(true);
  }

  // Before modal has ever been opened, render nothing.
  // BaseModal/SwipeableDrawer aren't needed when isOpen has never been true.
  if (!mountStripe) return null;

  return (
    <StripeProvider>
      <ContributeToFundraiseModalInner {...props} />
    </StripeProvider>
  );
}

function ContributeToFundraiseModalInner({
  isOpen,
  onClose,
  onContributeSuccess,
  fundraise,
  proposalTitle,
  work,
}: ContributeToFundraiseModalProps) {
  const { user, refreshUser } = useUser();
  const walletAvailability = useWalletAvailability();
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

  const handleCurrencyToggle = () => {
    // Only USD supported here
  };

  const handleDepositSuccess = useCallback(() => {
    refreshUser?.();
    setCurrentView('payment');
  }, [refreshUser]);

  // Track when modal/drawer opens
  useEffect(() => {
    if (isOpen) {
      AnalyticsService.logEvent(LogEvent.FUNDRAISE_CONTRIBUTION_AMOUNT_STEP, {
        fundraise_id: fundraise.id,
        amount_usd: amountUsd,
        amount_rsc: amountInRsc,
      });
    }
    // Only fire when isOpen changes to true, not when amounts change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleContinueToPayment = useCallback(() => {
    if (!user) {
      setCurrentView('auth');
    } else {
      // Track funnel step: user reached payment step
      AnalyticsService.logEvent(LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_STEP, {
        fundraise_id: fundraise.id,
        amount_usd: amountUsd,
        amount_rsc: amountInRsc,
      });
      setCurrentView('payment');
    }
  }, [user, fundraise.id, amountUsd, amountInRsc]);

  const handleAuthSuccess = useCallback(async () => {
    // Skip onboarding for users who sign up through the fundraise flow
    await UserService.setCompletedOnboarding();

    // Track funnel step: user reached payment step after auth
    AnalyticsService.logEvent(LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_STEP, {
      fundraise_id: fundraise.id,
      amount_usd: amountUsd,
      amount_rsc: amountInRsc,
    });
    refreshUser?.();
    setCurrentView('payment');
  }, [fundraise.id, amountUsd, amountInRsc, refreshUser]);

  const handleConfirmPayment = async (paymentMethod: Exclude<PaymentMethodType, 'endaoment'>) => {
    try {
      if (amountUsd < minAmountUsd) {
        setError(`Minimum contribution is $${minAmountUsd}`);
        AnalyticsService.logEvent(LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_ERROR, {
          fundraise_id: fundraise.id,
          payment_method: paymentMethod,
          error_type: 'validation',
          error_message: 'Amount below minimum',
        });
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
          AnalyticsService.logEvent(LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_ERROR, {
            fundraise_id: fundraise.id,
            payment_method: paymentMethod,
            error_type: 'stripe',
            error_message: 'Payment form not ready',
          });
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
          AnalyticsService.logEvent(LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_ERROR, {
            fundraise_id: fundraise.id,
            payment_method: paymentMethod,
            error_type: 'stripe',
            error_message: 'Card payment failed',
          });
          setIsContributing(false);
          return;
        }

        if (stripePaymentIntent?.status !== 'succeeded') {
          setError(
            'We had an issue processing your credit card. Choose a different payment method.'
          );
          AnalyticsService.logEvent(LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_ERROR, {
            fundraise_id: fundraise.id,
            payment_method: paymentMethod,
            error_type: 'stripe',
            error_message: 'Payment not succeeded',
          });
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

      // Track successful payment
      AnalyticsService.logEvent(LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_SUCCESSFUL, {
        fundraise_id: fundraise.id,
        payment_method: paymentMethod,
        amount_usd: amountUsd,
        amount_rsc: amountInRsc,
      });

      // Refresh user data to update balance
      refreshUser?.();

      if (onContributeSuccess) {
        onContributeSuccess();
      }

      handleClose();
    } catch (err) {
      console.error('Failed to contribute to fundraise:', err);
      AnalyticsService.logEvent(LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_ERROR, {
        fundraise_id: fundraise.id,
        payment_method: paymentMethod,
        error_type: 'api',
        error_message: 'Request failed',
      });
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
    } else if (currentView === 'payment' || currentView === 'auth') {
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
  const handlePaymentRequestSuccess = useCallback(
    (paymentMethod?: 'apple_pay' | 'google_pay') => {
      // Track successful payment
      AnalyticsService.logEvent(LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_SUCCESSFUL, {
        fundraise_id: fundraise.id,
        payment_method: paymentMethod || 'payment_request',
        amount_usd: amountUsd,
        amount_rsc: amountInRsc,
      });

      toast.success('Your contribution has been successfully added to the fundraise.');
      refreshUser?.();
      if (onContributeSuccess) {
        onContributeSuccess();
      }
      handleClose();
    },
    [fundraise.id, amountUsd, amountInRsc, refreshUser, onContributeSuccess, handleClose]
  );

  // Get title based on current view
  const getTitle = () => {
    switch (currentView) {
      case 'funding':
        return 'Fund Proposal';
      case 'auth':
        return 'Sign in to continue';
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
            walletAvailability={walletAvailability}
            onConfirmPayment={handleConfirmPayment}
            onPaymentRequestSuccess={handlePaymentRequestSuccess}
            onDepositRsc={handleOpenDeposit}
            onBuyRsc={handleBuyRsc}
            onStripeReady={handleStripeReady}
          />
        );

      case 'auth':
        return (
          <AuthContent
            onSuccess={handleAuthSuccess}
            modalView={true}
            showHeader={false}
            callbackUrl={typeof window !== 'undefined' ? window.location.href : undefined}
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
                <CurrencyInput
                  value={getFormattedInputValue()}
                  onChange={handleAmountChange}
                  currency="USD"
                  onCurrencyToggle={handleCurrencyToggle}
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
                    // Auto-select "Remaining" button if slider is at the end
                    if (amount === Math.round(remainingGoalUsd)) {
                      setSelectedQuickAmount(amount);
                    } else {
                      setSelectedQuickAmount(null);
                    }
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
        <SwipeableDrawer
          isOpen={isOpen}
          onClose={handleClose}
          height="72vh"
          showCloseButton={true}
          header={
            <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
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
          }
        >
          <div className="flex flex-col h-full">
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
