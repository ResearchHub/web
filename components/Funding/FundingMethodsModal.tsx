'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import { CreditCard } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faApplePay, faGooglePay } from '@fortawesome/free-brands-svg-icons';
import { BaseModal } from '@/components/ui/BaseModal';

const TALK_TO_TEAM_URL = 'https://cal.com/tyler-diorio/15min';

interface FundingMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FundingMethod {
  icon: ReactNode;
  /** Accessible name. Rendered visually only when `showLabel` is set. */
  label: string;
  subtitle?: string;
  showLabel?: boolean;
}

/**
 * Labelled methods lead so the wordmark-only wallet tiles read as a pair
 * underneath them instead of sitting at uneven heights beside them.
 */
const METHODS: FundingMethod[] = [
  {
    icon: <CreditCard className="h-6 w-6 text-gray-600" />,
    label: 'Credit Card',
    showLabel: true,
  },
  {
    icon: (
      <Image
        src="/logos/endaoment_color.svg"
        alt=""
        width={24}
        height={24}
        className="object-contain"
      />
    ),
    label: 'DAF',
    subtitle: 'via Endaoment',
    showLabel: true,
  },
  {
    icon: <FontAwesomeIcon icon={faApplePay} className="h-10 w-10 text-gray-800" />,
    label: 'Apple Pay',
  },
  {
    icon: <FontAwesomeIcon icon={faGooglePay} className="h-10 w-10 text-gray-600" />,
    label: 'Google Pay',
  },
];

/**
 * Explains the checkout options available on a proposal page. Intentionally
 * leaves out balance-funded methods so the takeaway stays "you can pay for
 * research without setting anything up first".
 */
export function FundingMethodsModal({ isOpen, onClose }: FundingMethodsModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Ways to fund research" size="sm">
      <p className="text-sm leading-relaxed text-gray-600">
        Fund any proposal directly from its page. No deposit needed.
      </p>

      {/* auto-rows-fr keeps the wordmark-only wallet row the same height as the
          labelled row above it. */}
      <div className="mt-5 grid auto-rows-fr grid-cols-2 gap-3">
        {METHODS.map((method) => (
          <div
            key={method.label}
            className="flex flex-col items-center justify-center rounded-xl border border-gray-200 p-4 text-center"
          >
            <div className="flex h-10 items-center justify-center">{method.icon}</div>
            {method.showLabel ? (
              <>
                <span className="mt-2 text-sm font-semibold text-gray-900">{method.label}</span>
                {method.subtitle && (
                  <span className="mt-0.5 text-xs text-gray-500">{method.subtitle}</span>
                )}
              </>
            ) : (
              <span className="sr-only">{method.label}</span>
            )}
          </div>
        ))}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-gray-500">
        Want to give another way, like a different DAF?{' '}
        <a
          href={TALK_TO_TEAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary-600 hover:underline"
        >
          Talk to our team
        </a>
        .
      </p>
    </BaseModal>
  );
}
