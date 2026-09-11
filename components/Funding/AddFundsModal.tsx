'use client';

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { ArrowLeft, ArrowRight, ArrowUpRight, DollarSign, Landmark, MoveRight } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuildingColumns, faCreditCard } from '@fortawesome/pro-light-svg-icons';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Input } from '@/components/ui/form/Input';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { DepositRscPanel } from '@/components/modals/ResearchCoin/DepositRscPanel';
import { useAuthModalContext } from '@/contexts/AuthModalContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useUser } from '@/contexts/UserContext';
import AnalyticsService from '@/services/analytics.service';
import { FUNDING_CREDITS_TARGET } from '@/services/payment.service';
import { cn } from '@/utils/styles';
import { PaymentStep } from './PaymentStep';
import { QuickAmountSelector } from './QuickAmountSelector';
import { StripeProvider } from './StripeProvider';
import type { StripePaymentContext } from './CreditCardForm';
import {
  CARD_PAYMENT_ERROR_MESSAGE,
  confirmCardPayment,
  getPaymentFunnelEvents,
  paymentTargetAnalyticsProps,
  useUsdAmount,
  useWalletAvailability,
  type PaymentMethodType,
} from './lib';

const TALK_TO_TEAM_URL = 'https://cal.com/tyler-diorio/15min';
const PROPOSALS_URL = '/fund/proposals';
/** Single-purchase ceiling; matches the RFP pool contribution quick amounts. */
const MAX_CREDITS_PURCHASE_USD = 10000;

type FundingMethodId = 'cash' | 'crypto' | 'daf';
type CashStep = 'amount' | 'payment';
type View = 'picker' | 'cash' | 'cashPayment' | 'crypto' | 'daf';

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Reopens this modal after an interruption, currently only signing in. */
  onReopen: () => void;
}

interface FundingMethod {
  id: FundingMethodId;
  title: string;
  /** What choosing the tile actually does, so "Cash" reads as a purchase. */
  description: string;
  icon: ReactNode;
  /** Tile tint drawn from the icon's own palette so each option reads as one colour. */
  tileClassName: string;
}

const METHODS: FundingMethod[] = [
  {
    id: 'cash',
    title: 'Cash',
    description: 'Buy funding credits',
    icon: <FontAwesomeIcon icon={faCreditCard} className="h-6 w-6" />,
    tileClassName:
      'border-primary-200 bg-white text-primary-700 hover:border-primary-300 hover:bg-primary-50 focus-visible:ring-primary-500',
  },
  {
    id: 'crypto',
    title: 'ResearchCoin',
    description: 'Deposit RSC',
    icon: <ResearchCoinIcon size={24} outlined color="currentColor" />,
    tileClassName:
      'border-orange-200 bg-white text-orange-500 hover:border-orange-300 hover:bg-orange-50 focus-visible:ring-orange-500',
  },
  {
    id: 'daf',
    title: 'DAF',
    description: 'Give from a fund',
    icon: <FontAwesomeIcon icon={faBuildingColumns} className="h-6 w-6" />,
    tileClassName:
      'border-green-200 bg-white text-green-700 hover:border-green-300 hover:bg-green-50 focus-visible:ring-green-500',
  },
];

const VIEW_TITLES: Record<View, string> = {
  picker: 'Add funds',
  cash: 'Buy funding credits',
  cashPayment: 'Select payment method',
  crypto: 'Fund with ResearchCoin',
  daf: 'Fund with a DAF',
};

/** Where the header's back arrow leads; anything unlisted returns to the picker. */
const BACK_TARGETS: Partial<Record<View, View>> = { cashPayment: 'cash' };

/**
 * Explains every way money can reach research on ResearchHub, and lets people
 * act on the ones that top up a balance here: cash becomes funding credits
 * and ResearchCoin is deposited directly.
 *
 * DAF giving happens at checkout on a proposal page, so that branch teaches
 * and hands off rather than pretending to transact.
 */
export function AddFundsModal({ isOpen, onClose, onReopen }: AddFundsModalProps) {
  const [view, setView] = useState<View>('picker');
  const { showAuthModal } = useAuthModalContext();

  // Always reopen on the picker; a stale sub-view would be confusing on a
  // surface people reach from a single generic button.
  useEffect(() => {
    if (isOpen) setView('picker');
  }, [isOpen]);

  // The auth modal is a plain z-[60] element while this one is a z-[9999]
  // portal, so it has to close first or the sign-in form opens behind it.
  const requestSignIn = () => {
    onClose();
    showAuthModal(onReopen);
  };

  const isPicker = view === 'picker';
  const isCash = view === 'cash' || view === 'cashPayment';

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={VIEW_TITLES[view]}
      size="lg"
      headerAction={
        isPicker ? undefined : (
          <button
            type="button"
            onClick={() => setView(BACK_TARGETS[view] ?? 'picker')}
            aria-label="Back"
            className="-ml-1 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )
      }
    >
      {isPicker && <MethodPicker onSelect={setView} />}
      {isCash && (
        <CashView
          step={view === 'cashPayment' ? 'payment' : 'amount'}
          onStepChange={(step) => setView(step === 'payment' ? 'cashPayment' : 'cash')}
          onClose={onClose}
          onRequestSignIn={requestSignIn}
        />
      )}
      {view === 'crypto' && <CryptoView onRequestSignIn={requestSignIn} />}
      {view === 'daf' && <DafView onClose={onClose} />}
    </BaseModal>
  );
}

