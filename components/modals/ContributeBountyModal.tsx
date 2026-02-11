'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { ID } from '@/types/root';
import { BalanceInfo } from './BalanceInfo';
import { BountyService } from '@/services/bounty.service';
import { toast } from 'react-hot-toast';
import { ContentType } from '@/types/work';
import { BountyType } from '@/types/bounty';
import { useUser } from '@/contexts/UserContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { FeeBreakdown } from '../Bounty/lib/FeeBreakdown';
import { CurrencyInput } from '@/components/ui/form/CurrencyInput';
import { ModalContainer } from '@/components/ui/Modal/ModalContainer';
import { ModalHeader } from '@/components/ui/Modal/ModalHeader';
import { useAmountInput } from '@/hooks/useAmountInput';
import { calculateBountyFees } from '../Bounty/lib/bountyUtil';

interface ContributeBountyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContributeSuccess?: () => void;
  commentId: ID;
  documentId: number;
  contentType: ContentType;
  bountyTitle?: string;
  bountyType: BountyType;
  expirationDate?: string;
}

export function ContributeBountyModal({
  isOpen,
  onClose,
  onContributeSuccess,
  commentId,
  documentId,
  contentType,
  bountyTitle = 'Bounty',
  bountyType,
  expirationDate,
}: ContributeBountyModalProps) {
  const { user } = useUser();
  const { exchangeRate, isLoading: isExchangeRateLoading } = useExchangeRate();
  const [isContributing, setIsContributing] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const {
    amount: inputAmount,
    handleAmountChange,
    getFormattedValue: getFormattedInputValue,
    error: amountError,
  } = useAmountInput({
    initialAmount: 50,
    minAmount: 10,
    validate: (val) => val < 10 ? 'Minimum contribution amount is 10 RSC' : undefined,
  });

  const userBalance = user?.balance || 0;
  const { platformFee, totalAmount } = calculateBountyFees(inputAmount);
  const insufficientBalance = userBalance < totalAmount;

  const handleContribute = async () => {
    try {
      if (inputAmount < 10) {
        setSubmissionError('Minimum contribution amount is 10 RSC');
        return;
      }

      setIsContributing(true);
      setSubmissionError(null);

      await BountyService.contributeToBounty(
        commentId,
        inputAmount,
        'rhcommentmodel',
        bountyType,
        expirationDate || new Date().toISOString()
      );

      toast.success('Your contribution has been successfully added to the bounty.');

      if (onContributeSuccess) {
        onContributeSuccess();
      }

      onClose();
    } catch (error: any) {
      console.error('Failed to contribute to bounty:', error);
      const message = error?.response?.data?.message || error?.message || 'Failed to contribute to bounty';
      setSubmissionError(message);
    } finally {
      setIsContributing(false);
    }
  };

  const usdEquivalent =
    !isExchangeRateLoading && exchangeRate > 0
      ? `≈ $${(inputAmount * exchangeRate).toFixed(2)} USD`
      : '';

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <ModalHeader
          title="Contribute to Bounty"
          onClose={onClose}
          subtitle="Support this bounty by contributing ResearchCoin"
        />

        <div className="space-y-6">
          <div>
            <CurrencyInput
              value={getFormattedInputValue()}
              onChange={handleAmountChange}
              error={amountError}
              currency="RSC"
              onCurrencyToggle={() => {}}
              label="I am contributing"
            />
            {!amountError && usdEquivalent && (
              <div className="mt-1.5 text-sm text-gray-500">{usdEquivalent}</div>
            )}
          </div>

          <div>
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Fees Breakdown</h3>
            </div>
            <FeeBreakdown
              rscAmount={inputAmount}
              platformFee={platformFee}
              totalAmount={totalAmount}
            />
          </div>

          <BalanceInfo amount={totalAmount} showWarning={insufficientBalance} />

          {submissionError && <Alert variant="error">{submissionError}</Alert>}

          <Button
            type="button"
            variant="default"
            disabled={
              isContributing ||
              !inputAmount ||
              insufficientBalance ||
              !!amountError ||
              inputAmount < 10
            }
            className="w-full h-12 text-base"
            onClick={handleContribute}
          >
            {isContributing ? 'Contributing...' : 'Contribute to Bounty'}
          </Button>

          <Alert variant="info">
            The bounty creator will be able to award the full bounty amount including
            your contribution to a solution they pick.
          </Alert>
        </div>
      </div>
    </ModalContainer>
  );
}
