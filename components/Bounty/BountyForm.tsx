'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Search } from '@/components/Search/Search';
import { SearchSuggestion } from '@/types/search';
import { Star, MessageCircleQuestion, MessageCircle, ChevronDown, BookOpen } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
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
import { useSession, SessionProvider } from 'next-auth/react';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useStorageKey } from '@/utils/storageKeys';
import { extractUserMentions } from '@/components/Comment/lib/commentUtils';
import { removeCommentDraftById } from '@/components/Comment/lib/commentDraftStorage';
import { CurrencyInput } from '@/components/ui/form/CurrencyInput';
import { FeeBreakdown } from './lib/FeeBreakdown';
import { useCurrencyConversion } from './lib/useCurrencyConversion';
import { useAmountInput } from '@/hooks/useAmountInput';
import { calculateBountyFees } from './lib/bountyUtil';

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

const SessionAwareCommentEditor = (props: CommentEditorProps) => {
  const { data: session } = useSession();

  if (session) {
    return <CommentEditor {...props} />;
  }

  const mockSession = {
    user: {
      name: 'You',
      fullName: 'You',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    userId: '0',
  };

  return (
    <SessionProvider session={mockSession as any}>
      <CommentEditor {...props} />
    </SessionProvider>
  );
};

export function BountyForm({ workId, onSubmitSuccess, className }: BountyFormProps) {
  const { user } = useUser();
  const { exchangeRate, isLoading: isExchangeRateLoading } = useExchangeRate();
  const { convertToRSC, convertToUSD } = useCurrencyConversion(exchangeRate);

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
  const [isFeesExpanded, setIsFeesExpanded] = useState(false);
  const [editorContent, setEditorContent] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userBalance = user?.balance || 0;

  const commentContext = useComments();

  const baseStorageKey = `bounty-editor-draft-${workId || 'new'}`;
  const storageKey = useStorageKey(baseStorageKey);

  const getRscAmount = () => {
    if (isExchangeRateLoading) return currency === 'RSC' ? inputAmount : 0;
    return currency === 'RSC' ? inputAmount : convertToRSC(inputAmount);
  };

  const { platformFee, daoFee, incFee, totalAmount: totalCost } = calculateBountyFees(getRscAmount());

  const handleCreateBounty = async () => {
    if (isSubmitting) return;

    const rscAmount = Math.round(getRscAmount());

    if (rscAmount < 10) {
      toast.error('Minimum bounty amount is 10 RSC');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Creating bounty...');

    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + parseInt(bountyLength));
      
      const apiContent = {
        type: 'doc',
        content: editorContent?.content || [],
      };

      const mentions = extractUserMentions(editorContent || {});

      const createdComment = await CommentService.createComment({
        workId: workId || selectedPaper?.id,
        contentType: 'paper',
        content: JSON.stringify(apiContent),
        contentFormat: 'TIPTAP',
        commentType: 'GENERIC_COMMENT',
        bountyAmount: rscAmount,
        bountyType,
        expirationDate: expirationDate.toISOString(),
        privacyType: 'PUBLIC',
        mentions,
      });

      if (createdComment) {
        removeCommentDraftById(storageKey);
        toast.success('Bounty created successfully!', { id: toastId });
        onSubmitSuccess?.();
      }
    } catch (error) {
      toast.error('Failed to create bounty.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCurrency = () => {
    if (isExchangeRateLoading) {
      toast.error('Exchange rate is loading.');
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

  return (
    <div className={className}>
      <div className="space-y-6">
        {step === 'details' ? (
          <>
            {!workId && (
              <div>
                <Search
                  onSelect={(paper) => {
                    setSelectedPaper({
                      id: paper.id?.toString() || paper.openalexId,
                      title: paper.displayName,
                      authors: paper.authors,
                    });
                    setShowSuggestions(false);
                  }}
                  displayMode="inline"
                  placeholder="Search for work..."
                  showSuggestionsOnFocus={!selectedPaper || showSuggestions}
                />
              </div>
            )}

            <div>
              <HeadlessRadioGroup value={bountyType} onChange={setBountyType}>
                <div className="space-y-2">
                  <HeadlessRadioGroup.Option value="REVIEW" className={({ checked }) => cn('relative flex cursor-pointer rounded-lg border p-4 focus:outline-none', checked ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200')}>
                    {({ checked }) => (
                      <div className="flex w-full items-center justify-between">
                        <div>
                          <p className={cn('font-medium', checked ? 'text-indigo-900' : 'text-gray-900')}>Peer Review</p>
                          <span className="text-sm text-gray-500">Get expert feedback on methodology</span>
                        </div>
                        {checked && <Star className="h-5 w-5 text-indigo-500" />}
                      </div>
                    )}
                  </HeadlessRadioGroup.Option>
                </div>
              </HeadlessRadioGroup>
            </div>

            <CurrencyInput
              value={getFormattedInputValue()}
              onChange={handleAmountChange}
              currency={currency}
              onCurrencyToggle={toggleCurrency}
              error={amountError}
              isExchangeRateLoading={isExchangeRateLoading}
              suggestedAmount={currency === 'USD' ? '150 USD' : `${Math.round(150 / exchangeRate)} RSC`}
            />

            <SessionAwareCommentEditor
              onUpdate={setEditorContent}
              placeholder="Add more details..."
              storageKey={storageKey}
            />

            <Button
              variant="default"
              className="w-full h-12"
              onClick={() => setStep('payment')}
              disabled={(!workId && !selectedPaper) || inputAmount === 0 || !!amountError}
            >
              Continue to Payment
            </Button>
          </>
        ) : (
          <div className="space-y-6">
            <FeeBreakdown
              rscAmount={getRscAmount()}
              platformFee={platformFee}
              daoFee={daoFee}
              incFee={incFee}
              totalAmount={totalCost}
              isExpanded={isFeesExpanded}
              onToggleExpand={() => setIsFeesExpanded(!isFeesExpanded)}
            />

            <BalanceInfo amount={totalCost} showWarning={userBalance < totalCost} />

            <Button
              variant="default"
              className="w-full h-12"
              onClick={handleCreateBounty}
              disabled={isSubmitting || userBalance < totalCost}
            >
              {isSubmitting ? 'Creating...' : 'Create Bounty'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
