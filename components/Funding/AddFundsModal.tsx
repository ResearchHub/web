'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Landmark } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faApplePay, faGooglePay, faCcVisa } from '@fortawesome/free-brands-svg-icons';
import { faBuildingColumns, faCreditCard } from '@fortawesome/pro-light-svg-icons';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { DepositRscPanel } from '@/components/modals/ResearchCoin/DepositRscPanel';
import { useAuthModalContext } from '@/contexts/AuthModalContext';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/utils/styles';

const TALK_TO_TEAM_URL = 'https://cal.com/tyler-diorio/15min';
const PROPOSALS_URL = '/fund/proposals';

type FundingMethodId = 'cash' | 'crypto' | 'daf';
type View = 'picker' | FundingMethodId;

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Reopens this modal after an interruption, currently only signing in. */
  onReopen: () => void;
}

interface FundingMethod {
  id: FundingMethodId;
  title: string;
  icon: ReactNode;
  /** Tile tint drawn from the icon's own palette so each option reads as one colour. */
  tileClassName: string;
}

const METHODS: FundingMethod[] = [
  {
    id: 'cash',
    title: 'Cash',
    icon: <FontAwesomeIcon icon={faCreditCard} className="h-6 w-6" />,
    tileClassName:
      'border-primary-200 bg-white text-primary-700 hover:border-primary-300 hover:bg-primary-50 focus-visible:ring-primary-500',
  },
  {
    id: 'crypto',
    title: 'ResearchCoin',
    icon: <ResearchCoinIcon size={24} outlined color="currentColor" />,
    tileClassName:
      'border-orange-200 bg-white text-orange-700 hover:border-orange-300 hover:bg-orange-50 focus-visible:ring-orange-500',
  },
  {
    id: 'daf',
    title: 'DAF',
    icon: <FontAwesomeIcon icon={faBuildingColumns} className="h-6 w-6" />,
    tileClassName:
      'border-green-200 bg-white text-green-700 hover:border-green-300 hover:bg-green-50 focus-visible:ring-green-500',
  },
];

const VIEW_TITLES: Record<View, string> = {
  picker: 'Add funds',
  cash: 'Fund with cash',
  crypto: 'Fund with ResearchCoin',
  daf: 'Fund with a DAF',
};

/**
 * Explains every way money can reach research on ResearchHub, and lets people
 * act on the one that tops up a balance here (RSC).
 *
 * Cash and DAF are checkout-time methods that live on a proposal page, so those
 * branches teach and hand off rather than pretending to transact — the widget
 * that really moves money needs an amount and a fundraise, neither of which
 * exists in this context.
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
            onClick={() => setView('picker')}
            aria-label="Back to funding methods"
            className="-ml-1 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )
      }
    >
      {isPicker && <MethodPicker onSelect={setView} />}
      {view === 'cash' && <CashView onClose={onClose} />}
      {view === 'crypto' && <CryptoView onRequestSignIn={requestSignIn} />}
      {view === 'daf' && <DafView onClose={onClose} />}
    </BaseModal>
  );
}

function MethodPicker({ onSelect }: { onSelect: (method: FundingMethodId) => void }) {
  return (
    <div>
      <p className="text-md leading-relaxed text-gray-500">Choose a funding method.</p>

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

/** Rails shown at checkout on a proposal page. Display-only — this view does not transact. */
const CASH_RAILS: { label: string; mark: ReactNode }[] = [
  {
    label: 'Card',
    mark: <FontAwesomeIcon icon={faCcVisa} className="h-10 w-10 text-gray-500" />,
  },
  {
    label: 'Apple Pay',
    mark: <FontAwesomeIcon icon={faApplePay} className="h-10 w-10 text-gray-500" />,
  },
  {
    label: 'Google Pay',
    mark: <FontAwesomeIcon icon={faGooglePay} className="h-10 w-10 text-gray-500" />,
  },
];

function CashView({ onClose }: { onClose: () => void }) {
  return (
    <div>
      <p className="text-md text-gray-600">Fund directly on the proposal you want to support.</p>

      <ul className="mt-8 flex items-start justify-center gap-10">
        {CASH_RAILS.map((rail) => (
          <li key={rail.label} className="flex flex-col items-center gap-2">
            {/* Fixed-height box: the brand marks have different aspect ratios,
                so without it each label sits at a different height. */}
            <span className="flex h-10 items-center justify-center" aria-hidden>
              {rail.mark}
            </span>
            <span className="text-xs text-gray-500">{rail.label}</span>
          </li>
        ))}
      </ul>

      <Link
        href={PROPOSALS_URL}
        onClick={onClose}
        className={cn(buttonVariants(), 'mt-8 w-full gap-1.5')}
      >
        Browse proposals
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function CryptoView({ onRequestSignIn }: { onRequestSignIn: () => void }) {
  const { user } = useUser();

  if (!user) {
    return (
      <div>
        <p className="text-md leading-relaxed text-gray-600">
          Deposit ResearchCoin from any wallet or exchange. It lands in your funding power balance,
          ready to spend on any proposal.
        </p>
        <Alert variant="info" className="mt-5">
          Sign in to get your personal deposit address.
        </Alert>
        <Button onClick={onRequestSignIn} className="mt-5 w-full">
          Sign in
        </Button>
      </div>
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
