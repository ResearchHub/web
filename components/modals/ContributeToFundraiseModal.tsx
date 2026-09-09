'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { FundraiseService } from '@/services/fundraise.service';
import { FundingPoolService } from '@/services/funding-pool.service';
import { PaymentService, type PaymentIntentTarget } from '@/services/payment.service';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { useUser } from '@/contexts/UserContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { Fundraise } from '@/types/funding';
import { FundingPool } from '@/types/grant';
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
import { EndaomentProvider } from '@/contexts/EndaomentContext';
import { useNonprofitByFundraiseId } from '@/hooks/useNonprofitByFundraiseId';
import { getAvailableAndPromotionalRscBalance } from '@/components/ResearchCoin/lib/promotionalBalance';

import AuthContent from '@/components/Auth/AuthContent';

interface ContributeModalCommonProps {
  isOpen: boolean;
  onClose: () => void;
  onContributeSuccess?: () => void;
  /** Title of the proposal / RFP being funded */
  proposalTitle?: string;
  /** Work object containing author information (proposal fundraise only) */
  work?: Work;
  /** Replaces the default heading. */
  headerTitle?: string;
  /** Replaces the `proposalTitle` subtitle. */
  headerSubtitle?: string;
  /**
   * Progress figures to show instead of the target's own. Pooled campaigns
   * contribute to one fundraise but present the pool's totals, since that's
   * the goal the funder is actually backing.
   */
  progressOverride?: { currentAmountUsd: number; goalAmountUsd: number };
  /**
   * Whether to offer the Endaoment donor-advised fund option. Forced off in
   * fundingPool mode (RSC / credits / card / Apple Pay only).
   */
  allowDafPayment?: boolean;
  /** Replaces the default contribution success toast. */
  successMessage?: string;
  /**
   * Upper bound on the contribution, in USD. Unset leaves the amount
   * unbounded, which is how single-proposal funding behaves.
   */
  maxAmountUsd?: number;
}

export type ContributeToFundraiseModalProps = ContributeModalCommonProps &
  (
    | {
        /** @default 'fundraise' */
        mode?: 'fundraise';
        fundraise: Fundraise;
        fundingPool?: never;
        grantAmount?: never;
      }
    | {
        mode: 'fundingPool';
        fundingPool: FundingPool;
        grantAmount: { usd: number };
        fundraise?: never;
      }
  );

type ModalView = 'funding' | 'auth' | 'payment';

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

  const inner = <ContributeToFundraiseModalInner {...props} />;

  return (
    <StripeProvider>
      <EndaomentProvider>{inner}</EndaomentProvider>
    </StripeProvider>
  );
}

