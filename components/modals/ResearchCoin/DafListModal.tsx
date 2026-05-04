'use client';

import { Wallet } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { useEndaoment } from '@/contexts/EndaomentContext';
import type { EndaomentFund } from '@/services/endaoment.service';

interface DafListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatUsd = (amount: number) =>
  `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getBalanceUsd = (fund: EndaomentFund) => parseFloat(fund.usdcBalance) || 0;

export function DafListModal({ isOpen, onClose }: DafListModalProps) {
  const { funds, isFundsLoading } = useEndaoment();

  const total = funds.reduce((sum, f) => sum + getBalanceUsd(f), 0);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Your Donor-Advised Funds"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-gray-100 pb-3">
          <span className="text-sm text-gray-500">Total balance</span>
          <span className="text-lg font-bold text-gray-900">{formatUsd(total)}</span>
        </div>

        {isFundsLoading ? (
          <div className="space-y-2">
            <div className="h-14 bg-gray-100 animate-pulse rounded-lg" />
            <div className="h-14 bg-gray-100 animate-pulse rounded-lg" />
          </div>
        ) : funds.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-6">
            No funds found in your Endaoment account.
          </div>
        ) : (
          <ul className="space-y-2">
            {funds.map((fund) => (
              <li
                key={fund.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0 w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center">
                    <Wallet className="h-[18px] w-[18px] text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{fund.name}</div>
                    {fund.description && (
                      <div className="text-xs text-gray-500 truncate">{fund.description}</div>
                    )}
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-900 shrink-0">
                  {formatUsd(getBalanceUsd(fund))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </BaseModal>
  );
}
