'use client';

import { useState } from 'react';
import { Plus, Minus, Check, Wallet } from 'lucide-react';
import { cn } from '@/utils/styles';
import { EndaomentDAFAccount } from '@/types/endaoment';

interface DAFAccountSelectorProps {
  /** List of available DAF accounts */
  accounts: EndaomentDAFAccount[];
  /** Currently selected account ID */
  selectedAccountId: string | null;
  /** Callback when an account is selected */
  onSelectAccount: (accountId: string) => void;
  /** Required amount in USD for the transaction */
  requiredAmountUsd: number;
}

/**
 * DAF Account selector widget for Endaoment payments.
 * Expandable dropdown showing available DAF accounts with balances.
 */
export function DAFAccountSelector({
  accounts,
  selectedAccountId,
  onSelectAccount,
  requiredAmountUsd,
}: DAFAccountSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);

  const formatUsd = (amount: number) =>
    `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const hasInsufficientFunds = (account: EndaomentDAFAccount) =>
    account.balanceUsd < requiredAmountUsd;

  const handleSelectAccount = (accountId: string) => {
    onSelectAccount(accountId);
    setIsExpanded(false);
  };

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden transition-all duration-200',
        isExpanded ? 'border-primary-500' : 'border-gray-200'
      )}
    >
      {/* Header - click to expand/collapse */}
      <button
        type="button"
        onClick={toggleExpanded}
        className={cn(
          'w-full py-3 px-4 transition-all duration-200',
          'flex items-center justify-between',
          'hover:bg-gray-50',
          'focus:outline-none',
          !isExpanded && 'focus:ring-2 focus:ring-primary-500 focus:ring-inset',
          isExpanded ? 'bg-primary-50/30' : 'bg-white'
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex-shrink-0 w-5 flex items-center justify-center">
            <Wallet className="h-[18px] w-[18px] text-gray-500" />
          </div>
          {selectedAccount ? (
            <div className="flex items-center gap-2 text-left">
              <span className="font-medium text-gray-900">{selectedAccount.name}</span>
              <span
                className={cn(
                  'text-xs',
                  hasInsufficientFunds(selectedAccount) ? 'text-amber-600' : 'text-green-600'
                )}
              >
                {formatUsd(selectedAccount.balanceUsd)}
              </span>
            </div>
          ) : (
            <span className="font-medium text-gray-700">Select DAF Account</span>
          )}
        </div>
        <div className="flex-shrink-0">
          {isExpanded ? (
            <Minus className="h-5 w-5 text-gray-400" />
          ) : (
            <Plus className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded account list */}
      {isExpanded && (
        <div className="border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
          {accounts.map((account, index) => {
            const isInsufficient = hasInsufficientFunds(account);
            const isSelected = selectedAccountId === account.id;

            return (
              <button
                key={account.id}
                type="button"
                onClick={() => handleSelectAccount(account.id)}
                className={cn(
                  'w-full py-2.5 px-3 transition-all duration-200',
                  'flex items-center gap-2.5',
                  'hover:bg-primary-50',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset',
                  index !== accounts.length - 1 && 'border-b border-gray-200',
                  isSelected ? 'bg-primary-50' : 'bg-white'
                )}
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-5 flex items-center justify-center">
                  <Wallet className="h-[18px] w-[18px] text-gray-500" />
                </div>

                {/* Account name and balance */}
                <div className="flex-1 flex items-center gap-2 text-left min-w-0">
                  <span className="font-medium text-gray-900 text-sm">{account.name}</span>
                  <span
                    className={cn('text-xs', isInsufficient ? 'text-amber-600' : 'text-green-600')}
                  >
                    {formatUsd(account.balanceUsd)}
                  </span>
                  {isInsufficient && (
                    <span className="text-xs text-amber-600 font-medium">Insufficient funds</span>
                  )}
                </div>

                {/* Checkmark for selected account */}
                {isSelected && (
                  <div className="flex-shrink-0">
                    <Check className="h-4 w-4 text-primary-600" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
