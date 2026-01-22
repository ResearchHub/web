'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Alert } from '@/components/ui/Alert';
import { toast } from 'react-hot-toast';
import { FundraiseService } from '@/services/fundraise.service';
import { useUser } from '@/contexts/UserContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { Fundraise } from '@/types/funding';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { DollarSign, X, ArrowLeft } from 'lucide-react';
import {
  WalletCurrencySelector,
  FeeLineItem,
  InsufficientBalanceAlert,
  type ContributionCurrency,
} from '@/components/Funding';

// Import inline deposit views (same content as DepositOptionsModal)
import { DepositOptionsView } from './DepositOptionsView';
import { DepositRSCView } from './DepositRSCView';
import { WireTransferView } from './WireTransferView';
import { BankAccountView } from './BankAccountView';

interface ContributeToFundraiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContributeSuccess?: () => void;
  fundraise: Fundraise;
  /** Title of the proposal being funded */
  proposalTitle?: string;
}

type ModalView = 'contribute' | 'deposit-options' | 'deposit-rsc' | 'deposit-bank' | 'deposit-wire';

// Currency Input Component
const CurrencyInput = ({
  value,
  onChange,
  error,
  currency,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  currency: ContributionCurrency;
}) => {
  return (
    <div className="relative">
      <Input
        name="amount"
        value={value}
        onChange={onChange}
        required
        label="Amount"
        placeholder="0.00"
        type="text"
        inputMode="numeric"
        className={`w-full text-left h-12 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${error ? 'border-red-500' : ''}`}
        rightElement={
          <div className="flex items-center gap-1.5 pr-3 text-gray-900">
            {currency === 'RSC' ? (
              <>
                <ResearchCoinIcon size={16} />
                <span className="font-medium">RSC</span>
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-medium">USD</span>
              </>
            )}
          </div>
        }
      />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Modal Header Component with optional back button and subtitle
const ModalHeader = ({
  title,
  subtitle,
  onClose,
  onBack,
  showBackButton = false,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}) => (
  <div className="border-b border-gray-200 px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {showBackButton && onBack && (
          <button
            type="button"
            className="p-1 -ml-1 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <Dialog.Title as="h2" className="text-lg font-semibold text-gray-900">
          {title}
        </Dialog.Title>
      </div>
      <button
        type="button"
        className="p-1 text-gray-400 hover:text-gray-500 transition-colors"
        onClick={onClose}
      >
        <span className="sr-only">Close</span>
        <X className="h-5 w-5" />
      </button>
    </div>
    {subtitle && <p className="mt-1 text-sm text-gray-500 line-clamp-2">{subtitle}</p>}
  </div>
);

export function ContributeToFundraiseModal({
  isOpen,
  onClose,
  onContributeSuccess,
  fundraise,
  proposalTitle,
}: ContributeToFundraiseModalProps) {
  const { user, refreshUser } = useUser();
  const { exchangeRate } = useExchangeRate();
  const [inputAmount, setInputAmount] = useState(100);
  const [isContributing, setIsContributing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | undefined>(undefined);
  const [selectedCurrency, setSelectedCurrency] = useState<ContributionCurrency>('RSC');
  const [currentView, setCurrentView] = useState<ModalView>('contribute');

  // Get balance from new user fields
  const rscBalance = user?.rscBalance ?? 0;
  const usdCents = user?.usdCents ?? 0;

  // Calculate RSC balance in USD cents for display
  const rscBalanceUsdCents = exchangeRate ? Math.round(rscBalance * exchangeRate * 100) : undefined;

  // Fee percentages: 9% for RSC, 12% for USD
  const feePercentage = selectedCurrency === 'RSC' ? 9 : 12;

  // Calculate fee and total
  const platformFee = Math.round(inputAmount * (feePercentage / 100) * 100) / 100;
  const totalAmount = inputAmount + platformFee;

  // Check for insufficient balance based on currency
  const insufficientBalance =
    selectedCurrency === 'RSC' ? rscBalance < totalAmount : usdCents / 100 < totalAmount;

  const minAmount = selectedCurrency === 'RSC' ? 10 : 1;

  // Handlers
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    const numValue = parseFloat(rawValue);

    if (!isNaN(numValue)) {
      setInputAmount(numValue);
      const currencyLabel = selectedCurrency === 'RSC' ? 'RSC' : 'USD';
      if (numValue < minAmount) {
        setAmountError(`Minimum contribution is ${minAmount} ${currencyLabel}`);
      } else {
        setAmountError(undefined);
      }
    } else {
      setInputAmount(0);
      setAmountError('Please enter a valid amount');
    }
  };

  const handleCurrencyChange = (currency: ContributionCurrency) => {
    setSelectedCurrency(currency);
    const newMinAmount = currency === 'RSC' ? 10 : 1;
    const currencyLabel = currency === 'RSC' ? 'RSC' : 'USD';
    if (inputAmount < newMinAmount) {
      setAmountError(`Minimum contribution is ${newMinAmount} ${currencyLabel}`);
    } else {
      setAmountError(undefined);
    }
  };

  const getFormattedInputValue = () => {
    if (inputAmount === 0) return '';
    return inputAmount.toLocaleString();
  };

  const handleDepositSuccess = useCallback(() => {
    refreshUser?.();
    setCurrentView('contribute');
  }, [refreshUser]);

  const handleContribute = async () => {
    try {
      const currentMinAmount = selectedCurrency === 'RSC' ? 10 : 1;
      if (inputAmount < currentMinAmount) {
        setError(`Minimum contribution is ${currentMinAmount} ${selectedCurrency}`);
        return;
      }

      setIsContributing(true);
      setError(null);

      await FundraiseService.contributeToFundraise(
        fundraise.id,
        inputAmount,
        selectedCurrency.toLowerCase() as 'usd' | 'rsc'
      );

      toast.success('Your contribution has been successfully added to the fundraise.');

      if (onContributeSuccess) {
        onContributeSuccess();
      }

      onClose();
    } catch (err) {
      console.error('Failed to contribute to fundraise:', err);
      setError(err instanceof Error ? err.message : 'Failed to contribute to fundraise');
    } finally {
      setIsContributing(false);
    }
  };

  const handleOpenDepositOptions = useCallback(() => {
    setCurrentView('deposit-options');
  }, []);

  const handleBack = useCallback(() => {
    if (
      currentView === 'deposit-rsc' ||
      currentView === 'deposit-bank' ||
      currentView === 'deposit-wire'
    ) {
      setCurrentView('deposit-options');
    } else if (currentView === 'deposit-options') {
      setCurrentView('contribute');
    }
  }, [currentView]);

  const handleClose = useCallback(() => {
    setCurrentView('contribute');
    onClose();
  }, [onClose]);

  const handleDepositOptionSelect = useCallback((option: 'rsc' | 'bank' | 'wire') => {
    switch (option) {
      case 'rsc':
        setCurrentView('deposit-rsc');
        break;
      case 'bank':
        setCurrentView('deposit-bank');
        break;
      case 'wire':
        setCurrentView('deposit-wire');
        break;
    }
  }, []);

  // Get title based on current view
  const getTitle = () => {
    switch (currentView) {
      case 'contribute':
        return 'Fund Proposal';
      case 'deposit-options':
        return 'Add Funds';
      case 'deposit-rsc':
        return 'Deposit RSC';
      case 'deposit-bank':
        return 'Bank Account';
      case 'deposit-wire':
        return 'Wire Transfer';
      default:
        return 'Fund Proposal';
    }
  };

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'deposit-options':
        return <DepositOptionsView onSelect={handleDepositOptionSelect} />;

      case 'deposit-rsc':
        return <DepositRSCView currentBalance={rscBalance} onSuccess={handleDepositSuccess} />;

      case 'deposit-bank':
        return <BankAccountView />;

      case 'deposit-wire':
        return <WireTransferView />;

      case 'contribute':
      default:
        return (
          <div className="space-y-4">
            {/* Wallet-style Currency Selector */}
            <WalletCurrencySelector
              selectedCurrency={selectedCurrency}
              onCurrencyChange={handleCurrencyChange}
              rscBalance={rscBalance}
              usdCents={usdCents}
              rscBalanceUsdCents={rscBalanceUsdCents}
              onAddFunds={handleOpenDepositOptions}
            />

            {/* Amount Input */}
            <CurrencyInput
              value={getFormattedInputValue()}
              onChange={handleAmountChange}
              error={amountError}
              currency={selectedCurrency}
            />

            {/* Fee and Total */}
            {inputAmount > 0 && !amountError && (
              <FeeLineItem
                amount={inputAmount}
                currency={selectedCurrency}
                feePercentage={feePercentage}
              />
            )}

            {/* Insufficient Balance Alert */}
            {insufficientBalance && inputAmount > 0 && !amountError && (
              <InsufficientBalanceAlert onAddFunds={handleOpenDepositOptions} />
            )}

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
                inputAmount < minAmount
              }
              className="w-full h-12 text-base"
              onClick={handleContribute}
            >
              {isContributing ? 'Funding...' : 'Fund Proposal'}
            </Button>
          </div>
        );
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <ModalHeader
                  title={getTitle()}
                  subtitle={currentView === 'contribute' ? proposalTitle : undefined}
                  onClose={handleClose}
                  onBack={handleBack}
                  showBackButton={currentView !== 'contribute'}
                />

                <div className="p-6">{renderContent()}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
