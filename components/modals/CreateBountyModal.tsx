'use client';

import { Dialog, Transition, Listbox } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Search } from '@/components/Search/Search';
import { SearchSuggestion } from '@/types/search';
import {
  ArrowLeft,
  ChevronDown,
  CreditCard,
  ArrowDownToLine,
  Users,
  MessageCircleQuestion,
  Sparkles,
  Star,
  Calendar,
} from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';
import { useCreateComment } from '@/hooks/useComments';
import { Currency } from '@/types/root';
import { BountyType } from '@/types/bounty';
import { BalanceInfo } from './BalanceInfo';
import { useSession } from 'next-auth/react';
import { useUser } from '@/contexts/UserContext';

interface CreateBountyModalProps {
  isOpen: boolean;
  onClose: () => void;
  workId?: string;
}

type Step = 'details' | 'payment';
type BountyLength = '14' | '30' | '60' | 'custom';

interface SelectedPaper {
  id: string;
  title: string;
  authors: string[];
  abstract?: string;
}

interface BountyLengthOption {
  value: BountyLength;
  label: string;
}

const ModalHeader = ({
  title,
  onClose,
  onBack,
  subtitle,
}: {
  title: string;
  onClose: () => void;
  onBack?: () => void;
  subtitle?: string;
}) => (
  <div className="border-b border-gray-200 -mx-6 px-6 pb-4 mb-6">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        {onBack && (
          <button type="button" onClick={onBack} className="text-gray-500 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <Dialog.Title as="h2" className="text-xl font-semibold text-gray-900">
            {title}
          </Dialog.Title>
          {subtitle && <p className="text-sm font-medium text-gray-500 mt-1">{subtitle}</p>}
        </div>
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

// Amount Input Component
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
      label="I am offering"
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

// Bounty Length Selector
const BountyLengthSelector = ({
  selected,
  onChange,
}: {
  selected: BountyLength;
  onChange: (value: BountyLength) => void;
}) => {
  const options: BountyLengthOption[] = [
    { value: '14', label: '14 days' },
    { value: '30', label: '30 days' },
    { value: '60', label: '60 days' },
    { value: 'custom', label: 'Custom' },
  ];

  const selectedOption = options.find((option) => option.value === selected) || options[0];

  return (
    <div className="relative">
      <Listbox value={selected} onChange={onChange}>
        <Listbox.Button className="relative w-full cursor-pointer rounded-lg border border-gray-200 bg-white py-3 pl-4 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:text-sm">
          <span className="block truncate">{selectedOption.label}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {options.map((option) => (
            <Listbox.Option
              key={option.value}
              value={option.value}
              className={({ active, selected }) =>
                cn(
                  'relative cursor-pointer select-none py-2 pl-4 pr-9',
                  active ? 'bg-indigo-50 text-indigo-900' : 'text-gray-900',
                  selected && 'bg-indigo-50'
                )
              }
            >
              {({ selected }) => (
                <>
                  <span className={cn('block truncate', selected && 'font-semibold')}>
                    {option.label}
                  </span>
                  {selected && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-indigo-400">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </div>
  );
};

// Add DatePicker component
const DatePicker = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  return (
    <div className="relative mt-3">
      <Input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
        icon={<Calendar className="w-4 h-4 text-gray-400" />}
        min={new Date().toISOString().split('T')[0]} // Set min date to today
      />
    </div>
  );
};

// Bounty Type Selector
const BountyTypeSelector = ({
  selected,
  onChange,
}: {
  selected: BountyType;
  onChange: (value: BountyType) => void;
}) => {
  const options = [
    {
      value: 'peer_review',
      label: 'Peer Review',
      icon: <Star className="w-5 h-5" />,
      description: 'Get expert feedback on methodology and findings',
    },
    {
      value: 'question',
      label: 'Answer to Question',
      icon: <MessageCircleQuestion className="w-5 h-5" />,
      description: 'Ask a specific question about the research',
    },
    {
      value: 'other',
      label: 'Other',
      icon: <Sparkles className="w-5 h-5" />,
      description: 'Custom bounty for other research tasks',
    },
  ];

  const selectedOption = options.find((option) => option.value === selected) || options[0];

  return (
    <div className="relative">
      <Listbox value={selected} onChange={onChange}>
        <Listbox.Button className="relative w-full cursor-pointer rounded-lg border border-gray-200 bg-white py-3 pl-4 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:text-sm">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-indigo-500">{selectedOption.icon}</div>
            <div>
              <span className="block font-medium text-gray-900">{selectedOption.label}</span>
              <span className="block text-sm text-gray-500">{selectedOption.description}</span>
            </div>
          </div>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </span>
        </Listbox.Button>

        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {options.map((option) => (
            <Listbox.Option
              key={option.value}
              value={option.value}
              className={({ active, selected }) =>
                cn(
                  'relative cursor-pointer select-none py-3 pl-4 pr-9',
                  active ? 'bg-indigo-50' : 'bg-white',
                  'hover:bg-indigo-50'
                )
              }
            >
              {({ selected }) => (
                <div className="flex items-center gap-3">
                  <div
                    className={cn('flex-shrink-0', selected ? 'text-indigo-500' : 'text-gray-400')}
                  >
                    {option.icon}
                  </div>
                  <div>
                    <span
                      className={cn(
                        'block font-medium text-gray-900',
                        selected && 'text-indigo-600'
                      )}
                    >
                      {option.label}
                    </span>
                    <span className="block text-sm text-gray-500">{option.description}</span>
                  </div>
                  {selected && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-indigo-500">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </div>
  );
};

// Fee Breakdown Component (reused from FundResearchModal)
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
      <span className="font-semibold text-gray-900">Net bounty amount:</span>
      <span className="font-semibold text-gray-900">{baseAmount.toLocaleString()} RSC</span>
    </div>
  </div>
);

// Payment Option Button component
const PaymentOption = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) => (
  <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 w-full">
    <div className="text-gray-700 mb-2">{icon}</div>
    <span className="text-sm font-medium text-gray-900">{title}</span>
    {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
  </button>
);

// Add RSC Section component
const AddRscSection = () => (
  <div>
    <div className="mb-2">
      <span className="text-sm font-semibold text-gray-700">Add more ResearchCoin</span>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <PaymentOption
        icon={<CreditCard className="w-5 h-5" />}
        title="Buy or Swap"
        subtitle="Card, ETH, Apple Pay"
      />
      <PaymentOption
        icon={<ArrowDownToLine className="w-5 h-5" />}
        title="Deposit"
        subtitle="From an external wallet"
      />
    </div>
  </div>
);

export function CreateBountyModal({ isOpen, onClose, workId }: CreateBountyModalProps) {
  const { user } = useUser();
  const [step, setStep] = useState<Step>('details');
  const [selectedPaper, setSelectedPaper] = useState<SelectedPaper | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [inputAmount, setInputAmount] = useState(0);
  const [currency, setCurrency] = useState<Currency>('RSC');
  const [bountyLength, setBountyLength] = useState<BountyLength>('14');
  const [bountyType, setBountyType] = useState<BountyType>('REVIEW');
  const [otherDescription, setOtherDescription] = useState('');
  const [isFeesExpanded, setIsFeesExpanded] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const RSC_TO_USD = 1;
  const userBalance = user?.balance || 0;

  const [{ data: commentData, isLoading: isCreatingBounty, error: bountyError }, createComment] =
    useCreateComment();

  const handleCreateBounty = async () => {
    try {
      const rscAmount = getRscAmount();

      const expirationDate = (() => {
        if (bountyLength === 'custom' && customDate) {
          // For custom dates, use the selected date
          return new Date(customDate).toISOString();
        }

        // For preset lengths (14, 30, 60 days)
        const days = parseInt(bountyLength);
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString();
      })();

      await createComment({
        commentType: 'GENERIC_COMMENT',
        workId: workId || selectedPaper?.id || '',
        bountyAmount: rscAmount,
        bountyType: bountyType,
        privacyType: 'PUBLIC',
        expirationDate: expirationDate,
        contentType: 'paper', // TODO. what type do we want to use here?
      });
    } catch (error) {
      // Error is handled by the hook
      console.error('Failed to create bounty:', error);
    }
  };

  useEffect(() => {
    if (commentData) {
      // Bounty was successfully created
      onClose();
      // TODO: Add success toast notification if needed
    }
  }, [commentData, onClose]);

  const handlePaperSelect = (paper: SearchSuggestion) => {
    if (paper.entityType === 'paper') {
      setSelectedPaper({
        id: paper.id?.toString() || paper.openalexId,
        title: paper.displayName,
        authors: paper.authors,
      });
    }
  };

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

  const renderDetailsStep = () => (
    <div className="p-6">
      <ModalHeader
        title="Create Bounty"
        onClose={onClose}
        subtitle="Engage the world's brightest minds by offering ResearchCoin"
      />
      <div className="space-y-6">
        {/* Paper Search Section */}
        {!workId && (
          <div>
            <div className="mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Which work is this bounty for?
              </label>
            </div>
            <div className="relative">
              <Search
                onSelect={handlePaperSelect}
                displayMode="inline"
                placeholder="Search for work..."
                className="w-full [&_input]:bg-white"
                showSuggestionsOnFocus={!selectedPaper || showSuggestions}
              />
              {selectedPaper && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm font-medium text-gray-900">{selectedPaper.title}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {selectedPaper.authors.join(', ')}
                  </div>
                  {selectedPaper.abstract && (
                    <div className="text-xs text-gray-500 mt-2 line-clamp-2">
                      {selectedPaper.abstract}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bounty Type Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-semibold text-gray-700">
              What is this bounty for?
            </label>
          </div>
          <BountyTypeSelector selected={bountyType} onChange={setBountyType} />
          {bountyType === 'GENERIC_COMMENT' && (
            <div className="mt-3">
              <Input
                placeholder="Describe what you're looking for..."
                value={otherDescription}
                onChange={(e) => setOtherDescription(e.target.value)}
                className="w-full"
                label="Other Description"
                required
              />
            </div>
          )}
        </div>

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

        {/* Bounty Length Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Bounty Length</label>
          <BountyLengthSelector selected={bountyLength} onChange={setBountyLength} />
          {bountyLength === 'custom' && <DatePicker value={customDate} onChange={setCustomDate} />}
        </div>

        {/* Target Audience Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-gray-500" />
            <label className="block text-sm font-semibold text-gray-700">Target Audience</label>
            <span className="text-sm text-gray-500">(Optional)</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Target specific users for your grant. If none selected, we'll auto-match relevant users.
          </p>
          <div className="relative">
            <Input placeholder="Search for research fields..." className="w-full" />
          </div>
        </div>

        <Button
          type="button"
          variant="default"
          disabled={
            !(selectedPaper || workId) ||
            !inputAmount ||
            (bountyType === 'GENERIC_COMMENT' && !otherDescription)
          }
          className="w-full h-12 text-base"
          onClick={() => setStep('payment')}
        >
          Continue
        </Button>

        <Alert variant="info">
          <div className="flex items-center gap-3">
            <span>
              If no solution satisfies your request, the full bounty amount (excluding platform fee)
              will be refunded to you
            </span>
          </div>
        </Alert>
      </div>
    </div>
  );

  const renderPaymentStep = () => {
    const rscAmount = getRscAmount();
    const platformFee = Math.floor(rscAmount * 0.09);
    const daoFee = Math.floor(rscAmount * 0.02);
    const incFee = Math.floor(rscAmount * 0.07);
    const baseAmount = rscAmount - platformFee;
    const insufficientBalance = userBalance < rscAmount;

    return (
      <div className="p-6">
        <ModalHeader
          title="Create Bounty"
          onClose={onClose}
          onBack={() => setStep('details')}
          subtitle="Engage the world's brightest minds by offering ResearchCoin"
        />

        <div className="space-y-6">
          <AddRscSection />

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

          <div className="mt-6">
            <BalanceInfo amount={rscAmount} showWarning={insufficientBalance} />
          </div>

          {bountyError && <Alert variant="error">{bountyError}</Alert>}

          <Button
            type="button"
            variant="default"
            disabled={isCreatingBounty}
            className="w-full h-12 text-base"
            onClick={handleCreateBounty}
          >
            {isCreatingBounty ? 'Creating Bounty...' : 'Create Bounty'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                {step === 'details' && renderDetailsStep()}
                {step === 'payment' && renderPaymentStep()}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
