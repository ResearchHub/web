'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { FundraiseService } from '@/services/fundraise.service';
import { useUser } from '@/contexts/UserContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { Fundraise } from '@/types/funding';
import { X, ArrowLeft, DollarSign } from 'lucide-react';
import {
  PaymentStep,
  FundingImpactPreview,
  QuickAmountSelector,
  type PaymentMethodType,
} from '@/components/Funding';
import { Input } from '@/components/ui/form/Input';
import { Button } from '@/components/ui/Button';

// Import inline deposit views
import { DepositRSCView } from './DepositRSCView';
import { BuyModal } from './ResearchCoin/BuyModal';

interface ContributeToFundraiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContributeSuccess?: () => void;
  fundraise: Fundraise;
  /** Title of the proposal being funded */
  proposalTitle?: string;
}

type ModalView = 'funding' | 'payment' | 'deposit-rsc';

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
  const [amountUsd, setAmountUsd] = useState(100);
  const [isContributing, setIsContributing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | undefined>(undefined);
  const [currentView, setCurrentView] = useState<ModalView>('funding');
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSliderControlled, setIsSliderControlled] = useState(false);

  // Get balance from user fields
  const rscBalance = user?.rscBalance ?? 0;

  // Calculate conversions
  const rscToUsd = (rsc: number) => (exchangeRate ? rsc * exchangeRate : 0);
  const usdToRsc = (usd: number) => (exchangeRate ? usd / exchangeRate : 0);

  // Get amount in RSC (derived from USD amount)
  const amountInRsc = usdToRsc(amountUsd);

  const minAmountUsd = 1;

  // Format helpers
  const formatUsd = (amount: number) => {
    return `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Handlers
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    const numValue = parseFloat(rawValue);

    if (!isNaN(numValue)) {
      setAmountUsd(numValue);
      setSelectedQuickAmount(null);
      setIsSliderControlled(false); // Input sets scaled visual mode

      if (numValue < minAmountUsd) {
        setAmountError(`Minimum contribution is $${minAmountUsd}`);
      } else {
        setAmountError(undefined);
      }
    } else {
      setAmountUsd(0);
      setAmountError('Please enter a valid amount');
    }
  };

  const getFormattedInputValue = () => {
    if (amountUsd === 0) return '';
    return amountUsd.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const handleDepositSuccess = useCallback(() => {
    refreshUser?.();
    setCurrentView('payment');
  }, [refreshUser]);

  const handleContinueToPayment = useCallback(() => {
    setCurrentView('payment');
  }, []);

  const handleConfirmPayment = async (
    paymentMethod: Exclude<PaymentMethodType, 'endaoment' | 'other'>
  ) => {
    try {
      if (amountUsd < minAmountUsd) {
        setError(`Minimum contribution is $${minAmountUsd}`);
        return;
      }

      setIsContributing(true);
      setError(null);

      if (paymentMethod === 'rsc') {
        await FundraiseService.contributeToFundraise(fundraise.id, amountInRsc, 'rsc');
        toast.success('Your contribution has been successfully added to the fundraise.');
      } else if (
        paymentMethod === 'credit_card' ||
        paymentMethod === 'apple_pay' ||
        paymentMethod === 'google_pay' ||
        paymentMethod === 'paypal'
      ) {
        // TODO: Implement payment processing when backend is ready
        toast.error('This payment method is not yet available. Please use ResearchCoin.');
        setIsContributing(false);
        return;
      }

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

  const handleOpenDeposit = useCallback(() => {
    setCurrentView('deposit-rsc');
  }, []);

  const handleBuyRsc = useCallback(() => {
    setIsBuyModalOpen(true);
  }, []);

  // Handle quick amount selection
  const handleQuickAmountSelect = useCallback((amount: number) => {
    setSelectedQuickAmount(amount);
    setAmountUsd(amount);
    setAmountError(undefined);
    setIsSliderControlled(false); // Quick buttons set scaled visual mode
  }, []);

  // Calculate amounts in USD for display
  const currentAmountUsd = fundraise.amountRaised?.usd ?? 0;
  const goalAmountUsd = fundraise.goalAmount?.usd ?? 0;
  const remainingGoalUsd = Math.max(0, goalAmountUsd - currentAmountUsd);

  const handleBack = useCallback(() => {
    if (currentView === 'deposit-rsc') {
      setCurrentView('payment');
    } else if (currentView === 'payment') {
      setCurrentView('funding');
    }
  }, [currentView]);

  const handleClose = useCallback(() => {
    setCurrentView('funding');
    setSelectedQuickAmount(null);
    setAmountUsd(100);
    setError(null);
    setAmountError(undefined);
    setIsSliderControlled(false);
    onClose();
  }, [onClose]);

  // Get title based on current view
  const getTitle = () => {
    switch (currentView) {
      case 'funding':
        return 'Fund Proposal';
      case 'payment':
        return 'Select Payment Method';
      case 'deposit-rsc':
        return 'Deposit RSC';
      default:
        return 'Fund Proposal';
    }
  };

  // Get subtitle - only show proposal title on funding screen
  const getSubtitle = () => {
    if (currentView === 'funding') {
      return proposalTitle;
    }
    return undefined;
  };

  // Get amount display for payment widget
  const getAmountDisplay = () => {
    return formatUsd(amountUsd);
  };

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'deposit-rsc':
        return <DepositRSCView currentBalance={rscBalance} onSuccess={handleDepositSuccess} />;

      case 'payment':
        return (
          <PaymentStep
            amountInRsc={amountInRsc}
            amountInUsd={amountUsd}
            amountDisplay={getAmountDisplay()}
            rscBalance={rscBalance}
            isProcessing={isContributing}
            error={error}
            onConfirmPayment={handleConfirmPayment}
            onDepositRsc={handleOpenDeposit}
            onBuyRsc={handleBuyRsc}
          />
        );

      case 'funding':
      default:
        return (
          <div className="space-y-6">
            {/* Amount Input */}
            <Input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={getFormattedInputValue()}
              onChange={handleAmountChange}
              icon={<DollarSign className="h-5 w-5 text-gray-500" />}
              error={amountError}
              label="Funding amount"
              className="text-lg"
            />

            {/* Quick Amount Selector */}
            <QuickAmountSelector
              selectedAmount={selectedQuickAmount}
              onAmountSelect={handleQuickAmountSelect}
              remainingGoalUsd={remainingGoalUsd}
            />

            {/* Funding Impact Preview with Slider */}
            {goalAmountUsd > 0 && (
              <FundingImpactPreview
                currentAmountUsd={currentAmountUsd}
                goalAmountUsd={goalAmountUsd}
                previewAmountUsd={amountUsd}
                isSliderControlled={isSliderControlled}
                onAmountChange={(amount) => {
                  setAmountUsd(amount);
                  setSelectedQuickAmount(null);
                  setAmountError(undefined);
                  setIsSliderControlled(true); // Slider sets linear visual mode
                }}
              />
            )}

            {/* Continue to Payment Button */}
            <Button
              type="button"
              variant="default"
              disabled={amountUsd < minAmountUsd || !!amountError}
              className="w-full h-12 text-base"
              onClick={handleContinueToPayment}
            >
              Continue to Payment
            </Button>
          </div>
        );
    }
  };

  return (
    <>
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
                    subtitle={getSubtitle()}
                    onClose={handleClose}
                    onBack={handleBack}
                    showBackButton={currentView !== 'funding'}
                  />

                  <div className="p-6">{renderContent()}</div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Buy RSC Modal */}
      <BuyModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} />
    </>
  );
}
