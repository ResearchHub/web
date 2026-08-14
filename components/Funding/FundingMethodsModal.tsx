'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import { CreditCard } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faApplePay, faGooglePay } from '@fortawesome/free-brands-svg-icons';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';

const TALK_TO_TEAM_URL = 'https://cal.com/tyler-diorio/15min';

interface FundingMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FundingMethod {
  /** Rendered bare in the left gutter. Color is the only anchor, so no chip or border. */
  icon: ReactNode;
  title: string;
  /** The reason someone would pick this over the others. */
  tag: string;
  description: string;
  /** Brand marks, for rails that cover more than one wallet. */
  marks?: ReactNode;
}

/**
 * Ordered by how little setup each one takes, so the first thing read is the
 * one anybody can use today.
 */
const METHODS: FundingMethod[] = [
  {
    icon: <CreditCard className="h-5 w-5 text-primary-600" />,
    title: 'Card or digital wallet',
    tag: 'Fastest',
    description: 'Fund in a few seconds. No account or deposit needed.',
    marks: (
      <div className="mt-2 flex items-center gap-3">
        <FontAwesomeIcon icon={faApplePay} className="h-7 w-7 text-gray-700" />
        <span className="sr-only">Apple Pay</span>
        <FontAwesomeIcon icon={faGooglePay} className="h-7 w-7 text-gray-600" />
        <span className="sr-only">Google Pay</span>
        <span className="text-xs text-gray-400">supported</span>
      </div>
    ),
  },
  {
    icon: (
      <Image
        src="/logos/endaoment_color.svg"
        alt=""
        width={20}
        height={20}
        className="object-contain"
      />
    ),
    title: 'Donor-advised fund',
    tag: 'Tax-advantaged',
    description: 'Fund using your DAF through our Endaoment integration.',
  },
  {
    icon: <ResearchCoinIcon size={20} />,
    title: 'ResearchCoin or Funding Credits',
    tag: 'Lowest fee',
    description: 'Spend the balance you already hold on ResearchHub.',
  },
];

/**
 * Explains the checkout options available on a proposal page. Read-only by
 * design: the real picker lives in the funding flow, so the rows carry no
 * borders, surfaces or hover states that would read as selectable.
 */
export function FundingMethodsModal({ isOpen, onClose }: FundingMethodsModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Ways to fund research" size="md">
      <ul className="mt-4 space-y-5">
        {METHODS.map((method) => (
          <li key={method.title} className="flex gap-3.5">
            <span className="flex w-6 shrink-0 justify-center pt-0.5">{method.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="text-sm font-semibold text-gray-900">{method.title}</h3>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                  {method.tag}
                </span>
              </div>
              <p className="mt-0.5 text-[13px] leading-relaxed text-gray-500">
                {method.description}
              </p>
              {method.marks}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs leading-relaxed text-gray-500">
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

      <Button onClick={onClose} className="mt-5 w-full">
        Got it
      </Button>
    </BaseModal>
  );
}
