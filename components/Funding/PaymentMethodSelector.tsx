'use client';

import { CreditCard } from 'lucide-react';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { cn } from '@/utils/styles';
import Image from 'next/image';

export type PaymentMethodType = 'rsc' | 'credit_card' | 'endaoment';

interface PaymentMethod {
  id: PaymentMethodType;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
}

interface PaymentMethodSelectorProps {
  onSelect: (method: PaymentMethodType) => void;
  /** User's RSC balance to display on the ResearchCoin option */
  rscBalance?: number;
}

/**
 * Payment method selector for the ContributeToFundraiseModal.
 * Shows payment options: ResearchCoin, Credit Card, Endaoment.
 */
export function PaymentMethodSelector({ onSelect, rscBalance }: PaymentMethodSelectorProps) {
  const formatRsc = (amount: number) =>
    `${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} RSC`;

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'rsc',
      title: 'ResearchCoin',
      description:
        rscBalance !== undefined
          ? `Balance: ${formatRsc(rscBalance)}`
          : "Fund with ResearchHub's native token",
      icon: <ResearchCoinIcon size={24} variant="gray" />,
      badge: 'Lowest fees',
    },
    {
      id: 'credit_card',
      title: 'Credit Card',
      description: 'Pay with Visa, Mastercard, or Amex',
      icon: <CreditCard className="h-6 w-6 text-gray-600" />,
    },
    {
      id: 'endaoment',
      title: 'Endaoment',
      description: 'Contribute from your Endaoment DAF',
      icon: (
        <Image
          src="/logos/endaoment_color.svg"
          alt="Endaoment"
          width={24}
          height={24}
          className="object-contain"
        />
      ),
    },
  ];

  const handleClick = (method: PaymentMethod) => {
    onSelect(method.id);
  };

  return (
    <div className="space-y-3">
      {paymentMethods.map((method) => (
        <div
          key={method.id}
          className="w-full rounded-xl border-2 transition-all duration-200 border-gray-200 bg-white"
        >
          <button
            onClick={() => handleClick(method)}
            className={cn(
              'w-full p-4 rounded-xl transition-all duration-200',
              'hover:bg-primary-50/50',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
            )}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                {method.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{method.title}</span>
                  {method.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                      {method.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{method.description}</p>
              </div>
            </div>
          </button>
        </div>
      ))}
    </div>
  );
}
