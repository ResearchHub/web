'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { BalanceInfo } from './BalanceInfo';
import { useUser } from '@/contexts/UserContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { FeedContentType } from '@/types/feed';
import { useTip } from '@/hooks/useTip';
import { ModalContainer } from '@/components/ui/Modal/ModalContainer';
import { ModalHeader } from '@/components/ui/Modal/ModalHeader';
import { useAmountInput } from '@/hooks/useAmountInput';
import { CurrencyInput } from '@/components/ui/form/CurrencyInput';

interface TipContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTipSuccess?: (amount: number) => void;
  contentId: number;
  feedContentType: FeedContentType;
  recipientName?: string;
}

export function TipContentModal({
  isOpen,
  onClose,
  onTipSuccess,
  contentId,
  feedContentType,
  recipientName,
}: TipContentModalProps) {
  const { user } = useUser();
  const { exchangeRate, isLoading: isExchangeRateLoading } = useExchangeRate();

  const {
    amount: inputAmount,
    error: amountError,
    setAmount: setInputAmount,
    setError: setAmountError,
    handleAmountChange,
    getFormattedValue: getFormattedInputValue,
  } = useAmountInput({
    initialAmount: 10,
  });

  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const userBalance = user?.balance || 0;

  const { tip, isTipping } = useTip({
    contentId,
    feedContentType,
    onTipSuccess: (response, tippedAmount) => {
      if (onTipSuccess) {
        onTipSuccess(tippedAmount);
      }
      onClose();
    },
    onTipError: (err) => {
      setSubmissionError(err instanceof Error ? err.message : 'Failed to send tip.');
    },
  });

  const handleTip = async () => {
    setSubmissionError(null);
    if (inputAmount <= 0) {
      setAmountError('Tip amount must be positive');
      return;
    }

    if (userBalance < inputAmount) {
      setSubmissionError('Insufficient balance to send tip.');
      return;
    }

    await tip(inputAmount);
  };

  const insufficientBalance = userBalance < inputAmount;

  const usdEquivalent =
    !isExchangeRateLoading && exchangeRate > 0 && inputAmount > 0
      ? `≈ $${(inputAmount * exchangeRate).toFixed(2)} USD`
      : '';

  const modalSubtitle = recipientName
    ? `Send ResearchCoin to ${recipientName} for their contribution`
    : 'Send ResearchCoin for this contribution';

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <ModalHeader title="Send a Tip" onClose={onClose} subtitle={modalSubtitle} />

        <div className="space-y-6">
          <div>
            <CurrencyInput
              value={getFormattedInputValue()}
              onChange={handleAmountChange}
              error={amountError}
              currency="RSC"
              onCurrencyToggle={() => {}}
              label="Tip Amount"
            />
            {!amountError && usdEquivalent && (
              <div className="mt-1.5 text-sm text-gray-500">{usdEquivalent}</div>
            )}
          </div>

          <BalanceInfo amount={inputAmount} showWarning={insufficientBalance} />

          {submissionError && <Alert variant="error">{submissionError}</Alert>}

          <Button
            type="button"
            variant="default"
            disabled={
              isTipping ||
              !inputAmount ||
              inputAmount <= 0 ||
              insufficientBalance ||
              !!amountError
            }
            className="w-full h-12 text-base"
            onClick={handleTip}
          >
            {isTipping
              ? 'Sending Tip...'
              : `Send ${inputAmount > 0 ? inputAmount.toLocaleString() : ''} RSC Tip`}
          </Button>
        </div>
      </div>
    </ModalContainer>
  );
}
