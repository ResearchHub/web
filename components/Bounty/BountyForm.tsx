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
import { removeCommentDraftById } from '@/components/Comment/lib/commentDraftStorage';

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

import { CurrencyInput } from '@/components/ui/form/CurrencyInput';

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

import { useCurrencyConversion } from './lib/useCurrencyConversion';

import { FeeBreakdown } from './lib/FeeBreakdown';

import { useAmountInput } from '@/hooks/useAmountInput';

export function BountyForm({ workId, onSubmitSuccess, className }: BountyFormProps) {
  const { user } = useUser();
  const { data: session, status } = useSession();
  const { exchangeRate, isLoading: isExchangeRateLoading } = useExchangeRate();
  const { convertToRSC, convertToUSD } = useCurrencyConversion(exchangeRate);

  // Debug session information
  useEffect(() => {
    console.log('BountyForm - Session Status:', status);
    console.log('BountyForm - Session Data:', session);
  }, [session, status]);

  const [step, setStep] = useState<Step>('details');
  const [selectedPaper, setSelectedPaper] = useState<SelectedPaper | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const {
    amount: inputAmount,
    setAmount: setInputAmount,
    error: amountError,
    handleAmountChange,
    getFormattedValue: getFormattedInputValue,
    hasInteracted: hasInteractedWithAmount,
  } = useAmountInput({
    initialAmount: isExchangeRateLoading ? 100 : Math.round(150 / exchangeRate),
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

  const baseStorageKey = `bounty-editor-draft-${workId || 'new'}`;
  const storageKey = useStorageKey(baseStorageKey);

  const handleCreateBounty = async () => {
    if (isSubmitting) return;

    // Ensure we send a whole number for the bounty amount to avoid backend rounding errors
    const rscAmount = Math.round(getRscAmount());

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

      let createdComment;

      if (commentContext?.createBounty) {
        createdComment = await commentContext.createBounty(
          commentContent,
          rscAmount,
          bountyType,
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
          mentions,
        });
      }

      if (createdComment) {
        removeCommentDraftById(storageKey);

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

  const toggleCurrency = () => {
    if (isExchangeRateLoading) {
      toast.error('Exchange rate is loading. Please wait before switching currency.');
      return;
    }

    if (currency === 'RSC') {
      setCurrency('USD');
      setInputAmount(convertToUSD(inputAmount));
    } else {
      setCurrency('RSC');
      setInputAmount(convertToRSC(inputAmount));
    }
  };

  const getConvertedAmount = () => {
    if (inputAmount === 0) return '';
    if (isExchangeRateLoading) return '';

    return currency === 'RSC'
      ? `≈ $${convertToUSD(inputAmount).toLocaleString()} USD`
      : `≈ ${convertToRSC(inputAmount).toLocaleString()} RSC`;
  };

  const getRscAmount = () => {
    if (isExchangeRateLoading) return currency === 'RSC' ? inputAmount : 0;
    return currency === 'RSC' ? inputAmount : convertToRSC(inputAmount);
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
  const totalCost = rscAmount + platformFee;
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
              <FeeBreakdown
                rscAmount={rscAmount}
                platformFee={platformFee}
                daoFee={daoFee}
                incFee={incFee}
                totalAmount={totalCost}
                isExpanded={isFeesExpanded}
                onToggleExpand={() => setIsFeesExpanded(!isFeesExpanded)}
              />
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
