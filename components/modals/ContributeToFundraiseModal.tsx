'use client';

import { useState, useCallback, useRef, useEffect, useMemo, type ReactNode } from 'react';
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
import { ArrowLeft, Check, MoveRight, DollarSign, Coins } from 'lucide-react';
import {
  PaymentStep,
  FundingImpactPreview,
  QuickAmountSelector,
  StripeProvider,
  useWalletAvailability,
  useAllocateFromFundingPool,
  type PaymentMethodType,
  type StripePaymentContext,
} from '@/components/Funding';
import { Input } from '@/components/ui/form/Input';
import { Button } from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/BaseModal';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import { SidePanel } from '@/components/ui/SidePanel';
import { cn } from '@/utils/styles';
import { useIsMobile } from '@/hooks/useIsMobile';
import { EndaomentProvider } from '@/contexts/EndaomentContext';
import { useNonprofitByFundraiseId } from '@/hooks/useNonprofitByFundraiseId';
import { getAvailableAndPromotionalRscBalance } from '@/components/ResearchCoin/lib/promotionalBalance';

import AuthContent from '@/components/Auth/AuthContent';

interface ContributeModalCommonProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Called after a contribution lands. In fundingPool mode, RSC and credit
   * contributions pass back the pool the API returned so the page can update
   * without a refetch; card and wallet payments settle server-side and pass nothing.
   */
  onContributeSuccess?: (updatedPool?: FundingPool) => void;
  /** Title of the proposal / RFP being funded */
  proposalTitle?: string;
  /** Work object containing author information (proposal fundraise only) */
  work?: Work;
  /** Replaces the default heading. */
  headerTitle?: string;
  /** Replaces the `proposalTitle` subtitle. */
  headerSubtitle?: string;
  /**
   * Progress figures to show instead of the fundraise's own (e.g. app/pool campaigns).
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
  /**
   * How it opens on desktop: a centred modal, or a panel that slides in from
   * the right and runs the window's full height. Phones always get the bottom
   * drawer.
   */
  desktop?: 'modal' | 'panel';
  /**
   * Amount and payment on one screen, with no Continue step in between: the
   * payment methods, fees and confirm button sit right under the amount.
   */
  singleStep?: boolean;
  /**
   * Shown at the top of the single step and its done screen, in place of the
   * title line under the heading (e.g. the RFP's cover card).
   */
  topContent?: ReactNode;
  /** Single step only: the line under "You added $X to the pool" once it lands. */
  successText?: string;
}

export type ContributeToFundraiseModalProps = ContributeModalCommonProps &
  (
    | {
        /** @default 'fundraise' */
        mode?: 'fundraise';
        fundraise: Fundraise;
        fundingPool?: never;
      }
    | {
        mode: 'fundingPool';
        fundingPool: FundingPool;
        fundraise?: never;
      }
  );

type ModalView = 'funding' | 'auth' | 'payment' | 'done';

