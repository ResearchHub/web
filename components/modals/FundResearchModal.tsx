'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import Image from 'next/image';
import { ArrowLeft, CreditCard, ChevronDown, Check } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHexagonImage } from '@fortawesome/pro-solid-svg-icons';
import { Alert } from '@/components/ui/Alert';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { ID } from '@/types/root';

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
type PaymentMethod = 'funding_credits' | 'rsc' | 'credit_card';

// Demo-only mocked wallet: pretend the funder is holding earned funding credits
// alongside a large spendable RSC balance so the funding-credits flow can be
// shown end to end without hitting the backend. RSC ≈ USD 1:1 for the demo.
const MOCK_FUNDING_CREDITS = 5_000;
const MOCK_RSC_BALANCE = 1_000_000;

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

// Amount Step Components
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
}) => (
  <div className="relative">
    <Input
      name="amount"
      value={value}
      onChange={onChange}
      required
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
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      }
    />
    {convertedAmount && <div className="mt-1.5 text-sm text-gray-500">{convertedAmount}</div>}
  </div>
);

// Payment Step Components
const SelectablePaymentOption = ({
  icon,
  title,
  subtitle,
  selected,
  disabled,
  onSelect,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={onSelect}
    disabled={disabled}
    className={cn(
      'flex items-center gap-3 w-full p-4 border rounded-xl text-left transition-colors',
      selected ? 'border-primary-500 bg-primary-50/40' : 'border-gray-200 hover:border-gray-300',
      disabled && 'opacity-50 cursor-not-allowed hover:border-gray-200'
    )}
  >
    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <span className="block font-semibold text-gray-900">{title}</span>
      {subtitle && <span className="block text-sm text-gray-500">{subtitle}</span>}
    </div>
    {selected && <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />}
  </button>
);

const FeeBreakdown = ({
  totalAmount,
  platformFee,
  daoFee,
  incFee,
  baseAmount,
  nftCount,
  isFeesExpanded,
  onToggleExpand,
}: {
  totalAmount: number;
  platformFee: number;
  daoFee: number;
  incFee: number;
  baseAmount: number;
  nftCount: number;
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
      <span className="font-semibold text-gray-900">Net research funding:</span>
      <span className="font-semibold text-gray-900">{baseAmount.toLocaleString()} RSC</span>
    </div>

    <div className="flex justify-between items-center">
      <span className="text-gray-600">NFTs received:</span>
      <span className="font-bold text-blue-600">{nftCount.toLocaleString()}</span>
    </div>
  </div>
);
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

export function FundResearchModal({
  isOpen,
  onClose,
  title,
  nftRewardsEnabled = false,
  nftImageSrc,
  fundraiseId,
}: FundResearchModalProps) {
  const [step, setStep] = useState<Step>('amount');
  const [inputAmount, setInputAmount] = useState(0);
  const [currency, setCurrency] = useState<Currency>('RSC');
  const [isFeesExpanded, setIsFeesExpanded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('funding_credits');
  const [isContributing, setIsContributing] = useState(false);
  const RSC_TO_USD = 1;
  const NFT_THRESHOLD_USD = 1000;

  // Reset transient state whenever the modal re-opens so the demo always
  // starts on the amount step with funding credits preselected.
  useEffect(() => {
    if (isOpen) {
      setStep('amount');
      setInputAmount(0);
      setCurrency('RSC');
      setPaymentMethod('funding_credits');
      setIsContributing(false);
    }
  }, [isOpen]);

  // Utility functions
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-numeric characters except decimal point
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

  const getRscAmount = (): number => {
    return currency === 'RSC' ? inputAmount : inputAmount / RSC_TO_USD;
  };

  const getNFTCount = () => {
    const amountUSD = getRscAmount() * RSC_TO_USD;
    return Math.floor(amountUSD / NFT_THRESHOLD_USD);
  };

  // Demo-only: skip the real payment intent / contribution request entirely.
  // A short delay stands in for "processing", then we surface a success toast
  // and close, mirroring the scripted funding-credits demo flow.
  const handleCreateContribution = async () => {
    setIsContributing(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsContributing(false);
    toast.success('Your contribution has been successfully added to the fundraise.');
    onClose();
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

  const formatRscBalance = (rsc: number) => (
    <>
      <span className="text-gray-700 font-medium">${(rsc * RSC_TO_USD).toLocaleString()}</span>
      <span className="text-gray-500"> · {rsc.toLocaleString()} RSC</span>
    </>
  );

  const getSelectedBalance = () => {
    if (paymentMethod === 'funding_credits') return MOCK_FUNDING_CREDITS;
    if (paymentMethod === 'rsc') return MOCK_RSC_BALANCE;
    return Infinity;
  };

  const renderPaymentStep = () => {
    const rscAmount = getRscAmount();
    const selectedBalance = getSelectedBalance();
    const insufficientBalance = rscAmount > selectedBalance;

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
            totalAmount={rscAmount}
            platformFee={platformFee}
            daoFee={daoFee}
            incFee={incFee}
            baseAmount={baseAmount}
            nftCount={nftCount}
            isFeesExpanded={isFeesExpanded}
            onToggleExpand={() => setIsFeesExpanded(!isFeesExpanded)}
          />
        </div>

        <div className="space-y-3">
          <SelectablePaymentOption
            icon={<ResearchCoinIcon size={22} variant="green" outlined />}
            title="Funding Credits"
            subtitle={formatRscBalance(MOCK_FUNDING_CREDITS)}
            selected={paymentMethod === 'funding_credits'}
            onSelect={() => setPaymentMethod('funding_credits')}
          />
          <SelectablePaymentOption
            icon={<ResearchCoinIcon size={22} />}
            title="ResearchCoin"
            subtitle={formatRscBalance(MOCK_RSC_BALANCE)}
            selected={paymentMethod === 'rsc'}
            onSelect={() => setPaymentMethod('rsc')}
          />
          <SelectablePaymentOption
            icon={<CreditCard className="w-[22px] h-[22px] text-gray-600" />}
            title="Credit Card"
            subtitle="Visa, Mastercard"
            selected={paymentMethod === 'credit_card'}
            onSelect={() => setPaymentMethod('credit_card')}
          />
        </div>

        {nftRewardsEnabled && nftCount > 0 && (
          <Alert className="mt-6" variant="info">
            You will receive {nftCount} NFT{nftCount !== 1 ? 's' : ''} for this contribution
          </Alert>
        )}

        {(paymentMethod === 'funding_credits' || paymentMethod === 'rsc') && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {paymentMethod === 'funding_credits'
                  ? 'Available funding credits:'
                  : 'Available RSC balance:'}
              </span>
              <span className="text-sm font-medium">{selectedBalance.toLocaleString()} RSC</span>
            </div>
            {insufficientBalance && (
              <div className="mt-1 text-sm text-orange-600">
                {`You need ${(rscAmount - selectedBalance).toLocaleString()} RSC more for this contribution`}
              </div>
            )}
          </div>
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
