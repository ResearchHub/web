'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { ChevronDown } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';
import { Currency, ID } from '@/types/root';
import { BalanceInfo } from './BalanceInfo';
import { useSession } from 'next-auth/react';
import { BountyService } from '@/services/bounty.service';
import { toast } from 'react-hot-toast';
import { ContentType } from '@/types/work';
import { BountyType } from '@/types/bounty';
import { Comment } from '@/types/comment';
import { useComments } from '@/contexts/CommentContext';
import { useUser } from '@/contexts/UserContext';

interface ContributeBountyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContributeSuccess?: () => void;
  commentId: ID;
  documentId: number;
  contentType: ContentType;
  bountyTitle?: string;
  bountyType: BountyType;
  expirationDate: string;
}

// Currency Input Component
const CurrencyInput = ({
  value,
  onChange,
  currency,
  onCurrencyToggle,
  convertedAmount,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currency: Currency;
  onCurrencyToggle: () => void;
  convertedAmount?: string;
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
        className="w-full text-left h-12 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        rightElement={
          <button
            type="button"
            onClick={onCurrencyToggle}
            className="flex items-center gap-1 pr-3 text-gray-900 hover:text-gray-600"
          >
            <span className="font-medium">{currency}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        }
      />
      {convertedAmount && <div className="mt-1.5 text-sm text-gray-500">{convertedAmount}</div>}
    </div>
  );
};

// Fee Breakdown Component
const FeeBreakdown = ({
  totalAmount,
  platformFee,
  daoFee,
  incFee,
  baseAmount,
  isFeesExpanded,
  onToggleExpand,
}: {
  totalAmount: number;
  platformFee: number;
  daoFee: number;
  incFee: number;
  baseAmount: number;
  isFeesExpanded: boolean;
  onToggleExpand: () => void;
}) => (
  <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
    <div className="flex justify-between items-center">
      <span className="text-gray-900">Your contribution:</span>
      <span className="text-gray-900">{totalAmount.toLocaleString()} RSC</span>
    </div>

    <div>
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-1">
          <span className="text-gray-600">Platform fees (9%)</span>
          <div className="flex items-center gap-1">
            <ChevronDown
              className={cn(
                'w-4 h-4 text-gray-500 transition-transform',
                isFeesExpanded && 'transform rotate-180'
              )}
            />
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
        </div>
        <span className="text-gray-600">{platformFee.toLocaleString()} RSC</span>
      </button>

      {isFeesExpanded && (
        <div className="mt-2 pl-0 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 pl-0">ResearchHub DAO (2%)</span>
            <span className="text-gray-500">{daoFee.toLocaleString()} RSC</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 pl-0">ResearchHub Inc (7%)</span>
            <span className="text-gray-500">{incFee.toLocaleString()} RSC</span>
          </div>
        </div>
      )}
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
  const [inputAmount, setInputAmount] = useState(0);
  const [currency, setCurrency] = useState<Currency>('RSC');
  const [isFeesExpanded, setIsFeesExpanded] = useState(false);
  const [isContributing, setIsContributing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const RSC_TO_USD = 1;
  const userBalance = user?.balance || 0;

  // Get the emitCommentEvent function from CommentContext
  const { emitCommentEvent } = useComments();

  // Utility functions
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    const numValue = parseFloat(rawValue);

    if (!isNaN(numValue)) {
      setInputAmount(numValue);
    } else {
      setInputAmount(0);
    }
  };

  const getFormattedInputValue = () => {
    if (inputAmount === 0) return '';
    return inputAmount.toLocaleString();
  };

  const toggleCurrency = () => {
    setCurrency(currency === 'RSC' ? 'USD' : 'RSC');
  };

  const getConvertedAmount = () => {
    if (inputAmount === 0) return '';
    return currency === 'RSC'
      ? `≈ $${(inputAmount * RSC_TO_USD).toLocaleString()} USD`
      : `≈ ${(inputAmount / RSC_TO_USD).toLocaleString()} RSC`;
  };

  const getRscAmount = () => {
    return currency === 'RSC' ? inputAmount : inputAmount / RSC_TO_USD;
  };

  const handleContribute = async () => {
    try {
      setIsContributing(true);
      setError(null);

      const rscAmount = getRscAmount();

      const contribution = await BountyService.contributeToBounty(
        commentId,
        rscAmount,
        'rhcommentmodel',
        bountyType,
        expirationDate
      );

      // Use emitCommentEvent instead of commentEvents.emit
      emitCommentEvent('comment_updated', {
        comment: { id: commentId } as Comment,
        contentType,
        documentId,
      });

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

  const rscAmount = getRscAmount();
  const platformFee = Math.round(rscAmount * 0.09 * 100) / 100;
  const daoFee = Math.round(rscAmount * 0.02 * 100) / 100;
  const incFee = Math.round(rscAmount * 0.07 * 100) / 100;
  const baseAmount = rscAmount - platformFee;
  const insufficientBalance = userBalance < rscAmount;

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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                        currency={currency}
                        onCurrencyToggle={toggleCurrency}
                        convertedAmount={getConvertedAmount()}
                      />
                    </div>

                    {/* Fees Breakdown */}
                    <div>
                      <div className="mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">Fees Breakdown</h3>
                      </div>
                      <FeeBreakdown
                        totalAmount={rscAmount}
                        platformFee={platformFee}
                        daoFee={daoFee}
                        incFee={incFee}
                        baseAmount={baseAmount}
                        isFeesExpanded={isFeesExpanded}
                        onToggleExpand={() => setIsFeesExpanded(!isFeesExpanded)}
                      />
                    </div>

                    {/* Balance Info */}
                    <div>
                      <BalanceInfo amount={rscAmount} showWarning={insufficientBalance} />
                    </div>

                    {/* Error Alert */}
                    {error && <Alert variant="error">{error}</Alert>}

                    {/* Contribute Button */}
                    <Button
                      type="button"
                      variant="default"
                      disabled={isContributing || !inputAmount || insufficientBalance}
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
