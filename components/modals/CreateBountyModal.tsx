'use client';

import { Dialog, Transition, Listbox, RadioGroup as HeadlessRadioGroup } from '@headlessui/react';
import { Fragment, useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Search } from '@/components/Search/Search';
import { SearchSuggestion } from '@/types/search';
import {
  ArrowLeft,
  ChevronDown,
  Users,
  MessageCircleQuestion,
  Sparkles,
  Star,
  Calendar,
  MessageCircle,
} from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';
import { Currency } from '@/types/root';
import { BountyType } from '@/types/bounty';
import { BalanceInfo } from './BalanceInfo';
import { useSession } from 'next-auth/react';
import { useUser } from '@/contexts/UserContext';
import { CommentEditor } from '@/components/Comment/CommentEditor';
import { Switch } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import { useComments } from '@/contexts/CommentContext';
import { CommentService } from '@/services/comment.service';

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
  suggestedAmount,
  error,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currency: Currency;
  onCurrencyToggle: () => void;
  convertedAmount?: string;
  suggestedAmount?: string;
  error?: string;
}) => {
  // Parse the current input amount and suggested amount for comparison
  const currentAmount = parseFloat(value.replace(/,/g, '')) || 0;
  const suggestedAmountValue = suggestedAmount
    ? parseFloat(suggestedAmount.replace(/[^0-9.]/g, ''))
    : 0;

  // Determine the color based on the comparison
  const isBelowSuggested = currentAmount < suggestedAmountValue;
  const suggestedTextColor = !currentAmount
    ? 'text-gray-500' // Default color when no amount entered
    : isBelowSuggested
      ? 'text-orange-500' // Orange if below suggested
      : 'text-green-500'; // Green if equal or above suggested

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
        </p>
      )}
      {convertedAmount && <div className="mt-1.5 text-sm text-gray-500">{convertedAmount}</div>}
    </div>
  );
};

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

