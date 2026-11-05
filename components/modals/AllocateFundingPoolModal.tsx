'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Modal } from '@/components/ui/form/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { FundingPoolService } from '@/services/funding-pool.service';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import type { FundingPool } from '@/types/grant';
import { formatCurrency } from '@/utils/currency';
import { validatePositiveDecimal } from '@/utils/number';
import { cn } from '@/utils/styles';
import { ID } from '@/types/root';

interface AllocateFundingPoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  fundingPool: FundingPool;
  applicationId: ID;
  proposalTitle: string;
  onSuccess: (updatedPool: FundingPool) => void;
}

/**
 * Owner/mod modal to move RSC from the RFP funding pool into an open proposal fundraise.
 */
export function AllocateFundingPoolModal({
  isOpen,
  onClose,
  fundingPool,
  applicationId,
  proposalTitle,
  onSuccess,
}: AllocateFundingPoolModalProps) {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  const holdingRsc = fundingPool.amountHolding.rsc;
  const holdingDisplay = showUSD ? fundingPool.amountHolding.usd : holdingRsc;
  const currencyLabel = showUSD ? 'USD' : 'RSC';

  const formatPoolAmount = (amount: { usd: number; rsc: number }) =>
    formatCurrency({
      amount: showUSD ? amount.usd : amount.rsc,
      showUSD,
      exchangeRate: 1,
      skipConversion: true,
    });

  const [amountInput, setAmountInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountError, setAmountError] = useState<string | undefined>();

  useEffect(() => {
    if (!isOpen) return;
    setAmountInput('');
    setAmountError(undefined);
    setIsSubmitting(false);
  }, [isOpen, fundingPool.id, applicationId, showUSD]);

  const toRscAmount = useCallback(
    (displayAmount: number) => {
      if (!showUSD) return displayAmount;
      if (!(exchangeRate > 0)) return NaN;
      return displayAmount / exchangeRate;
    },
    [showUSD, exchangeRate]
  );

  const validateAmount = useCallback(
    (value: string) =>
      validatePositiveDecimal(value, {
        max: holdingDisplay,
        maxError: `Cannot exceed ${formatPoolAmount(fundingPool.amountHolding)} holding`,
      }),
    [holdingDisplay, fundingPool.amountHolding, showUSD]
  );

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setAmountInput(next);

    if (!next.trim()) {
      setAmountError(undefined);
      return;
    }

    const { error } = validateAmount(next);
    setAmountError(error);
  };

  const handleAllocateMax = () => {
    setAmountInput(String(holdingDisplay));
    setAmountError(undefined);
  };

  const handleSubmit = async () => {
    const { amount: displayAmount, error } = validateAmount(amountInput);
    if (error || !Number.isFinite(displayAmount)) {
      setAmountError(error ?? 'Enter a valid positive amount');
      return;
    }

    const isMaxAllocation = displayAmount >= holdingDisplay;
    const amountRsc = isMaxAllocation
      ? holdingRsc
      : Math.min(toRscAmount(displayAmount), holdingRsc);

    if (!Number.isFinite(amountRsc) || amountRsc <= 0) {
      setAmountError(
        showUSD && !(exchangeRate > 0)
          ? 'Exchange rate unavailable. Switch to RSC or try again.'
          : 'Enter a valid positive amount'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedPool = await FundingPoolService.distribute(fundingPool.id, {
        amount: amountRsc,
        applicationId,
      });
      toast.success('Allocated to proposal');
      onSuccess(updatedPool);
      onClose();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Failed to allocate from funding pool'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const { amount: parsedDisplayAmount, error: parsedError } = amountInput.trim()
    ? validateAmount(amountInput)
    : { amount: NaN, error: undefined };
  const hasFundsToAllocate = holdingDisplay > 0;
  const canSubmit =
    Number.isFinite(parsedDisplayAmount) &&
    parsedDisplayAmount > 0 &&
    parsedDisplayAmount <= holdingDisplay &&
    (!showUSD || exchangeRate > 0) &&
    !isSubmitting &&
    !amountError &&
    !parsedError;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Allocate community contributions">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Allocate community contributions towards this proposal{' '}
          <span className="font-medium text-gray-900">{proposalTitle}</span>
        </p>

        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-600">Total contribution by community</span>
              <span className="font-mono tabular-nums text-gray-900">
                {formatPoolAmount(fundingPool.amountRaised)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-600">Already allocated to proposals</span>
              <span className="font-mono tabular-nums text-gray-900">
                {formatPoolAmount(fundingPool.amountDistributed)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-2">
              <span className="font-medium text-gray-900">Available to allocate</span>
              <span
                className={cn(
                  'font-mono font-semibold tabular-nums',
                  hasFundsToAllocate ? 'text-green-600' : 'text-gray-400'
                )}
              >
                {formatPoolAmount(fundingPool.amountHolding)}
              </span>
            </div>
          </div>
        </div>

        {!hasFundsToAllocate && (
          <p className="text-sm text-gray-500">
            Every community contribution has already been allocated. Once the pool receives new
            contributions, you can allocate them here.
          </p>
        )}

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="allocate-amount" className="text-sm font-medium text-gray-700">
              Amount to allocate
            </label>
            {hasFundsToAllocate && (
              <button
                type="button"
                onClick={handleAllocateMax}
                className="text-xs font-medium text-primary-600 hover:text-primary-700"
              >
                Use max
              </button>
            )}
          </div>
          <Input
            id="allocate-amount"
            name="amount"
            value={amountInput}
            onChange={handleAmountChange}
            placeholder="0.00"
            type="text"
            inputMode="decimal"
            disabled={!hasFundsToAllocate || isSubmitting}
            className={cn(
              amountError && 'border-red-500',
              !hasFundsToAllocate && 'bg-gray-50 opacity-60'
            )}
            rightElement={
              <div className="flex items-center gap-1 pr-3 text-gray-900">
                <span className="font-medium">{currencyLabel}</span>
              </div>
            }
          />
          {amountError && <p className="mt-1.5 text-xs text-red-500">{amountError}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? 'Allocating…' : 'Allocate'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
