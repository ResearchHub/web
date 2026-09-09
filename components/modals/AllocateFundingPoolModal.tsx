'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Modal } from '@/components/ui/form/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { FundingPoolService } from '@/services/funding-pool.service';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import type { FundingPool } from '@/types/grant';
import { formatRSC } from '@/utils/number';
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
  const holdingRsc = fundingPool.amountHolding.rsc;
  const distributedRsc = fundingPool.amountDistributed.rsc;

  const [amountInput, setAmountInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountError, setAmountError] = useState<string | undefined>();

  useEffect(() => {
    if (!isOpen) return;
    setAmountInput('');
    setAmountError(undefined);
    setIsSubmitting(false);
  }, [isOpen, fundingPool.id, applicationId]);

  const parseAmount = useCallback((value: string): number => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setAmountInput(next);
    setAmountError(undefined);

    if (!next.trim()) return;
    const amount = parseAmount(next);
    if (!Number.isFinite(amount) || amount <= 0) {
      setAmountError('Enter a positive amount');
      return;
    }
    if (amount > holdingRsc) {
      setAmountError(`Cannot exceed ${formatRSC({ amount: holdingRsc, decimalPlaces: 2 })} RSC holding`);
    }
  };

  const handleAllocateMax = () => {
    setAmountInput(String(holdingRsc));
    setAmountError(undefined);
  };

  const handleSubmit = async () => {
    const amount = parseAmount(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      setAmountError('Enter a positive amount');
      return;
    }
    if (amount > holdingRsc) {
      setAmountError(`Cannot exceed ${formatRSC({ amount: holdingRsc, decimalPlaces: 2 })} RSC holding`);
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedPool = await FundingPoolService.distribute(fundingPool.id, {
        amount,
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

  const amount = parseAmount(amountInput);
  const canSubmit =
    Number.isFinite(amount) && amount > 0 && amount <= holdingRsc && !isSubmitting && !amountError;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Allocate to proposal">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">{proposalTitle}</p>

        <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-gray-500">Pool holding</span>
            <span className="font-mono font-medium text-gray-900 tabular-nums">
              {formatRSC({ amount: holdingRsc, decimalPlaces: 2 })} RSC
            </span>
          </div>
          <div className="flex justify-between gap-3 mt-1">
            <span className="text-gray-500">Already distributed</span>
            <span className="font-mono text-gray-700 tabular-nums">
              {formatRSC({ amount: distributedRsc, decimalPlaces: 2 })} RSC
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="allocate-amount" className="text-sm font-medium text-gray-700">
              Amount
            </label>
            {holdingRsc > 0 && (
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
            className={amountError ? 'border-red-500' : undefined}
            rightElement={
              <div className="flex items-center gap-1 pr-3 text-gray-900">
                <span className="font-medium">RSC</span>
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
