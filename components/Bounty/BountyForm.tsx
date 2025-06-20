'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Search } from '@/components/Search/Search';
import { SearchSuggestion } from '@/types/search';
import {
  ChevronDown,
  Users,
  MessageCircleQuestion,
  Star,
  Calendar,
  MessageCircle,
  RecycleIcon,
} from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';
import { Currency } from '@/types/root';
import { BountyType } from '@/types/bounty';
import { BalanceInfo } from '@/components/modals/BalanceInfo';
import { useUser } from '@/contexts/UserContext';
import { CommentEditor, CommentEditorProps } from '@/components/Comment/CommentEditor';
import { Switch } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import { useComments } from '@/contexts/CommentContext';
import { useCreateComment } from '@/hooks/useComments';
import { CommentService } from '@/services/comment.service';
import { RadioGroup as HeadlessRadioGroup, Listbox } from '@headlessui/react';
import { useSession } from 'next-auth/react';
import { SessionProvider } from 'next-auth/react';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useStorageKey } from '@/utils/storageKeys';
import { extractUserMentions } from '@/components/Comment/lib/commentUtils';

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

interface BountyFormProps {
  workId?: string;
  onSubmitSuccess?: () => void;
  className?: string;
}

// Reuse the existing components from CreateBountyModal
const CurrencyInput = ({
  value,
  onChange,
  currency,
  onCurrencyToggle,
  convertedAmount,
  suggestedAmount,
  error,
  isExchangeRateLoading,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currency: Currency;
  onCurrencyToggle: () => void;
  convertedAmount?: string;
  suggestedAmount?: string;
  error?: string;
  isExchangeRateLoading?: boolean;
}) => {
  const currentAmount = parseFloat(value.replace(/,/g, '')) || 0;
  const suggestedAmountValue = suggestedAmount
    ? parseFloat(suggestedAmount.replace(/[^0-9.]/g, ''))
    : 0;

  const isBelowSuggested = currentAmount < suggestedAmountValue;
  const suggestedTextColor = !currentAmount
    ? 'text-gray-500'
    : isBelowSuggested
      ? 'text-orange-500'
      : 'text-green-500';

  return (
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
        className={`w-full text-left h-12 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${error ? 'border-red-500' : ''}`}
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
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      {suggestedAmount && !error && (
        <p className={`mt-1.5 text-xs ${suggestedTextColor}`}>
          Suggested amount for peer review: {suggestedAmount}
          {currency === 'RSC' &&
            !isExchangeRateLoading &&
            !suggestedAmount.includes('Loading') &&
            ' (150 USD)'}
        </p>
      )}
      {isExchangeRateLoading ? (
        <div className="mt-1.5 text-sm text-gray-500">Loading exchange rate...</div>
      ) : (
        convertedAmount && <div className="mt-1.5 text-sm text-gray-500">{convertedAmount}</div>
      )}
    </div>
  );
};

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

