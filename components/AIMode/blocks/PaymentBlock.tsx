'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { Check, CreditCard } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faApplePay } from '@fortawesome/free-brands-svg-icons';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useAIMode } from '../lib/AIModeContext';

/**
 * Mocked balances. The real widget derives these from the wallet; the demo only
 * needs them to be plausible and consistent with the exchange rate.
 */
const FUNDING_CREDITS_RSC = 393_284;
const RSC_BALANCE = 3_146_278;

interface PaymentOption {
  id: string;
  /** Short enough to sit on one line of a card. */
  label: string;
  /** Full method name, used when reporting the commitment back. */
  title: string;
  detail?: ReactNode;
  icon: ReactNode;
}

interface PaymentBlockProps {
  readonly amountUsd: number;
  /** Locks the widget once the funder has committed. */
  readonly confirmed: boolean;
}

/**
 * The method list, labels and balances of `components/Funding/PaymentWidget`,
 * flattened into a single row of cards: the widget's amount header and
 * expand-then-confirm sequence are steps a demo audience has to sit through to
 * watch a decision they already know the answer to. Picking a card commits.
 *
 * Cloned rather than reused because the real widget pulls in Stripe and
 * Endaoment initialization, and a crashing overlay would be far worse in a live
 * demo than a mocked one.
 */
export const PaymentBlock = ({ amountUsd, confirmed }: PaymentBlockProps) => {
  const { actions } = useAIMode();
  const { exchangeRate } = useExchangeRate();

  const amountDisplay = `$${amountUsd.toLocaleString('en-US')}`;

  if (confirmed) {
    return (
      <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
        <Check className="h-4 w-4" />
        {amountDisplay} committed
      </div>
    );
  }

  const formatWhole = (amount: number) =>
    amount.toLocaleString('en-US', { maximumFractionDigits: 0 });

  // Just the dollar value: the card is too narrow to also carry the RSC figure
  // without wrapping it onto a line of its own.
  const renderRscBalance = (rsc: number) =>
    `$${formatWhole(exchangeRate ? rsc * exchangeRate : 0)}`;

  const options: PaymentOption[] = [
    {
      id: 'funding_credits',
      label: 'Funding Credits',
      title: 'Funding Credits',
      detail: renderRscBalance(FUNDING_CREDITS_RSC),
      icon: <ResearchCoinIcon size={22} variant="green" outlined />,
    },
    {
      id: 'rsc',
      label: 'ResearchCoin',
      title: 'ResearchCoin',
      detail: renderRscBalance(RSC_BALANCE),
      icon: <ResearchCoinIcon size={22} />,
    },
    {
      id: 'endaoment',
      label: 'DAF',
      title: 'Donor-Advised Fund (DAF)',
      detail: 'Via Endaoment',
      icon: (
        <Image
          src="/logos/endaoment_color.svg"
          alt="Endaoment"
          width={22}
          height={22}
          className="object-contain"
        />
      ),
    },
    {
      id: 'credit_card',
      label: 'Credit Card',
      title: 'Credit Card',
      icon: <CreditCard className="h-[22px] w-[22px] text-gray-600" />,
    },
    {
      id: 'apple_pay',
      label: 'Apple Pay',
      title: 'Apple Pay',
      icon: <FontAwesomeIcon icon={faApplePay} className="h-7 w-7 text-gray-800" />,
    },
  ];

  return (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="mb-2.5 flex items-baseline justify-between px-0.5">
        <span className="text-xs font-medium text-gray-500">Select a payment method</span>
        <span className="text-sm font-semibold tracking-tight text-gray-900">{amountDisplay}</span>
      </div>

      {/* A fixed card height keeps the row even when a label wraps in the narrow
          column left by an open document panel. */}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => actions.confirmPayment(amountUsd, option.title)}
            className="flex h-[104px] w-[112px] flex-col items-start justify-between rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-left transition-colors hover:border-primary-300 hover:bg-white focus:outline-none focus-visible:border-primary-500"
          >
            <div className="flex h-7 items-center">{option.icon}</div>
            <div className="w-full">
              <div className="text-[13px] font-medium leading-tight text-gray-900">
                {option.label}
              </div>
              {option.detail && (
                <div className="truncate text-[11px] leading-snug text-gray-500">
                  {option.detail}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