function MethodPicker({ onSelect }: { onSelect: (method: FundingMethodId) => void }) {
  return (
    <div>
      <p className="text-md leading-relaxed text-gray-600">
        Cash and ResearchCoin become funding power you can spend on any proposal. Choose one:
      </p>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {METHODS.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className={cn(
              'flex flex-col items-center justify-center gap-2 rounded-xl border px-2 py-4 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 sm:px-3 sm:py-5',
              method.tileClassName
            )}
          >
            <span className="flex h-8 items-center">{method.icon}</span>
            {/* "ResearchCoin" is one unbreakable word roughly as wide as a tile
                on a phone, so the label steps down rather than spilling past
                the tinted border. */}
            <span className="break-words text-xs font-semibold leading-tight sm:text-base">
              {method.title}
            </span>
            <span className="text-[11px] leading-tight text-gray-500 sm:text-xs">
              {method.description}
            </span>
          </button>
        ))}
      </div>

      <a
        href={TALK_TO_TEAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3.5 transition-colors hover:bg-gray-100"
      >
        <Landmark className="h-4 w-4 shrink-0 text-gray-400" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm text-gray-600">
            Looking to give stock, or another asset?
          </span>
          <span className="mt-0.5 block text-sm font-medium text-primary-600">
            Talk to our team
          </span>
        </span>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-primary-600" />
      </a>
    </div>
  );
}

function SignInPrompt({
  children,
  onRequestSignIn,
}: {
  children: ReactNode;
  onRequestSignIn: () => void;
}) {
  return (
    <div>
      <p className="text-md leading-relaxed text-gray-600">{children}</p>
      <Alert variant="info" className="mt-5">
        Sign in to continue.
      </Alert>
      <Button onClick={onRequestSignIn} className="mt-5 w-full">
        Sign in
      </Button>
    </div>
  );
}

interface CashViewProps {
  step: CashStep;
  onStepChange: (step: CashStep) => void;
  onClose: () => void;
  onRequestSignIn: () => void;
}

const CASH_INTRO =
  'Pay with card, Apple Pay, or Google Pay. Your cash becomes funding credits you can spend on any proposal.';

/**
 * Stripe.js is only loaded once someone reaches this branch, and the wallet
 * availability check runs while they are still typing an amount so the
 * payment step opens with Apple Pay / Google Pay already resolved.
 */
function CashView({ onRequestSignIn, ...flowProps }: CashViewProps) {
  const { user } = useUser();

  if (!user) {
    return <SignInPrompt onRequestSignIn={onRequestSignIn}>{CASH_INTRO}</SignInPrompt>;
  }

  return (
    <StripeProvider>
      <CashPurchaseFlow {...flowProps} />
    </StripeProvider>
  );
}

const funnelEvents = getPaymentFunnelEvents(FUNDING_CREDITS_TARGET);
const targetAnalyticsProps = paymentTargetAnalyticsProps(FUNDING_CREDITS_TARGET);