function ContributeToFundraiseModalInner(props: Readonly<ContributeToFundraiseModalProps>) {
  const {
    isOpen,
    onClose,
    onContributeSuccess,
    proposalTitle,
    work,
    headerTitle,
    headerSubtitle,
    progressOverride,
    successMessage,
    maxAmountUsd,
  } = props;

  const isPoolMode = props.mode === 'fundingPool';
  const fundraise = !isPoolMode ? props.fundraise : undefined;
  const fundingPool = isPoolMode ? props.fundingPool : undefined;
  const grantAmount = isPoolMode ? props.grantAmount : undefined;
  // DAF is never offered for RFP funding pools.
  const allowDafPayment = isPoolMode ? false : (props.allowDafPayment ?? true);

  const { user, refreshUser } = useUser();
  const walletAvailability = useWalletAvailability();
  const { exchangeRate } = useExchangeRate();
  const isMobile = useIsMobile();
  // Skipping the id entirely when DAF is off avoids the hook's nonprofit-link
  // and EIN-search round trips on every open.
  const { nonprofit } = useNonprofitByFundraiseId(
    allowDafPayment && fundraise ? fundraise.id : undefined
  );
  const hasNonprofit = allowDafPayment && nonprofit !== null;
  const contributionSuccessMessage =
    successMessage ??
    (isPoolMode
      ? 'Your contribution has been added to the RFP funding pool.'
      : 'Your contribution has been successfully added to the fundraise.');
  const [amountUsd, setAmountUsd] = useState(100);
  const [isContributing, setIsContributing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | undefined>(undefined);
  const [currentView, setCurrentView] = useState<ModalView>('funding');
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(100);
  const [isSliderControlled, setIsSliderControlled] = useState(false);

  // Store Stripe context for credit card payments
  const stripeContextRef = useRef<StripePaymentContext | null>(null);

  const paymentTarget: PaymentIntentTarget = useMemo(() => {
    if (isPoolMode && fundingPool) {
      return { fundingPoolId: fundingPool.id };
    }
    return { fundraiseId: fundraise!.id };
  }, [isPoolMode, fundingPool, fundraise]);

  const analyticsTarget = useMemo(() => {
    if (isPoolMode && fundingPool) {
      return { funding_pool_id: fundingPool.id };
    }
    return { fundraise_id: fundraise!.id };
  }, [isPoolMode, fundingPool, fundraise]);

  // Handle Stripe context updates from CreditCardForm
  const handleStripeReady = useCallback((context: StripePaymentContext | null) => {
    stripeContextRef.current = context;
  }, []);

  // ResearchCoin available for funding includes withdrawable and promotional RSC.
  const rscBalance = getAvailableAndPromotionalRscBalance(user);
  // Funding credits are a separate payment pool from promotional RSC.
  const fundingCreditsBalance = user?.fundingCredits ?? 0;

  // Calculate conversions
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
      } else if (maxAmountUsd != null && numValue > maxAmountUsd) {
        setAmountError(
          `Maximum contribution is $${maxAmountUsd.toLocaleString('en-US', {
            maximumFractionDigits: 0,
          })}`
        );
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

  // Track when modal/drawer opens
  useEffect(() => {
    if (isOpen) {
      AnalyticsService.logEvent(LogEvent.FUNDRAISE_CONTRIBUTION_AMOUNT_STEP, {
        ...analyticsTarget,
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
        ...analyticsTarget,
        amount_usd: amountUsd,
        amount_rsc: amountInRsc,
      });
      setCurrentView('payment');
    }
  }, [user, analyticsTarget, amountUsd, amountInRsc]);

  const handleAuthSuccess = useCallback(async () => {
    AnalyticsService.logEvent(LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_STEP, {
      ...analyticsTarget,
      amount_usd: amountUsd,
      amount_rsc: amountInRsc,
    });
    refreshUser?.();
    setCurrentView('payment');
  }, [analyticsTarget, amountUsd, amountInRsc, refreshUser]);

  const handleClose = useCallback(() => {
    setCurrentView('funding');
    setSelectedQuickAmount(100);
    setAmountUsd(100);
    setError(null);
    setAmountError(undefined);
    setIsSliderControlled(false);
    onClose();
  }, [onClose]);

  const handleConfirmPayment = async (paymentMethod: Exclude<PaymentMethodType, 'endaoment'>) => {
    try {
      if (amountUsd < minAmountUsd) {
        setError(`Minimum contribution is $${minAmountUsd}`);
        AnalyticsService.logEvent(LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_ERROR, {
          ...analyticsTarget,
          payment_method: paymentMethod,
          error_type: 'validation',
          error_message: 'Amount below minimum',
        });
        return;
      }

      if (maxAmountUsd != null && amountUsd > maxAmountUsd) {
        setError(
          `Maximum contribution is $${maxAmountUsd.toLocaleString('en-US', {
            maximumFractionDigits: 0,
          })}`
        );
        AnalyticsService.logEvent(LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_ERROR, {
          ...analyticsTarget,
          payment_method: paymentMethod,
          error_type: 'validation',
          error_message: 'Amount above maximum',
        });
        return;
      }

      setIsContributing(true);
      setError(null);

      if (paymentMethod === 'rsc' || paymentMethod === 'funding_credits') {
        // The backend draws from funding credits only when that payment method
        // is selected. Otherwise it draws from available and promotional RSC.
        if (isPoolMode && fundingPool) {
          await FundingPoolService.createContribution(fundingPool.id, {
            amount: amountInRsc,
            useCredits: paymentMethod === 'funding_credits',
          });
        } else if (fundraise) {
          await FundraiseService.contributeToFundraise(
            fundraise.id,
            amountInRsc,
            'rsc',
            paymentMethod === 'funding_credits'
          );
        }
        toast.success(contributionSuccessMessage);
      } else if (paymentMethod === 'credit_card') {
        // Credit card payment flow:
        // 1. Create payment intent (backend adds fees)
        // 2. Confirm payment with Stripe
        // 3. On success, create contribution

        const stripeContext = stripeContextRef.current;
        if (!stripeContext) {
          setError('Payment form is not ready. Please try again.');
          AnalyticsService.logEvent(LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_ERROR, {
            ...analyticsTarget,
            payment_method: paymentMethod,
            error_type: 'stripe',
            error_message: 'Payment form not ready',
          });
          setIsContributing(false);
          return;
        }

        const { stripe, cardElement } = stripeContext;

        // Step 1: Create payment intent (backend adds fees and handles contribution)
        const { clientSecret } = await PaymentService.createPaymentIntent(
          amountInRsc,
          paymentTarget
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
            ...analyticsTarget,
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
            ...analyticsTarget,
            payment_method: paymentMethod,
            error_type: 'stripe',
            error_message: 'Payment not succeeded',
          });
          setIsContributing(false);
          return;
        }

        // Payment succeeded - backend handles contribution automatically
        toast.success(contributionSuccessMessage);
      } else if (paymentMethod === 'paypal') {
        // PayPal not yet implemented
        toast.error('PayPal is not yet available. Please use Credit Card or ResearchCoin.');
        setIsContributing(false);
        return;
      }
      // Note: apple_pay and google_pay are handled by PaymentRequestButton

      // Track successful payment
      AnalyticsService.logEvent(LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_SUCCESSFUL, {
        ...analyticsTarget,
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
      console.error('Failed to contribute:', err);
      AnalyticsService.logEvent(LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_ERROR, {
        ...analyticsTarget,
        payment_method: paymentMethod,
        error_type: 'api',
        error_message: 'Request failed',
      });
      if (paymentMethod === 'credit_card') {
        setError('We had an issue processing your credit card. Choose a different payment method.');
      } else {
        setError(extractApiErrorMessage(err, 'Something went wrong. Please try again.'));
      }
    } finally {
      setIsContributing(false);
    }
  };

  // Handle quick amount selection
  const handleQuickAmountSelect = useCallback((amount: number) => {
    setSelectedQuickAmount(amount);
    setAmountUsd(amount);
    setAmountError(undefined);
    setIsSliderControlled(false); // Quick buttons set scaled visual mode
  }, []);

  // Calculate amounts in USD for display
  const currentAmountUsd = isPoolMode
    ? (progressOverride?.currentAmountUsd ?? fundingPool?.amountRaised.usd ?? 0)
    : (progressOverride?.currentAmountUsd ?? fundraise?.amountRaised?.usd ?? 0);
  const goalAmountUsd = isPoolMode
    ? (progressOverride?.goalAmountUsd ?? grantAmount?.usd ?? 0)
    : (progressOverride?.goalAmountUsd ?? fundraise?.goalAmount?.usd ?? 0);
  const remainingGoalUsd = Math.max(0, goalAmountUsd - currentAmountUsd);
  const quickAmountCeilingUsd = isPoolMode && remainingGoalUsd <= 0 ? 10000 : remainingGoalUsd;

  const handleBack = useCallback(() => {
    if (currentView === 'payment' || currentView === 'auth') {
      setCurrentView('funding');
    }
  }, [currentView]);

  const handleEndaomentPaymentConfirm = useCallback(
    async (originFundId: string) => {
      if (!fundraise) return;

      try {
        setIsContributing(true);
        setError(null);

        await FundraiseService.createEndaomentContribution(
          fundraise.id,
          originFundId,
          Math.round(amountUsd * 100) // must be in cents
        );

        // Track successful payment
        AnalyticsService.logEvent(LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_SUCCESSFUL, {
          ...analyticsTarget,
          payment_method: 'endaoment',
          amount_usd: amountUsd,
          amount_rsc: amountInRsc,
        });

        toast.success(contributionSuccessMessage);
        refreshUser?.();
        if (onContributeSuccess) {
          onContributeSuccess();
        }
        handleClose();
      } catch (err) {
        console.error('Failed to contribute via Endaoment:', err);
        AnalyticsService.logEvent(LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_ERROR, {
          ...analyticsTarget,
          payment_method: 'endaoment',
          error_type: 'api',
          error_message: 'Request failed',
        });
        setError('Something went wrong with your Endaoment payment. Please try again.');
      } finally {
        setIsContributing(false);
      }
    },
    [
      fundraise,
      analyticsTarget,
      amountUsd,
      amountInRsc,
      refreshUser,
      onContributeSuccess,
      handleClose,
      contributionSuccessMessage,
    ]
  );

  // Handle Apple Pay / Google Pay success
  const handlePaymentRequestSuccess = useCallback(
    (paymentMethod?: 'apple_pay' | 'google_pay') => {
      // Track successful payment
      AnalyticsService.logEvent(LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_SUCCESSFUL, {
        ...analyticsTarget,
        payment_method: paymentMethod || 'payment_request',
        amount_usd: amountUsd,
        amount_rsc: amountInRsc,
      });

      toast.success(contributionSuccessMessage);
      refreshUser?.();
      if (onContributeSuccess) {
        onContributeSuccess();
      }
      handleClose();
    },
    [
      analyticsTarget,
      amountUsd,
      amountInRsc,
      refreshUser,
      onContributeSuccess,
      handleClose,
      contributionSuccessMessage,
    ]
  );

  const defaultTitle = isPoolMode ? 'Contribute to RFP' : 'Fund Proposal';

  // Get title based on current view
  const getTitle = () => {
    switch (currentView) {
      case 'funding':
        return headerTitle ?? defaultTitle;
      case 'auth':
        return 'Sign in to continue';
      case 'payment':
        return 'Select Payment Method';
      default:
        return headerTitle ?? defaultTitle;
    }
  };

  // Get subtitle - show proposal/RFP title on funding and payment screens
  const getSubtitle = () => {
    if (currentView === 'funding' || currentView === 'payment') {
      return headerSubtitle ?? proposalTitle;
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
      case 'payment':
        return (
          <PaymentStep
            amountInRsc={amountInRsc}
            amountInUsd={amountUsd}
            amountDisplay={getAmountDisplay()}
            rscBalance={rscBalance}
            fundingCreditsBalance={fundingCreditsBalance}
            paymentTarget={paymentTarget}
            isProcessing={isContributing}
            error={error}
            walletAvailability={walletAvailability}
            hasNonprofit={hasNonprofit}
            onConfirmPayment={handleConfirmPayment}
            onPaymentRequestSuccess={handlePaymentRequestSuccess}
            onEndaomentPaymentConfirm={handleEndaomentPaymentConfirm}
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
                  remainingGoalUsd={quickAmountCeilingUsd}
                  showRemaining={!isPoolMode || remainingGoalUsd > 0}
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
                  authors={isPoolMode ? undefined : work?.authors.map((a) => a.authorProfile)}
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
    </>
  );
}