// Custom CommentEditor wrapper that ensures a session is provided
const SessionAwareCommentEditor = (props: CommentEditorProps) => {
  const { data: session } = useSession();

  // If we have a real session, use it directly
  if (session) {
    return <CommentEditor {...props} />;
  }

  // Otherwise, create a mock session with a default user
  const mockSession = {
    user: {
      name: 'You',
      fullName: 'You',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    userId: '0',
  };

  // Wrap the CommentEditor with a SessionProvider using our mock session
  return (
    <SessionProvider session={mockSession as any}>
      <CommentEditor {...props} />
    </SessionProvider>
  );
};

export function BountyForm({ workId, onSubmitSuccess, className }: BountyFormProps) {
  const { user } = useUser();
  const { data: session, status } = useSession();
  const { exchangeRate, isLoading: isExchangeRateLoading } = useExchangeRate();

  // Debug session information
  useEffect(() => {
    console.log('BountyForm - Session Status:', status);
    console.log('BountyForm - Session Data:', session);
  }, [session, status]);

  const [step, setStep] = useState<Step>('details');
  const [selectedPaper, setSelectedPaper] = useState<SelectedPaper | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  // Initialize with 150 USD worth of RSC, or 100 RSC if exchange rate is loading
  const [inputAmount, setInputAmount] = useState(() => {
    return isExchangeRateLoading ? 100 : Math.round(150 / exchangeRate);
  });
  const [currency, setCurrency] = useState<Currency>('RSC');
  const [bountyLength, setBountyLength] = useState<BountyLength>('30');
  const [bountyType, setBountyType] = useState<BountyType>('REVIEW');
  const [otherDescription, setOtherDescription] = useState('');
  const [isFeesExpanded, setIsFeesExpanded] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [editorContent, setEditorContent] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userBalance = user?.balance || 0;

  const [{ data: commentData, isLoading: isCreatingBounty, error: bountyError }, createComment] =
    useCreateComment();

  const [amountError, setAmountError] = useState<string | undefined>(undefined);
  const [hasInteractedWithAmount, setHasInteractedWithAmount] = useState(false);

  // Make useComments optional to handle cases when the component is not wrapped with a CommentProvider
  let commentContext;
  try {
    commentContext = useComments();
  } catch (error) {
    commentContext = null;
  }

  // Update amount validation when exchange rate changes
  useEffect(() => {
    if (!isExchangeRateLoading && currency !== 'RSC' && inputAmount > 0) {
      const rscAmount = inputAmount / exchangeRate;
      if (rscAmount < 10) {
        setAmountError('Minimum bounty amount is 10 RSC');
      } else {
        setAmountError(undefined);
      }
    }
  }, [exchangeRate, isExchangeRateLoading, currency, inputAmount]);

  // Update the input amount when the exchange rate loads
  useEffect(() => {
    if (!isExchangeRateLoading && exchangeRate > 0 && !hasInteractedWithAmount) {
      // Only update if the user hasn't manually changed the amount
      setInputAmount(Math.round(150 / exchangeRate));
    }
  }, [exchangeRate, isExchangeRateLoading, hasInteractedWithAmount]);

  const handleCreateBounty = async () => {
    if (isSubmitting) return;

    const rscAmount = getRscAmount();

    if (rscAmount < 10) {
      toast.error('Minimum bounty amount is 10 RSC');
      setAmountError('Minimum bounty amount is 10 RSC');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Creating bounty...');

    try {
      const expirationDate = (() => {
        const days = parseInt(bountyLength);
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString();
      })();

      const commentContent = {
        type: 'doc',
        content: editorContent?.content || [],
      };

      // Extract mentions from the editor content
      const mentions = extractUserMentions(editorContent || {});
      console.log('BountyForm-mentions', mentions);

      let createdComment;

      if (commentContext?.createBounty) {
        createdComment = await commentContext.createBounty(
          commentContent,
          rscAmount,
          bountyType,
          mentions, // Pass the extracted mentions
          expirationDate,
          workId || selectedPaper?.id
        );
      } else {
        const apiContent = {
          type: 'doc',
          content: editorContent?.content || [],
        };

        createdComment = await CommentService.createComment({
          workId: workId || selectedPaper?.id,
          contentType: 'paper',
          content: JSON.stringify(apiContent),
          contentFormat: 'TIPTAP',
          commentType: 'GENERIC_COMMENT',
          bountyAmount: rscAmount,
          bountyType,
          expirationDate,
          privacyType: 'PUBLIC',
          mentions, // Add the mentions parameter
        });
      }

      if (createdComment) {
        toast.success('Bounty created successfully!', { id: toastId });
        onSubmitSuccess?.();
      } else {
        toast.error('Failed to create bounty. Please try again.', { id: toastId });
      }
    } catch (error) {
      console.error('Failed to create bounty:', error);
      toast.error('Failed to create bounty. Please try again.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaperSelect = (paper: SearchSuggestion) => {
    if (paper.entityType === 'paper') {
      setSelectedPaper({
        id: paper.id?.toString() || paper.openalexId,
        title: paper.displayName,
        authors: paper.authors,
      });
      setShowSuggestions(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    const numValue = parseFloat(rawValue);

    if (!hasInteractedWithAmount) {
      setHasInteractedWithAmount(true);
    }

    if (!isNaN(numValue)) {
      setInputAmount(numValue);

      if (isExchangeRateLoading && currency !== 'RSC') {
        // Don't validate amount if exchange rate is loading and currency is USD
        setAmountError(undefined);
        return;
      }

      const rscAmount = currency === 'RSC' ? numValue : numValue / exchangeRate;
      if (rscAmount < 10) {
        setAmountError('Minimum bounty amount is 10 RSC');
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

  const toggleCurrency = () => {
    // If exchange rate is loading, only allow toggling from USD to RSC, not the other way around
    if (isExchangeRateLoading && currency === 'RSC') {
      toast.error('Exchange rate is loading. Please wait before switching to USD.');
      return;
    }
    setCurrency(currency === 'RSC' ? 'USD' : 'RSC');
  };

  const getConvertedAmount = () => {
    if (inputAmount === 0) return '';
    if (isExchangeRateLoading) return '';

    return currency === 'RSC'
      ? `≈ $${(inputAmount * exchangeRate).toLocaleString()} USD`
      : `≈ ${(inputAmount / exchangeRate).toLocaleString()} RSC`;
  };

  const getRscAmount = () => {
    if (isExchangeRateLoading) return currency === 'RSC' ? inputAmount : 0;
    return currency === 'RSC' ? inputAmount : inputAmount / exchangeRate;
  };

  const handleEditorContent = (content: any) => {
    setEditorContent(content);
  };

  const handleEditorUpdate = (content: any) => {
    setEditorContent(content);
  };

  const rscAmount = getRscAmount();
  const platformFee = Math.floor(rscAmount * 0.09);
  const daoFee = Math.floor(rscAmount * 0.02);
  const incFee = Math.floor(rscAmount * 0.07);
  const baseAmount = rscAmount - platformFee;
  const insufficientBalance = userBalance < rscAmount;
  const hasAdditionalInfo = !!(
    editorContent &&
    editorContent.content &&
    (Array.isArray(editorContent.content)
      ? editorContent.content.length > 0
      : Object.keys(editorContent.content).length > 0)
  );
  const isAmountTooLow = rscAmount < 10;

  // Function to proceed to payment step
  const handleProceedToPayment = () => {
    if (!workId && !selectedPaper) {
      toast.error('Please select a paper first');
      return;
    }

    if (inputAmount === 0 || getRscAmount() < 10 || !!amountError) {
      toast.error('Please enter a valid amount (minimum 10 RSC)');
      return;
    }

    setStep('payment');
  };

  // Function to go back to details step
  const handleBackToDetails = () => {
    setStep('details');
  };

  // Fee breakdown component
  const FeeBreakdown = () => (
    <div className="mt-4 space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Base amount:</span>
        <span className="font-medium">{baseAmount.toLocaleString()} RSC</span>
      </div>
      <div className="flex justify-between text-sm">
        <div className="flex items-center">
          <span className="text-gray-600">Platform fee (9%):</span>
          <Tooltip content="This fee is used to maintain and improve the platform" position="top">
            <span className="ml-1 cursor-help text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </Tooltip>
        </div>
        <span className="font-medium">{platformFee.toLocaleString()} RSC</span>
      </div>
      <div className="flex justify-between text-sm">
        <div className="flex items-center">
          <span className="text-gray-600">DAO fee (2%):</span>
          <Tooltip content="This fee goes to the ResearchHub DAO treasury" position="top">
            <span className="ml-1 cursor-help text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </Tooltip>
        </div>
        <span className="font-medium">{daoFee.toLocaleString()} RSC</span>
      </div>
      <div className="flex justify-between text-sm">
        <div className="flex items-center">
          <span className="text-gray-600">Inc fee (7%):</span>
          <Tooltip content="This fee goes to ResearchHub Inc. to support operations" position="top">
            <span className="ml-1 cursor-help text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </Tooltip>
        </div>
        <span className="font-medium">{incFee.toLocaleString()} RSC</span>
      </div>
      <div className="pt-2 border-t border-gray-200 flex justify-between font-medium">
        <span>Total:</span>
        <span>{rscAmount.toLocaleString()} RSC</span>
      </div>
    </div>
  );

  const baseStorageKey = `bounty-editor-draft-${workId || 'new'}`;
  const storageKey = useStorageKey(baseStorageKey);

  return (
    <div className={className}>
      <div className="mb-4 flex items-center">
        {step === 'payment' && (
          <button
            type="button"
            onClick={handleBackToDetails}
            className="mr-2 p-2 rounded-md hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
        )}
        <h2 className="text-lg font-semibold text-gray-700"></h2>
      </div>
      <div className="space-y-6">
        {step === 'details' ? (
          <>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What is this bounty for?
              </label>
              <HeadlessRadioGroup
                value={bountyType}
                onChange={(value) => setBountyType(value as BountyType)}
              >
                <div className="space-y-2">
                  <HeadlessRadioGroup.Option
                    value="REVIEW"
                    className={({ checked }) =>
                      cn(
                        'relative flex cursor-pointer rounded-lg border p-4 focus:outline-none',
                        checked
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )
                    }
                  >
                    {({ checked }) => (
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center">
                          <div className="text-sm">
                            <HeadlessRadioGroup.Label
                              as="p"
                              className={cn(
                                'font-medium',
                                checked ? 'text-indigo-900' : 'text-gray-900'
                              )}
                            >
                              Peer Review
                            </HeadlessRadioGroup.Label>
                            <HeadlessRadioGroup.Description
                              as="span"
                              className={cn(
                                'inline text-sm',
                                checked ? 'text-indigo-700' : 'text-gray-500'
                              )}
                            >
                              Get expert feedback on methodology and findings
                            </HeadlessRadioGroup.Description>
                          </div>
                        </div>
                        <div className={cn('shrink-0 text-indigo-500', !checked && 'invisible')}>
                          <Star className="h-5 w-5" />
                        </div>
                      </div>
                    )}
                  </HeadlessRadioGroup.Option>

                  <HeadlessRadioGroup.Option
                    value="ANSWER"
                    className={({ checked }) =>
                      cn(
                        'relative flex cursor-pointer rounded-lg border p-4 focus:outline-none',
                        checked
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )
                    }
                  >
                    {({ checked }) => (
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center">
                          <div className="text-sm">
                            <HeadlessRadioGroup.Label
                              as="p"
                              className={cn(
                                'font-medium',
                                checked ? 'text-indigo-900' : 'text-gray-900'
                              )}
                            >
                              Answer to Question
                            </HeadlessRadioGroup.Label>
                            <HeadlessRadioGroup.Description
                              as="span"
                              className={cn(
                                'inline text-sm',
                                checked ? 'text-indigo-700' : 'text-gray-500'
                              )}
                            >
                              Ask a specific question about the research
                            </HeadlessRadioGroup.Description>
                          </div>
                        </div>
                        <div className={cn('shrink-0 text-indigo-500', !checked && 'invisible')}>
                          <MessageCircleQuestion className="h-5 w-5" />
                        </div>
                      </div>
                    )}
                  </HeadlessRadioGroup.Option>
                </div>
              </HeadlessRadioGroup>
            </div>

            {/* Amount Section */}
            <div>
              <CurrencyInput
                value={getFormattedInputValue()}
                onChange={handleAmountChange}
                currency={currency}
                onCurrencyToggle={toggleCurrency}
                convertedAmount={getConvertedAmount()}
                suggestedAmount={
                  currency === 'USD'
                    ? '150 USD'
                    : isExchangeRateLoading
                      ? 'Loading...'
                      : `${Math.round(150 / exchangeRate)} RSC`
                }
                error={amountError}
                isExchangeRateLoading={isExchangeRateLoading}
              />
            </div>

            {/* Additional Information Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-5 h-5 text-gray-500" />
                <label className="block text-sm font-semibold text-gray-700">
                  Additional Information
                </label>
                <span className="text-sm text-gray-500">(Optional)</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Provide more details about what you're looking for in the bounty submissions.
              </p>
              <div className="border border-gray-200 rounded-lg bounty-editor">
                <style jsx>{`
                  :global(.bounty-editor .border-t) {
                    display: none;
                  }
                  :global(.scrollbar-hide) {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                  :global(.scrollbar-hide::-webkit-scrollbar) {
                    display: none;
                  }
                `}</style>
                <SessionAwareCommentEditor
                  onSubmit={handleEditorContent}
                  onUpdate={handleEditorUpdate}
                  placeholder="Add more details about your bounty requirements..."
                  commentType="GENERIC_COMMENT"
                  onCancel={() => {}}
                  compactToolbar={true}
                  storageKey={storageKey}
                  debug={true}
                />
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Advanced options</span>
                </div>
                <Switch
                  checked={showAdvanced}
                  onChange={setShowAdvanced}
                  className={`${
                    showAdvanced ? 'bg-indigo-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      showAdvanced ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
            </div>

            {/* Advanced Options Section */}
            {showAdvanced && (
              <div className="space-y-6 pt-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bounty Length
                  </label>
                  <BountyLengthSelector selected={bountyLength} onChange={setBountyLength} />
                </div>
              </div>
            )}

            {/* Continue Button */}
            <Button
              type="button"
              variant="default"
              className="w-full h-12 text-base"
              onClick={handleProceedToPayment}
              disabled={
                (!workId && !selectedPaper) ||
                inputAmount === 0 ||
                getRscAmount() < 10 ||
                !!amountError
              }
            >
              Continue to Payment
            </Button>
          </>
        ) : (
          // Payment Step
          <div className="space-y-6">
            {/* Bounty Summary */}
            <div>
              <div className="mb-2">
                <h3 className="text-sm font-semibold text-gray-900">Bounty Summary</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Type:</span>
                  <span className="text-gray-900 font-medium">
                    {bountyType === 'REVIEW' ? 'Peer Review' : 'Answer to Question'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Amount:</span>
                  <span className="text-gray-900 font-medium">
                    {rscAmount.toLocaleString()} RSC
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Duration:</span>
                  <span className="text-gray-900 font-medium">{bountyLength} days</span>
                </div>
              </div>
            </div>

            {/* Fees Breakdown */}
            <div>
              <div className="mb-2">
                <h3 className="text-sm font-semibold text-gray-900">Fees Breakdown</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900">Your contribution:</span>
                  <span className="text-gray-900">{rscAmount.toLocaleString()} RSC</span>
                </div>
                <div>
                  <button
                    className="w-full flex items-center justify-between text-left group"
                    onClick={() => setIsFeesExpanded(!isFeesExpanded)}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Platform fees (9%)</span>
                      <div className="flex items-center gap-1">
                        <ChevronDown
                          className={`w-4 h-4 text-gray-500 transition-transform transform ${
                            isFeesExpanded ? 'rotate-180' : ''
                          }`}
                        />
                        <div className="inline-flex">
                          <Tooltip content="This fee is used to maintain and improve the platform">
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
                <div className="border-t border-gray-200"></div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Net bounty amount:</span>
                  <span className="font-semibold text-gray-900">
                    {baseAmount.toLocaleString()} RSC
                  </span>
                </div>
              </div>
            </div>

            {/* Balance Info */}
            <div className="mt-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current RSC Balance:</span>
                  <span className="text-sm font-medium">{userBalance.toLocaleString()} RSC</span>
                </div>
                {insufficientBalance && (
                  <div className="mt-1 text-sm text-orange-600">
                    You need {(rscAmount - userBalance).toLocaleString()} RSC more for this
                    contribution
                  </div>
                )}
              </div>
            </div>

            {/* Create Bounty Button */}
            <Button
              type="button"
              variant="default"
              className="w-full h-12 text-base"
              onClick={handleCreateBounty}
              disabled={isSubmitting || insufficientBalance}
            >
              {isSubmitting ? 'Creating Bounty...' : 'Create Bounty'}
            </Button>

            {/* Info Alert */}
            <Alert variant="info">
              <div className="flex items-center gap-3">
                <span>
                  If no solution satisfies your request, the full bounty amount (excluding platform
                  fee) will be refunded to you
                </span>
              </div>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}
