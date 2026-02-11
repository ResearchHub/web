'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Alert } from '@/components/ui/Alert';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';
import { Currency, ID } from '@/types/root';
import { BalanceInfo } from './BalanceInfo';
import { BountyService } from '@/services/bounty.service';
import { toast } from 'react-hot-toast';
import { ContentType } from '@/types/work';
import { BountyType } from '@/types/bounty';
import { useUser } from '@/contexts/UserContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';

import { FeeBreakdown } from '../Bounty/lib/FeeBreakdown';

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

import { CurrencyInput } from '@/components/ui/form/CurrencyInput';

const ModalHeader = ({
  title,
  onClose,
  subtitle,
}: {
  title: string;
  onClose: () => void;
  subtitle?: string;
}) => (
  <div className="border-b border-gray-200 -mx-6 px-6 pb-4 mb-6">
    <div className="flex justify-between items-center">
      <div>
        <Dialog.Title as="h2" className="text-xl font-semibold text-gray-900">
          {title}
        </Dialog.Title>
        {subtitle && <p className="text-sm font-medium text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <button type="button" className="text-gray-400 hover:text-gray-500" onClick={onClose}>
        <span className="sr-only">Close</span>
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
);

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
  const [inputAmount, setInputAmount] = useState(50);
  const [isContributing, setIsContributing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [amountError, setAmountError] = useState<string | undefined>(undefined);

  const userBalance = user?.balance || 0;

  // Utility functions
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    const numValue = parseFloat(rawValue);

    if (!isNaN(numValue)) {
      setInputAmount(numValue);

      // Validate minimum amount
      if (numValue < 10) {
        setAmountError('Minimum contribution amount is 10 RSC');
      } else {
        setAmountError(undefined);
      }
    } else {
      setInputAmount(0);
      setAmountError(undefined);
    }
  };

  const getFormattedInputValue = () => {
    if (inputAmount === 0) return '';
    return inputAmount.toLocaleString();
  };

  const handleCurrencyToggle = () => {
    // Only support RSC for now in this modal
  };

  const handleContribute = async () => {
    try {
      // Validate minimum amount before proceeding
      if (inputAmount < 10) {
        setError('Minimum contribution amount is 10 RSC');
        return;
      }

      setIsContributing(true);
      setError(null);

      // Pass the contribution amount without the platform fee
      // The API expects the net contribution amount
      const contribution = await BountyService.contributeToBounty(
        commentId,
        inputAmount,
        'rhcommentmodel',
        bountyType,
        expirationDate || new Date().toISOString()
      );

      toast.success('Your contribution has been successfully added to the bounty.');

      // Set success flag
      setIsSuccess(true);

      // Call onContributeSuccess if provided
      if (onContributeSuccess) {
        onContributeSuccess();
      }

      // Close the modal
      onClose();
    } catch (error) {
      console.error('Failed to contribute to bounty:', error);
      setError(error instanceof Error ? error.message : 'Failed to contribute to bounty');
    } finally {
      setIsContributing(false);
    }
  };

  const platformFee = Math.round(inputAmount * 0.09 * 100) / 100;
  const totalAmount = inputAmount + platformFee;
  const insufficientBalance = userBalance < totalAmount;

  // Calculate USD equivalent for display
  const usdEquivalent =
    !isExchangeRateLoading && exchangeRate > 0
      ? `≈ $${(inputAmount * exchangeRate).toFixed(2)} USD`
      : '';

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[100]"
        onClose={() => {
          // Reset success flag when modal is closed without contribution
          if (!isSuccess) {
            setIsSuccess(false);
          }
          onClose();
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black !bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="p-6">
                  <ModalHeader
                    title="Contribute to Bounty"
                    onClose={onClose}
                    subtitle="Support this bounty by contributing ResearchCoin"
                  />

                  <div className="space-y-6">
                    {/* Amount Section */}
                    <div>
                      <CurrencyInput
                        value={getFormattedInputValue()}
                        onChange={handleAmountChange}
                        error={amountError}
                        currency="RSC"
                        onCurrencyToggle={handleCurrencyToggle}
                        label="I am contributing"
                      />
                      {!amountError && usdEquivalent && (
                        <div className="mt-1.5 text-sm text-gray-500">{usdEquivalent}</div>
                      )}
                    </div>

                    {/* Fees Breakdown */}
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

                    {/* Balance Info */}
                    <div>
                      <BalanceInfo amount={totalAmount} showWarning={insufficientBalance} />
                    </div>

                    {/* Error Alert */}
                    {error && <Alert variant="error">{error}</Alert>}

                    {/* Contribute Button */}
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

                    {/* Info Alert */}
                    <Alert variant="info">
                      <div className="flex items-center gap-3">
                        <span>
                          The bounty creator will be able to award the full bounty amount including
                          your contribution to a solution they pick.
                        </span>
                      </div>
                    </Alert>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