function CashPurchaseFlow({ step, onStepChange, onClose }: Omit<CashViewProps, 'onRequestSignIn'>) {
  const { refreshUser } = useUser();
  const { exchangeRate } = useExchangeRate();
  const walletAvailability = useWalletAvailability();
  const amount = useUsdAmount({ maxAmount: MAX_CREDITS_PURCHASE_USD });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stripeContextRef = useRef<StripePaymentContext | null>(null);

  const { amountUsd } = amount;
  const amountInRsc = exchangeRate ? amountUsd / exchangeRate : 0;
  const amountAnalyticsProps = {
    ...targetAnalyticsProps,
    amount_usd: amountUsd,
    amount_rsc: amountInRsc,
  };

  useEffect(() => {
    AnalyticsService.logEvent(funnelEvents.amountStep, amountAnalyticsProps);
    // Fires once when the flow opens, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStripeReady = useCallback((context: StripePaymentContext | null) => {
    stripeContextRef.current = context;
  }, []);

  const handleContinueToPayment = () => {
    AnalyticsService.logEvent(funnelEvents.paymentStep, amountAnalyticsProps);
    onStepChange('payment');
  };

  const logPaymentError = (
    paymentMethod: PaymentMethodType,
    errorType: 'stripe' | 'api',
    errorMessage: string
  ) => {
    AnalyticsService.logEvent(funnelEvents.error, {
      ...targetAnalyticsProps,
      payment_method: paymentMethod,
      error_type: errorType,
      error_message: errorMessage,
    });
  };

  const handleSuccess = (paymentMethod: PaymentMethodType = 'credit_card') => {
    AnalyticsService.logEvent(funnelEvents.successful, {
      ...amountAnalyticsProps,
      payment_method: paymentMethod,
    });
    toast.success('Funding credits added to your funding power.');
    refreshUser?.();
    onClose();
  };

  // Apple Pay and Google Pay confirm inside PaymentRequestButton; RSC-based
  // methods are hidden for a credits purchase, so only card reaches here.
  const handleConfirmPayment = async (paymentMethod: Exclude<PaymentMethodType, 'endaoment'>) => {
    if (paymentMethod !== 'credit_card') return;

    const stripeContext = stripeContextRef.current;
    if (!stripeContext) {
      setError('Payment form is not ready. Please try again.');
      logPaymentError(paymentMethod, 'stripe', 'Payment form not ready');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const result = await confirmCardPayment(stripeContext, amountInRsc, FUNDING_CREDITS_TARGET);
      if (!result.ok) {
        setError(CARD_PAYMENT_ERROR_MESSAGE);
        logPaymentError(paymentMethod, 'stripe', result.reason);
        return;
      }
      handleSuccess(paymentMethod);
    } catch (err) {
      console.error('Failed to buy funding credits:', err);
      setError(CARD_PAYMENT_ERROR_MESSAGE);
      logPaymentError(paymentMethod, 'api', 'Request failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === 'payment') {
    return (
      <PaymentStep
        amountInRsc={amountInRsc}
        amountInUsd={amountUsd}
        paymentTarget={FUNDING_CREDITS_TARGET}
        walletAvailability={walletAvailability}
        isProcessing={isProcessing}
        error={error}
        onConfirmPayment={handleConfirmPayment}
        onPaymentRequestSuccess={handleSuccess}
        onStripeReady={handleStripeReady}
      />
    );
  }

  return (
    <div>
      <p className="text-md leading-relaxed text-gray-600">{CASH_INTRO}</p>

      <div className="mt-5 space-y-3">
        <Input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={amount.inputValue}
          onChange={amount.handleInputChange}
          icon={<DollarSign className="h-5 w-5 text-gray-500" />}
          error={amount.amountError}
          label="Amount"
          className="text-lg"
        />
        <QuickAmountSelector
          selectedAmount={amount.selectedQuickAmount}
          onAmountSelect={amount.selectQuickAmount}
          remainingGoalUsd={MAX_CREDITS_PURCHASE_USD}
          showRemaining={false}
        />
        {/* Credits are held as RSC, so the amount people will actually see in
            their balance is worth showing before they pay. */}
        {amount.isValid && amountInRsc > 0 && (
          <p className="text-sm text-gray-500">
            You&apos;ll receive about{' '}
            <span className="font-mono font-medium text-gray-700">
              {amountInRsc.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>{' '}
            RSC in funding credits.
          </p>
        )}
      </div>

      <Button
        type="button"
        disabled={!amount.isValid}
        className="mt-6 h-12 w-full text-base"
        onClick={handleContinueToPayment}
      >
        Continue to payment
        <MoveRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}

function CryptoView({ onRequestSignIn }: { onRequestSignIn: () => void }) {
  const { user } = useUser();

  if (!user) {
    return (
      <SignInPrompt onRequestSignIn={onRequestSignIn}>
        Deposit ResearchCoin from any wallet or exchange. It lands in your funding power balance,
        ready to spend on any proposal.
      </SignInPrompt>
    );
  }

  return (
    <div>
      <DepositRscPanel isActive />
    </div>
  );
}

/**
 * Endaoment is the only integration today. The rest of the list exists so people
 * can tell us which provider they actually use — that answer is the whole point
 * of asking.
 */
const DAF_PROVIDERS = [
  'Endaoment',
  'Fidelity Charitable',
  'Schwab Charitable',
  'Vanguard Charitable',
  'National Philanthropic Trust',
  'Daffy',
  'DonorsTrust',
  'Greater Kansas City Community Foundation',
  'Another provider',
];

const ENDAOMENT = DAF_PROVIDERS[0];

function DafView({ onClose }: { onClose: () => void }) {
  const [provider, setProvider] = useState<string>(ENDAOMENT);
  const isSupported = provider === ENDAOMENT;

  return (
    <div>
      <p className="text-md leading-relaxed text-gray-600">
        Give from a donor-advised fund and the contribution stays tax-advantaged.
      </p>

      <label htmlFor="daf-provider" className="mt-5 block text-sm font-medium text-gray-700">
        DAF provider
      </label>
      <select
        id="daf-provider"
        value={provider}
        onChange={(event) => setProvider(event.target.value)}
        className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
      >
        {DAF_PROVIDERS.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      {isSupported ? (
        <div className="mt-5">
          <Alert variant="success">
            <span className="font-semibold">Endaoment is supported.</span> Connect your fund at
            checkout and give straight from your DAF balance.
          </Alert>
          <Link
            href={PROPOSALS_URL}
            onClick={onClose}
            className={cn(buttonVariants(), 'mt-5 w-full gap-1.5')}
          >
            Browse proposals
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-5">
          <Alert variant="info">
            We don&apos;t support {provider} yet. Endaoment is our only DAF integration today.
          </Alert>
          <a
            href={TALK_TO_TEAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: 'outlined' }), 'mt-5 w-full gap-1.5')}
          >
            Talk to our team
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
}
