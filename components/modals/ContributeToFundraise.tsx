'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Alert } from '@/components/ui/Alert';
import { Tooltip } from '@/components/ui/Tooltip';
import { Currency, ID } from '@/types/root';
import { BalanceInfo } from './BalanceInfo';
import { toast } from 'react-hot-toast';
import { FundraiseService } from '@/services/fundraise.service';
import { useUser } from '@/contexts/UserContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { Fundraise } from '@/types/funding';

interface ContributeToFundraiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContributeSuccess?: () => void;
  fundraise: Fundraise;
}

// Currency Input Component
const CurrencyInput = ({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) => {
  return (
    <div className="relative">
      <Input
        name="amount"
        value={value}
        onChange={onChange}
        required
        label="I am contributing"
        placeholder="0.00"
        type="text"
        inputMode="numeric"
        className={`w-full text-left h-12 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${error ? 'border-red-500' : ''}`}
        rightElement={
          <div className="flex items-center gap-1 pr-3 text-gray-900">
            <span className="font-medium">RSC</span>
          </div>
        }
      />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Fee Breakdown Component
const FeeBreakdown = ({
  totalAmount,
  platformFee,
  baseAmount,
}: {
  totalAmount: number;
  platformFee: number;
  baseAmount: number;
}) => (
  <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
    <div className="flex justify-between items-center">
      <span className="text-gray-900">Your contribution:</span>
      <span className="text-gray-900">{totalAmount.toLocaleString()} RSC</span>
    </div>

    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-gray-600">Platform fees (9%)</span>
          <Tooltip
            content="Platform fees help support ResearchHub's operations and development"
            className="max-w-xs"
          >
            <div className="text-gray-400 hover:text-gray-500">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </Tooltip>
        </div>
        <span className="text-gray-600">{platformFee.toLocaleString()} RSC</span>
      </div>
    </div>

    <div className="border-t border-gray-200" />

    <div className="flex justify-between items-center">
      <span className="font-semibold text-gray-900">Net contribution amount:</span>
      <span className="font-semibold text-gray-900">{baseAmount.toLocaleString()} RSC</span>
    </div>
  </div>
);

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

export function ContributeToFundraiseModal({
  isOpen,
  onClose,
  onContributeSuccess,
  fundraise,
}: ContributeToFundraiseModalProps) {
  const { user } = useUser();
  const [inputAmount, setInputAmount] = useState(100);
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
      setAmountError('Please enter a valid amount');
    }
  };

  const getFormattedInputValue = () => {
    if (inputAmount === 0) return '';
    return inputAmount.toLocaleString();
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

      await FundraiseService.contributeToFundraise(fundraise.id, inputAmount);

      toast.success('Your contribution has been successfully added to the fundraise.');

      // Set success flag
      setIsSuccess(true);

      // Call onContributeSuccess if provided
      if (onContributeSuccess) {
        onContributeSuccess();
      }

      // Close the modal
      onClose();
    } catch (error) {
      console.error('Failed to contribute to fundraise:', error);
      setError(error instanceof Error ? error.message : 'Failed to contribute to fundraise');
    } finally {
      setIsContributing(false);
    }
  };

  const platformFee = Math.round(inputAmount * 0.09 * 100) / 100;
  const baseAmount = inputAmount - platformFee;
  const insufficientBalance = userBalance < inputAmount;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
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
                    title="Contribute to Fundraise"
                    onClose={onClose}
                    subtitle="Support this fundraise by contributing ResearchCoin"
                  />

                  <div className="space-y-6">
                    {/* Amount Section */}
                    <div>
                      <CurrencyInput
                        value={getFormattedInputValue()}
                        onChange={handleAmountChange}
                        error={amountError}
                      />
                    </div>

                    {/* Fees Breakdown */}
                    <div>
                      <div className="mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">Fees Breakdown</h3>
                      </div>
                      <FeeBreakdown
                        totalAmount={inputAmount}
                        platformFee={platformFee}
                        baseAmount={baseAmount}
                      />
                    </div>

                    {/* Balance Info */}
                    <div>
                      <BalanceInfo amount={inputAmount} showWarning={insufficientBalance} />
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
                      {isContributing ? 'Contributing...' : 'Contribute to Fundraise'}
                    </Button>

                    {/* Info Alert */}
                    <Alert variant="info">
                      <div className="flex items-center gap-3">
                        <span>
                          Your contribution will help this fundraise reach its goal of{' '}
                          {fundraise.goalCurrency === 'RSC'
                            ? `${fundraise.goalAmount.rsc.toLocaleString()} RSC`
                            : `$${fundraise.goalAmount.usd.toLocaleString()} USD`}
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