export function CreateBountyModal({ isOpen, onClose, workId }: CreateBountyModalProps) {
  const { user } = useUser();
  const [step, setStep] = useState<Step>('details');
  const [selectedPaper, setSelectedPaper] = useState<SelectedPaper | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [inputAmount, setInputAmount] = useState(0);
  const [currency, setCurrency] = useState<Currency>('RSC');
  const [bountyLength, setBountyLength] = useState<BountyLength>('30');
  const [bountyType, setBountyType] = useState<BountyType>('REVIEW');
  const [otherDescription, setOtherDescription] = useState('');
  const [isFeesExpanded, setIsFeesExpanded] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [editorContent, setEditorContent] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const RSC_TO_USD = 1;
  const userBalance = user?.balance || 0;

  const [{ data: commentData, isLoading: isCreatingBounty, error: bountyError }, createComment] =
    useCreateComment();

  const userBalance = session?.user?.balance || 0;
  const [amountError, setAmountError] = useState<string | undefined>(undefined);

  // Make useComments optional to handle cases when the component is not wrapped with a CommentProvider
  let commentContext;
  try {
    commentContext = useComments();
  } catch (error) {
    // If useComments throws an error, it means the component is not wrapped with a CommentProvider
    // In this case, we'll use a direct approach without the context
    commentContext = null;
  }


  const handleCreateBounty = async () => {
    if (isSubmitting) return; // Prevent multiple submissions

    const rscAmount = getRscAmount();

    // Validate minimum amount
    if (rscAmount < 10) {
      toast.error('Minimum bounty amount is 10 RSC');
      setAmountError('Minimum bounty amount is 10 RSC');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Creating bounty...');

    try {
      const expirationDate = (() => {
        // For preset lengths (14, 30, 60 days)
        const days = parseInt(bountyLength);
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString();
      })();

      // Log the editor content before submitting
      console.log('Submitting bounty with editor content:', editorContent);

      // Create a proper CommentContent object from the editor content
      const commentContent = {
        type: 'doc',
        content: editorContent?.content || [],
      };

      let createdComment;

      // Use the context if available, otherwise use the direct approach
      if (commentContext?.createBounty) {
        // Use the createBounty function from CommentContext
        // This will automatically update the UI through the reducer
        createdComment = await commentContext.createBounty(
          commentContent,
          rscAmount,
          bountyType,
          expirationDate,
          workId || selectedPaper?.id
        );
      } else {
        // Direct approach using CommentService
        const apiContent = {
          type: 'doc',
          content: editorContent?.content || [],
        };

        // Always use GENERIC_COMMENT for commentType, but keep the bountyType as selected
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
        });
      }

      if (createdComment) {
        toast.success('Bounty created successfully!', { id: toastId });
        onClose();
      } else {
        toast.error('Failed to create bounty. Please try again.', { id: toastId });
      }
    } catch (error) {
      // Error is handled by the hook
      console.error('Failed to create bounty:', error);
      toast.error('Failed to create bounty. Please try again.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (editorContent) {
      console.log('Editor content state updated:', editorContent);
    }
  }, [editorContent]);

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

      // Validate minimum amount
      const rscAmount = currency === 'RSC' ? numValue : numValue / RSC_TO_USD;
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

  const handleEditorContent = (content: any) => {
    setEditorContent(content);
    // Don't actually submit the form when the editor's submit button is clicked
  };

  const handleEditorUpdate = (content: any) => {
    console.log('Editor content updated:', content);
    // Update the state with the latest content
    setEditorContent(content);
  };

  const handleContinue = () => {
    const rscAmount = getRscAmount();

    // Validate minimum amount before proceeding
    if (rscAmount < 10) {
      setAmountError('Minimum bounty amount is 10 RSC');
      return;
    }

    setStep('payment');
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

        {/* Bounty Type Section - Using Headless UI RadioGroup directly */}
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
            suggestedAmount={currency === 'USD' ? '150 USD' : '150 RSC'}
            error={amountError}
          />
        </div>

        {/* Additional Information Section - Moved up */}
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
              /* Hide the submit button in the editor */
              :global(.bounty-editor .border-t) {
                display: none;
              }

              /* Add custom scrollbar styling for the toolbar */
              :global(.scrollbar-hide) {
                -ms-overflow-style: none; /* IE and Edge */
                scrollbar-width: none; /* Firefox */
              }
              :global(.scrollbar-hide::-webkit-scrollbar) {
                display: none; /* Chrome, Safari and Opera */
              }
            `}</style>
            <CommentEditor
              onSubmit={handleEditorContent}
              onUpdate={handleEditorUpdate}
              placeholder="Add more details about your bounty requirements..."
              commentType="GENERIC_COMMENT"
              onCancel={() => {}} // Empty function as we don't want to cancel
              compactToolbar={true} // Enable compact toolbar mode
              storageKey={`bounty-editor-draft-${workId || 'new'}`} // Unique storage key
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

        {/* Advanced Options Section - Hidden by default */}
        {showAdvanced && (
          <div className="space-y-6 pt-2">
            {/* Bounty Length Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bounty Length
              </label>
              <BountyLengthSelector selected={bountyLength} onChange={setBountyLength} />
            </div>

            {/* Target Audience Section - Commented out for now */}
            {/* <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-gray-500" />
                <label className="block text-sm font-semibold text-gray-700">Target Audience</label>
                <span className="text-sm text-gray-500">(Optional)</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Target specific users for your grant. If none selected, we'll auto-match relevant
                users.
              </p>
              <div className="relative">
                <Input placeholder="Search for research fields..." className="w-full" />
              </div>
            </div> */}
          </div>
        )}

        <Button
          type="button"
          variant="default"
          className="w-full h-12 text-base"
          onClick={handleContinue}
          disabled={
            (!workId && !selectedPaper) || inputAmount === 0 || getRscAmount() < 10 || !!amountError
          }
        >
          Continue
        </Button>
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
    const hasAdditionalInfo = !!(
      editorContent &&
      editorContent.content &&
      (Array.isArray(editorContent.content)
        ? editorContent.content.length > 0
        : Object.keys(editorContent.content).length > 0)
    );
    const isAmountTooLow = rscAmount < 10;

    return (
      <div className="p-6">
        <ModalHeader
          title="Create Bounty"
          onClose={onClose}
          onBack={() => setStep('details')}
          subtitle="Engage the world's brightest minds by offering ResearchCoin"
        />

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
                <span className="text-gray-900 font-medium">{rscAmount.toLocaleString()} RSC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Duration:</span>
                <span className="text-gray-900 font-medium">
                  {bountyLength === 'custom'
                    ? `Until ${new Date(customDate).toLocaleDateString()}`
                    : `${bountyLength} days`}
                </span>
              </div>
              {selectedPaper && (
                <div className="flex justify-between items-start">
                  <span className="text-gray-700">Paper:</span>
                  <span className="text-gray-900 font-medium text-right max-w-[70%]">
                    {selectedPaper.title}
                  </span>
                </div>
              )}
              {hasAdditionalInfo && (
                <div className="flex justify-between items-start">
                  <span className="text-gray-700">Additional Info:</span>
                  <span className="text-gray-900 font-medium text-right max-w-[70%]">
                    {editorContent ? 'Provided' : 'None'}
                  </span>
                </div>
              )}
            </div>
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

          <div className="mt-6">
            <BalanceInfo amount={rscAmount} showWarning={insufficientBalance} />
          </div>

          {isAmountTooLow && (
            <Alert variant="error">
              <div className="flex items-center gap-3">
                <span>Minimum bounty amount is 10 RSC</span>
              </div>
            </Alert>
          )}

          <Button
            type="button"
            variant="default"
            className="w-full h-12 text-base"
            onClick={handleCreateBounty}
            disabled={isSubmitting || insufficientBalance || isAmountTooLow}
          >
            {isSubmitting ? 'Creating Bounty...' : 'Create Bounty'}
          </Button>

          {/* Moved refund banner below the CTA button */}
          <Alert variant="info">
            <div className="flex items-center gap-3">
              <span>
                If no solution satisfies your request, the full bounty amount (excluding platform
                fee) will be refunded to you
              </span>
            </div>
          </Alert>
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
