'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import Image from 'next/image';
import { ArrowLeft, ArrowDownToLine, CreditCard, ChevronDown } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHexagonImage } from '@fortawesome/pro-solid-svg-icons';
import { Alert } from '@/components/ui/Alert';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';
import { useCreateContribution } from '@/hooks/useFundraise';
import { useSession } from 'next-auth/react';
import { BalanceInfo } from './BalanceInfo';
import { ID } from '@/types/root';
import { useUser } from '@/contexts/UserContext';
import { FeeBreakdown } from '../Bounty/lib/FeeBreakdown';

interface FundResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  nftRewardsEnabled?: boolean;
  nftImageSrc?: string;
  fundraiseId: ID;
}

type Currency = 'RSC' | 'USD';
type Step = 'amount' | 'payment';

const ModalHeader = ({
  title,
  onClose,
  onBack,
}: {
  title: string;
  onClose: () => void;
  onBack?: () => void;
}) => (
  <div className="border-b border-gray-200 -mx-6 px-6 pb-4 mb-6">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        {onBack && (
          <button type="button" onClick={onBack} className="text-gray-500 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <Dialog.Title as="h2" className="text-xl font-semibold text-gray-900">
          {title}
        </Dialog.Title>
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

import { CurrencyInput } from '@/components/ui/form/CurrencyInput';

// Payment Step Components
const PaymentOption = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) => (
  <button className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl hover:border-gray-300 w-full">
    <div className="w-6 h-6 text-gray-700 mb-3">{icon}</div>
    <span className="font-semibold text-gray-900">{title}</span>
    {subtitle && <span className="text-sm text-gray-500 mt-1">{subtitle}</span>}
  </button>
);

const PaymentIcons = {
  card: <CreditCard className="w-6 h-6" />,
  deposit: <ArrowDownToLine className="w-6 h-6" />,
};

const NFTPreview = ({ rscAmount, nftCount }: { rscAmount: number; nftCount: number }) => (
  <div className="mt-4 bg-gray-50 rounded-lg p-4 space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">Your contribution:</span>
      <span className="text-sm font-medium">{rscAmount.toLocaleString()} RSC</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">NFTs will receive:</span>
      <span className="text-sm font-bold text-blue-600">{nftCount.toLocaleString()}</span>
    </div>
  </div>
);

import { useAmountInput } from '@/hooks/useAmountInput';

export function FundResearchModal({
  isOpen,
  onClose,
  title,
  nftRewardsEnabled = false,
  nftImageSrc,
  fundraiseId,
}: FundResearchModalProps) {
  const { user } = useUser();
  const userBalance = user?.balance || 0;
  const [step, setStep] = useState<Step>('amount');

  const {
    amount: inputAmount,
    setAmount: setInputAmount,
    handleAmountChange,
    getFormattedValue: getFormattedInputValue,
  } = useAmountInput();

  const [currency, setCurrency] = useState<Currency>('RSC');
  const [isFeesExpanded, setIsFeesExpanded] = useState(false);
  const RSC_TO_USD = 1;
  const NFT_THRESHOLD_USD = 1000;

  const [
    { data: contributionData, isLoading: isContributing, error: contributionError },
    createContribution,
  ] = useCreateContribution();

  const toggleCurrency = () => {
    setCurrency(currency === 'RSC' ? 'USD' : 'RSC');
  };

  const getConvertedAmount = () => {
    if (inputAmount === 0) return '';
    return currency === 'RSC'
      ? `≈ $${(inputAmount * RSC_TO_USD).toLocaleString()} USD`
      : `≈ ${(inputAmount / RSC_TO_USD).toLocaleString()} RSC`;
  };

  const getRscAmount = (): number => {
    return currency === 'RSC' ? inputAmount : inputAmount / RSC_TO_USD;
  };

  const getNFTCount = () => {
    const amountUSD = getRscAmount() * RSC_TO_USD;
    return Math.floor(amountUSD / NFT_THRESHOLD_USD);
  };

  const handleCreateContribution = async () => {
    try {
      await createContribution(fundraiseId, {
        amount: getRscAmount(),
        amount_currency: currency,
      });

      onClose();
    } catch (error) {
      // Error is handled by the hook
      console.error('Contribution failed:', error);
    }
  };

  // Step rendering functions
  const renderAmountStep = () => (
    <div className="p-6">
      <ModalHeader title="Fund Research" onClose={onClose} />
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>

        {nftRewardsEnabled && nftImageSrc && (
          <div className="mb-6 flex justify-center">
            <div className="relative w-[240px] h-[240px] overflow-hidden bg-gray-100 rounded-xl border border-gray-200/60 shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-shadow duration-200">
              <Image
                src={nftImageSrc}
                alt={title || 'Research funding'}
                fill
                className="object-cover"
                sizes="240px"
                quality={95}
              />
              <div className="absolute bottom-3 right-3 bg-white/90 text-gray-900 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-gray-200/50 shadow-sm">
                <FontAwesomeIcon icon={faHexagonImage} className="h-4 w-4 text-gray-700" />
                <span className="text-sm font-medium">NFT</span>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <Alert variant="special">
            {nftRewardsEnabled ? (
              <p className="text-green-700">
                Contributions of $500 or more will receive a limited edition acknowledgement NFT.
              </p>
            ) : (
              <p className="text-green-700">
                Your contribution will directly support groundbreaking research and advance open
                science.
              </p>
            )}
          </Alert>
        </div>

        <div className="mt-6 mb-6">
          <CurrencyInput
            value={getFormattedInputValue()}
            onChange={handleAmountChange}
            currency={currency}
            onCurrencyToggle={toggleCurrency}
            convertedAmount={getConvertedAmount()}
            label=""
          />
          {inputAmount > 1 && nftRewardsEnabled && (
            <NFTPreview rscAmount={getRscAmount()} nftCount={getNFTCount()} />
          )}
        </div>

        <Button
          type="submit"
          variant="default"
          disabled={!inputAmount}
          className="w-full h-12 text-base"
          onClick={() => setStep('payment')}
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderPaymentStep = () => {
    const rscAmount = getRscAmount();
    const insufficientBalance = userBalance < rscAmount;

    const platformFee = Math.floor(rscAmount * 0.09);
    const daoFee = Math.floor(rscAmount * 0.02);
    const incFee = Math.floor(rscAmount * 0.07);
    const baseAmount = rscAmount - platformFee;
    const nftCount = nftRewardsEnabled ? Math.floor(rscAmount / NFT_THRESHOLD_USD) : 0;

    return (
      <div className="p-6">
        <ModalHeader title="Fund Research" onClose={onClose} onBack={() => setStep('amount')} />
        <div className="mt-6 mb-6">
          <FeeBreakdown
            rscAmount={rscAmount}
            platformFee={platformFee}
            daoFee={daoFee}
            incFee={incFee}
            baseAmount={baseAmount}
            isExpanded={isFeesExpanded}
            onToggleExpand={() => setIsFeesExpanded(!isFeesExpanded)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <PaymentOption icon={PaymentIcons.card} title="Card" subtitle="Visa, Mastercard" />
          <PaymentOption icon={PaymentIcons.deposit} title="Deposit" subtitle="Bank transfer" />
        </div>

        {nftRewardsEnabled && nftCount > 0 && (
          <Alert className="mt-6" variant="info">
            You will receive {nftCount} NFT{nftCount !== 1 ? 's' : ''} for this contribution
          </Alert>
        )}

        <div className="mt-6">
          <BalanceInfo amount={rscAmount} showWarning={insufficientBalance} />
        </div>

        {contributionError && (
          <Alert className="mt-4" variant="error">
            {contributionError}
          </Alert>
        )}

        <Button
          type="button"
          variant="default"
          disabled={isContributing || insufficientBalance}
          className="w-full h-12 text-base mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleCreateContribution}
        >
          {isContributing ? 'Processing...' : 'Confirm Payment'}
        </Button>
      </div>
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
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
                {step === 'amount' ? renderAmountStep() : renderPaymentStep()}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
