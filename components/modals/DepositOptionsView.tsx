'use client';

import { Landmark, ArrowRightLeft, DollarSign } from 'lucide-react';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';

// Fee comparison tooltip content
const FeeComparisonTooltip = () => (
  <div className="text-left">
    <p className="font-semibold text-gray-900 mb-2">Platform fees when funding</p>
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ResearchCoinIcon size={16} />
          <span className="text-gray-700">RSC</span>
        </div>
        <span className="font-medium text-green-600">7%</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
            <DollarSign className="h-2.5 w-2.5 text-green-600" />
          </div>
          <span className="text-gray-700">USD</span>
        </div>
        <span className="font-medium text-gray-600">9%</span>
      </div>
    </div>
  </div>
);

export type DepositOptionType = 'rsc' | 'bank' | 'wire';

interface DepositOption {
  id: DepositOptionType;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
}

interface DepositOptionsViewProps {
  onSelect: (option: DepositOptionType) => void;
}

/**
 * Shared deposit options view used in both ContributeToFundraiseModal and DepositOptionsModal.
 * Provides consistent UI for selecting deposit method.
 */
export function DepositOptionsView({ onSelect }: DepositOptionsViewProps) {
  const depositOptions: DepositOption[] = [
    {
      id: 'rsc',
      title: 'ResearchCoin',
      description: "ResearchHub's native token",
      icon: <ResearchCoinIcon size={24} variant="gray" />,
      badge: 'Lowest fees for funding',
    },
    {
      id: 'bank',
      title: 'Bank Account',
      description: 'Connect your account and transfer funds. Limits may apply.',
      icon: <Landmark className="h-6 w-6 text-gray-700" />,
    },
    {
      id: 'wire',
      title: 'Wire Transfer',
      description: 'For large amounts, no limits',
      icon: <ArrowRightLeft className="h-6 w-6 text-gray-700" />,
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-gray-600 text-sm">Choose how you'd like to add funds to your account.</p>

      <div className="space-y-3">
        {depositOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={cn(
              'w-full p-4 rounded-xl border-2 transition-all duration-200',
              'hover:border-primary-500 hover:bg-primary-50/50',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              'border-gray-200 bg-white'
            )}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                {option.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{option.title}</span>
                  {option.badge && (
                    <Tooltip
                      delay={0}
                      position="top"
                      className="z-[9999]"
                      width="w-52"
                      content={<FeeComparisonTooltip />}
                    >
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full cursor-help bg-green-100 text-green-700">
                        {option.badge}
                      </span>
                    </Tooltip>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
              </div>
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