const DEFAULT_AMOUNT_USD = 1000;

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
    desktop = 'modal',
    singleStep = false,
    topContent,
    successText,
  } = props;

  const isPoolMode = props.mode === 'fundingPool';
  const fundraise = !isPoolMode ? props.fundraise : undefined;
  const fundingPool = isPoolMode ? props.fundingPool : undefined;
  // DAF is never offered for RFP funding pools.
  const allowDafPayment = isPoolMode ? false : (props.allowDafPayment ?? true);

  const { user, refreshUser } = useUser();
  const walletAvailability = useWalletAvailability();
  const { exchangeRate } = useExchangeRate();
  const isMobile = useIsMobile();

  // Grant creators/mods can allocate from the linked RFP pool on proposal fundraises.
  const { allocateFromPool } = useAllocateFromFundingPool({
    enabled: isOpen && !isPoolMode && !!work?.linkedGrant,
    work,
    user,
  });
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
  const [amountUsd, setAmountUsd] = useState(DEFAULT_AMOUNT_USD);
  const [isContributing, setIsContributing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | undefined>(undefined);
  const [currentView, setCurrentView] = useState<ModalView>('funding');
  /** What the single step's done screen says was added. */
  const [paidUsd, setPaidUsd] = useState(0);
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(DEFAULT_AMOUNT_USD);
  const [isSliderControlled, setIsSliderControlled] = useState(false);

  // Each opening starts fresh. Resetting as it opens rather than as it closes
  // keeps the closing panel on the screen it showed (the done screen) while it
  // slides out.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setCurrentView('funding');
      setSelectedQuickAmount(DEFAULT_AMOUNT_USD);
      setAmountUsd(DEFAULT_AMOUNT_USD);
      setError(null);
      setAmountError(undefined);
      setIsSliderControlled(false);
    }
  }

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
      // On one screen, a signed-in funder sees the payment methods straight away.
      if (singleStep && user) {
        AnalyticsService.logEvent(LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_STEP, {
          ...analyticsTarget,
          amount_usd: amountUsd,
          amount_rsc: amountInRsc,
        });
      }
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
    // One screen: back to it, now with the payment methods.
    setCurrentView(singleStep ? 'funding' : 'payment');
  }, [analyticsTarget, amountUsd, amountInRsc, refreshUser, singleStep]);

  const handleClose = onClose;

  // The single step has a done screen of its own, so it skips the toast.
  const notifySuccess = useCallback(
    (message: string) => {
      if (!singleStep) toast.success(message);
    },
    [singleStep]
  );

  // Every way of paying ends here once the money has landed: the single step
  // turns to its done screen, everything else closes.
  const finishSuccess = useCallback(
    (updatedPool?: FundingPool) => {
      refreshUser?.();
      onContributeSuccess?.(updatedPool);
      if (singleStep) {
        setPaidUsd(amountUsd);
        setCurrentView('done');
      } else {
        handleClose();
      }
    },
    [refreshUser, onContributeSuccess, singleStep, amountUsd, handleClose]
  );

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

      let updatedPool: FundingPool | undefined;

      if (paymentMethod === 'funding_pool') {
        if (!allocateFromPool) {
          setError('Funding pool is not available for allocation.');
          setIsContributing(false);
          return;
        }

        const holdingRsc = allocateFromPool.fundingPool.amountHolding.rsc;
        if (amountInRsc > holdingRsc) {
          setError('Amount exceeds the funding pool balance available to allocate.');
          AnalyticsService.logEvent(LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_ERROR, {
            ...analyticsTarget,
            payment_method: paymentMethod,
            error_type: 'validation',
            error_message: 'Amount exceeds funding pool holding',
          });
          setIsContributing(false);
          return;
        }

        updatedPool = await FundingPoolService.distribute(allocateFromPool.fundingPool.id, {
          amount: amountInRsc,
          applicationId: allocateFromPool.applicationId,
        });
        notifySuccess('Allocated to proposal');
      } else if (paymentMethod === 'rsc' || paymentMethod === 'funding_credits') {
        // The backend draws from funding credits only when that payment method
        // is selected. Otherwise it draws from available and promotional RSC.
        if (isPoolMode && fundingPool) {
          updatedPool = await FundingPoolService.createContribution(fundingPool.id, {
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
        notifySuccess(contributionSuccessMessage);
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
        notifySuccess(contributionSuccessMessage);
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

      finishSuccess(updatedPool);
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

  // Calculate amounts in USD for display.
  const poolRaisedUsd = fundingPool?.amountRaised.usd ?? 0;
  const currentAmountUsd = isPoolMode
    ? poolRaisedUsd
    : (progressOverride?.currentAmountUsd ?? fundraise?.amountRaised?.usd ?? 0);
  const goalAmountUsd = isPoolMode
    ? 0
    : (progressOverride?.goalAmountUsd ?? fundraise?.goalAmount?.usd ?? 0);
  const remainingGoalUsd = Math.max(0, goalAmountUsd - currentAmountUsd);
  const quickAmountCeilingUsd = isPoolMode ? 10000 : remainingGoalUsd;

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

        notifySuccess(contributionSuccessMessage);
        finishSuccess();
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
      notifySuccess,
      finishSuccess,
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

      notifySuccess(contributionSuccessMessage);
      finishSuccess();
    },
    [
      analyticsTarget,
      amountUsd,
      amountInRsc,
      notifySuccess,
      finishSuccess,
      contributionSuccessMessage,
    ]
  );

  const defaultTitle = isPoolMode ? 'Add to the funding pool' : 'Fund Proposal';

  // Get title based on current view
  const getTitle = () => {
    switch (currentView) {
      case 'funding':
        return headerTitle ?? defaultTitle;
      case 'auth':
        return 'Sign in to continue';
      case 'payment':
        return 'Select Payment Method';
      case 'done':
        return isPoolMode ? 'Added to the pool' : 'Thank you';
      default:
        return headerTitle ?? defaultTitle;
    }
  };

  // Get subtitle - show proposal/RFP title on funding and payment screens,
  // unless the top content (the RFP's cover card) already shows it.
  const getSubtitle = () => {
    if (topContent) return undefined;
    if (currentView === 'funding' || currentView === 'payment') {
      return headerSubtitle ?? proposalTitle;
    }
    return undefined;
  };

  // Get amount display for payment widget
  const getAmountDisplay = () => {
    return formatUsd(amountUsd);
  };

  const amountFields = (
    <div className="space-y-3">
      <Input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={getFormattedInputValue()}
        onChange={handleAmountChange}
        icon={<DollarSign className="h-5 w-5 text-gray-500" />}
        error={amountError}
        // The $ in the field already says the currency.
        label={singleStep ? 'Amount' : 'Amount in USD'}
        className="text-lg"
      />
      <QuickAmountSelector
        selectedAmount={selectedQuickAmount}
        onAmountSelect={handleQuickAmountSelect}
        remainingGoalUsd={quickAmountCeilingUsd}
        showRemaining={!isPoolMode}
      />
    </div>
  );

  const paymentStep = (pinAction?: string) => (
    <PaymentStep
      amountInRsc={amountInRsc}
      amountInUsd={amountUsd}
      amountDisplay={getAmountDisplay()}
      rscBalance={rscBalance}
      fundingCreditsBalance={fundingCreditsBalance}
      allocateFromPool={allocateFromPool}
      paymentTarget={paymentTarget}
      isProcessing={isContributing}
      error={error}
      walletAvailability={walletAvailability}
      hasNonprofit={hasNonprofit}
      onConfirmPayment={handleConfirmPayment}
      onPaymentRequestSuccess={handlePaymentRequestSuccess}
      onEndaomentPaymentConfirm={handleEndaomentPaymentConfirm}
      onStripeReady={handleStripeReady}
      pinAction={pinAction}
    />
  );

  // The single step's confirm bar runs edge to edge along the bottom of its
  // container, so it takes that container's padding as its insets.
  const pinInsets = isMobile ? '-mx-4 -mb-4 px-4 pb-4' : '-mx-6 -mb-6 px-6 pb-6';

  // Render content based on current view
  const renderContent = () => {
    // "$120", with cents only when there are any.
    const paidDisplay = `$${paidUsd.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

    if (singleStep && currentView === 'done') {
      return (
        <div className="flex flex-1 flex-col">
          {topContent}
          <div className="flex flex-col items-center px-2 pt-7 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
              <Check className="h-8 w-8" strokeWidth={2.6} aria-hidden="true" />
            </span>
            <p className="mt-3.5 text-[22px] font-extrabold tracking-tight text-gray-900">
              {isPoolMode ? `You added ${paidDisplay} to the pool` : `You funded ${paidDisplay}`}
            </p>
            {successText && <p className="mt-1.5 text-sm leading-5 text-gray-600">{successText}</p>}
          </div>
          <div
            className={cn(
              'sticky bottom-0 z-10 mt-auto border-t border-gray-100 bg-white pt-4',
              pinInsets
            )}
          >
            <Button
              type="button"
              variant="default"
              className="h-12 w-full text-base"
              onClick={handleClose}
            >
              Done
            </Button>
          </div>
        </div>
      );
    }

    if (singleStep && currentView === 'funding') {
      return (
        <div className="flex flex-1 flex-col gap-6">
          {topContent}
          {amountFields}
          {user ? (
            paymentStep(pinInsets)
          ) : (
            <div
              className={cn(
                'sticky bottom-0 z-10 mt-auto border-t border-gray-100 bg-white pt-4',
                pinInsets
              )}
            >
              <Button
                type="button"
                variant="default"
                className="h-12 w-full text-base"
                onClick={() => setCurrentView('auth')}
              >
                Sign in to continue
              </Button>
            </div>
          )}
        </div>
      );
    }

    switch (currentView) {
      case 'payment':
        return paymentStep();
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
              {amountFields}

              {/* What a pool contribution does, under the amount. */}
              {isPoolMode && (
                <div className="flex gap-3 rounded-lg border border-primary-100 bg-primary-50 px-4 py-3 text-sm leading-snug text-primary-900">
                  <Coins className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />
                  <p>
                    Adding to the funding pool increases the funder’s funding budget and allows more
                    funds to be allocated towards the best research proposals.
                  </p>
                </div>
              )}

              {/* Goal progress + slider — proposal fundraises only (pool has no goal). */}
              {!isPoolMode && goalAmountUsd > 0 && (
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
    currentView === 'payment' || currentView === 'auth' ? (
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
      {/* Wraps rather than cuts off, so the whole title of what is funded shows. */}
      {subtitle && <span className="break-words text-sm text-gray-500">{subtitle}</span>}
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
              {(currentView === 'payment' || currentView === 'auth') && (
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
      ) : desktop === 'panel' ? (
        <SidePanel
          isOpen={isOpen}
          onClose={handleClose}
          widthClassName="w-full tablet:max-w-[440px]"
          title={
            <span className="flex min-w-0 items-center gap-2">
              {headerAction}
              <span className="flex min-w-0 flex-col">
                <span className="text-lg font-semibold text-gray-900">{getTitle()}</span>
                {subtitle && (
                  <span className="break-words text-sm font-normal text-gray-500">{subtitle}</span>
                )}
              </span>
            </span>
          }
        >
          <div className="flex min-h-full flex-col p-6">{renderContent()}</div>
        </SidePanel>
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
