'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { ResearchCoinRightSidebar } from '@/components/ResearchCoin/ResearchCoinRightSidebar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Search } from '@/components/Search/Search';
import { WorkSuggestion } from '@/types/search';
import { CommentEditor } from '@/components/Comment/CommentEditor';
import { JSONContent } from '@tiptap/core';
import { SessionProvider, useSession } from 'next-auth/react';
import { HubsSelector, Hub } from '@/app/paper/create/components/HubsSelector';
import { Currency } from '@/types/root';
import { BountyType } from '@/types/bounty';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { CommentService } from '@/services/comment.service';
import { PostService } from '@/services/post.service';
import { toast } from 'react-hot-toast';
import { CommentContent } from '@/components/Comment/lib/types';
import { BalanceInfo } from '@/components/modals/BalanceInfo';
import { useUser } from '@/contexts/UserContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { Progress } from '@/components/ui/Progress';
import {
  Star,
  MessageCircleQuestion,
  Loader2,
  ArrowLeft,
  ListCheck,
  FileText,
  DollarSign,
  BookOpen,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { PaperService } from '@/services/paper.service';
import { buildWorkUrl } from '@/utils/url';
import { Alert } from '@/components/ui/Alert';
import { Tooltip } from '@/components/ui/Tooltip';
import { Icon } from '@/components/ui/icons/Icon';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { extractUserMentions } from '@/components/Comment/lib/commentUtils';
import { removeCommentDraftById } from '@/components/Comment/lib/commentDraftStorage';

// Wizard steps.
// We intentionally separate review-specific and answer-specific steps.
// Shared                      : TYPE -> AMOUNT (submit)
// Peer-Review branch          : WORK
// Answer-to-Question branch   : TITLE -> CONTENT -> TOPICS

type WizardStep =
  | 'TYPE' // what is this bounty for?
  | 'WORK' // which work (peer review only)
  | 'DETAILS' // title & description (answer only)
  | 'DESCRIPTION' // review-only editor step
  | 'AMOUNT';

export default function CreateBountyPage() {
  const router = useRouter();
  const { exchangeRate, isLoading: isExchangeRateLoading } = useExchangeRate();
  const { showUSD, toggleCurrency: toggleGlobalCurrency } = useCurrencyPreference();
  const currency: Currency = showUSD ? 'USD' : 'RSC';

  // Wizard state
  const [step, setStep] = useState<WizardStep>('TYPE');
  const [bountyType, setBountyType] = useState<BountyType | null>(null);

  // Peer-review specific
  const [selectedPaper, setSelectedPaper] = useState<WorkSuggestion | null>(null);
  // Function to clear the currently selected paper
  const clearSelectedPaper = () => {
    setSelectedPaper(null);
    setPaperId(null);
    setReviewContent(null);
  };

  // After fetching full paper details we will store its internal ID here
  const [paperId, setPaperId] = useState<number | null>(null);
  const [isFetchingPaper, setIsFetchingPaper] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Answer-to-question specific
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionPlainText, setQuestionPlainText] = useState<string>('');
  const [questionHtml, setQuestionHtml] = useState<string>('');
  const [selectedHubs, setSelectedHubs] = useState<Hub[]>([]);

  // Shared – amount / currency
  const [inputAmount, setInputAmount] = useState<number>(0);
  const [amountError, setAmountError] = useState<string | undefined>();

  // User balance
  const { user } = useUser();
  const userBalance = user?.balance || 0;

  // Review comment editor content (peer review branch)
  const [reviewContent, setReviewContent] = useState<CommentContent | null>(null);

  // Define the formatted bounty text as a TipTap JSON structure
  const defaultBountyText = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: "I am looking for a high-quality, rigorous, and constructive peer review of this manuscript. If your expertise aligns well with this research, please submit your review within the bounty's time limit.",
          },
        ],
      },
    ],
  };

  // Initialise amount once exchange rate loads (150 USD equivalent)
  useEffect(() => {
    if (!isExchangeRateLoading && exchangeRate > 0 && inputAmount === 0) {
      if (showUSD) {
        setInputAmount(150); // 150 USD
      } else {
        setInputAmount(Math.round(150 / exchangeRate)); // 150 USD worth in RSC
      }
    }
  }, [exchangeRate, isExchangeRateLoading, inputAmount, showUSD]);

  /* ---------- Helpers ---------- */

  const rscAmount = (() => {
    if (currency === 'RSC') return inputAmount;
    if (isExchangeRateLoading || exchangeRate === 0) return 0;
    return inputAmount / exchangeRate;
  })();

  const validateAmount = (amount: number) => {
    if (amount <= 0) return 'Please enter an amount';
    // Calculate net after 9% fee
    const net = Math.round(amount * 0.91 * 100) / 100;
    if (net < 10) return 'Minimum bounty amount is 10 RSC (after fees)';
    return undefined;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    const num = parseFloat(rawValue);
    if (isNaN(num)) {
      setInputAmount(0);
      setAmountError('Please enter a valid number');
      return;
    }
    setInputAmount(num);
    const err = validateAmount(currency === 'RSC' ? num : num / exchangeRate);
    setAmountError(err);
  };

  const toggleCurrency = () => {
    if (isExchangeRateLoading && !showUSD) {
      toast.error('Exchange rate is loading. Please wait before switching to USD.');
      return;
    }

    // Convert the current input amount to the other currency
    if (showUSD) {
      // Switching from USD to RSC
      setInputAmount(Number((inputAmount / exchangeRate).toFixed(2)));
    } else {
      // Switching from RSC to USD
      setInputAmount(Number((inputAmount * exchangeRate).toFixed(2)));
    }

    // Toggle the global preference
    toggleGlobalCurrency();
  };

  /* ---------- Fees ---------- */
  const platformFee = Math.floor(rscAmount * 0.09);
  const netBountyAmount = rscAmount - platformFee;
  const totalAmount = rscAmount + platformFee;

  const FeeBreakdown = () => (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
      <div className="flex justify-between items-center">
        <span className="text-gray-900">Your contribution:</span>
        <span className="text-gray-900">{rscAmount.toLocaleString()} RSC</span>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-gray-600">Platform fees (9%)</span>
            <Tooltip
              content="This fee is used to maintain the platform and support the community"
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
          <span className="text-gray-600">+ {platformFee.toLocaleString()} RSC</span>
        </div>
      </div>

      <div className="border-t border-gray-200" />

      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-900">Total:</span>
        <span className="font-semibold text-gray-900">{totalAmount.toLocaleString()} RSC</span>
      </div>
    </div>
  );

  /* ---------- Submission ---------- */

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (amountError) return;
    if (!bountyType) return;

    setIsSubmitting(true);

    if (bountyType === 'REVIEW') {
      if (!paperId) {
        toast.error('Please select a work to review');
        setIsSubmitting(false);
        return;
      }
      const expirationDate = (() => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toISOString();
      })();
      const toastId = toast.loading('Creating bounty...');
      try {
        // Extract mentions from the review content
        const mentions =
          reviewContent && typeof reviewContent === 'object' && 'content' in reviewContent
            ? extractUserMentions(reviewContent as JSONContent)
            : [];

        await CommentService.createComment({
          workId: paperId.toString(),
          contentType: 'paper',
          content:
            typeof reviewContent === 'string' ? reviewContent : JSON.stringify(reviewContent),
          contentFormat: 'TIPTAP',
          commentType: 'GENERIC_COMMENT',
          bountyAmount: rscAmount,
          bountyType: 'REVIEW',
          expirationDate,
          privacyType: 'PUBLIC',
          mentions,
        });
        toast.success('Bounty created!', { id: toastId });

        router.push(
          buildWorkUrl({
            id: paperId,
            contentType: 'paper',
            slug: selectedPaper?.slug,
            tab: 'bounties',
          })
        );
      } catch (err) {
        console.error(err);
        toast.error('Failed to create bounty', { id: toastId });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Answer-to-question flow
    if (questionTitle.trim().length === 0) {
      toast.error('Please enter a title');
      setIsSubmitting(false);
      return;
    }
    if (!questionPlainText || questionPlainText.trim() === '') {
      toast.error('Please enter the question details');
      setIsSubmitting(false);
      return;
    }

    const toastId = toast.loading('Publishing question...');
    try {
      const post = await PostService.upsert({
        assign_doi: false,
        document_type: 'QUESTION',
        full_src: questionHtml,
        renderable_text: questionPlainText,
        hubs: selectedHubs.map((h) => Number(h.id)),
        title: questionTitle,
      });
      // After post creation, create the bounty comment with platform fee applied
      const expirationDate = (() => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toISOString();
      })();

      const bountyCommentContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: `Offering a bounty of ${rscAmount} RSC to the best answer to this question.`,
              },
            ],
          },
        ],
      } as any;

      await CommentService.createComment({
        workId: post.id.toString(),
        contentType: 'post',
        content: bountyCommentContent,
        bountyAmount: rscAmount,
        bountyType: 'ANSWER',
        expirationDate,
        privacyType: 'PUBLIC',
        commentType: 'GENERIC_COMMENT',
        mentions: [],
      });

      toast.success('Question published & bounty created!', { id: toastId });
      router.push(`/post/${post.id}/${post.slug}`);

      removeCommentDraftById(`question-editor-draft`);
    } catch (err) {
      console.error(err);
      let errorMessage = 'Failed to publish question';
      if (err && typeof err === 'object') {
        const e: any = err;
        // Priority: explicit msg field, then nested errors.msg (string | string[]), then generic message
        if (typeof e.msg === 'string') {
          errorMessage = e.msg;
        } else if (e.errors?.msg) {
          if (Array.isArray(e.errors.msg)) {
            errorMessage = e.errors.msg.join(', ');
          } else if (typeof e.errors.msg === 'string') {
            errorMessage = e.errors.msg;
          }
        } else if (typeof e.message === 'string') {
          errorMessage = e.message;
        }
      }
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- Navigation ---------- */

  const nextStep = () => {
    if (!bountyType) return;

    if (step === 'TYPE') {
      if (bountyType === 'REVIEW') setStep('WORK');
      else setStep('DETAILS');
      return;
    }
    if (step === 'WORK') {
      if (bountyType === 'REVIEW') {
        setStep('DESCRIPTION');
      } else {
        setStep('AMOUNT');
      }
      return;
    }
    if (step === 'DETAILS') {
      setStep('AMOUNT');
      return;
    }
    if (step === 'DESCRIPTION') {
      setStep('AMOUNT');
      return;
    }
  };

  const prevStep = () => {
    if (step === 'TYPE') return;
    if (step === 'WORK' || step === 'DETAILS') {
      setStep('TYPE');
      return;
    }
    if (step === 'DESCRIPTION') {
      setStep('WORK');
      return;
    }
    if (step === 'AMOUNT') {
      if (bountyType === 'REVIEW') setStep('WORK');
      else setStep('DETAILS');
    }
  };

  /* ---------- Render helpers ---------- */

  const renderTypeStep = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-medium text-gray-900">What is this bounty for?</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Choose the type of content you'd like to incentivize with your bounty
        </p>
      </div>
      <div className="space-y-4">
        <Button
          variant={bountyType === 'REVIEW' ? 'default' : 'outlined'}
          size="lg"
          className="w-full"
          onClick={() => setBountyType('REVIEW')}
        >
          <Star className="h-5 w-5 mr-2" />
          Peer Review
        </Button>
        <Button
          variant={bountyType === 'ANSWER' ? 'default' : 'outlined'}
          size="lg"
          className="w-full"
          onClick={() => setBountyType('ANSWER')}
        >
          <MessageCircleQuestion className="h-5 w-5 mr-2" />
          Answer to Question
        </Button>

        <Alert variant="info">
          Don't see an option you are looking for? That's okay - Choose "Answer to Question" and add
          your details even though it may not be a perfect fit.
        </Alert>
      </div>
    </div>
  );

  const renderWorkStep = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Which work is this bounty for?</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Search for the research paper you want to receive peer reviews for
        </p>
      </div>
      <Search
        onSelect={async (sugg) => {
          if (sugg.entityType !== 'paper') return;

          // Reset any previous selections
          setSelectedPaper(null);
          setPaperId(null);

          // Store the suggestion so user sees it immediately
          setSelectedPaper(sugg as WorkSuggestion);

          // Start fetching full paper details
          setIsFetchingPaper(true);

          try {
            const identifier = (sugg.id ? sugg.id.toString() : null) || sugg.doi || sugg.openalexId;

            // Use the pre-formatted defaultBountyText directly
            setReviewContent(defaultBountyText);

            const paper = await PaperService.get(identifier);
            setPaperId(paper.id);
          } catch (err) {
            console.error('Failed to fetch paper details', err);
            toast.error('Failed to load paper details. Please try again.');
            setSelectedPaper(null);
          } finally {
            setIsFetchingPaper(false);
          }
        }}
        displayMode="inline"
        placeholder="Search for work..."
        className="w-full [&_input]:bg-white"
        indices={['paper', 'post']}
      />
      {/* Show selected paper summary */}
      {selectedPaper && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50 flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="text-base font-medium text-gray-900 line-clamp-2">
              {selectedPaper.displayName}
            </h3>
            {selectedPaper.authors && selectedPaper.authors.length > 0 && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {selectedPaper.authors.join(', ')}
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={clearSelectedPaper} className="shrink-0">
            Change
          </Button>
        </div>
      )}
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ListCheck className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Question details</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Provide the details of your question for others to answer
          </p>
        </div>
        <Input
          label="Question title"
          value={questionTitle}
          onChange={(e) => setQuestionTitle(e.target.value)}
          placeholder="Question title..."
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
          <div className="p-2 pl-0 comment-editor-no-header-footer">
            {/* Hide header & footer using global styles */}
            <style jsx>{`
              :global(.comment-editor-no-header-footer > .border-b:first-of-type) {
                display: none;
              }
              :global(.comment-editor-no-header-footer .border-t) {
                display: none;
              }
            `}</style>
            <SessionAwareCommentEditor
              onSubmit={async () => {}}
              placeholder="Describe your question..."
              compactToolbar={true}
              storageKey={`question-editor-draft`}
              showHeader={false}
              showFooter={false}
              onContentChange={(plainText: string, html: string) => {
                setQuestionPlainText(plainText);
                setQuestionHtml(html);
              }}
            />
          </div>
        </div>
      </div>

      <div>
        <HubsSelector
          selectedHubs={selectedHubs}
          onChange={setSelectedHubs}
          error={null}
          hideSelectedItems={true}
        />
      </div>
    </div>
  );

  const renderAmountStep = () => {
    const suggestedAmount = isExchangeRateLoading
      ? 'Loading...'
      : currency === 'USD'
        ? '150 USD'
        : `${Math.round(150 / exchangeRate)} RSC`;

    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ResearchCoinIcon size={20} color="#6B7280" />
            <h3 className="text-lg font-medium text-gray-900">How much are you offering?</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Set the bounty amount you're willing to pay for a quality response
          </p>
        </div>

        <div className="relative">
          <Input
            name="amount"
            value={inputAmount === 0 ? '' : inputAmount.toString()}
            onChange={handleAmountChange}
            required
            label="I am offering"
            placeholder="0.00"
            type="text"
            inputMode="numeric"
            className={`w-full text-left h-12 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${amountError ? 'border-red-500' : ''}`}
            rightElement={
              <button
                type="button"
                onClick={toggleCurrency}
                className="flex items-center gap-1 pr-3 text-gray-900 hover:text-gray-600"
              >
                <span className="font-medium">{currency}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            }
          />
          {amountError && <p className="mt-1.5 text-xs text-red-500">{amountError}</p>}
          {!amountError && (
            <p className="mt-1.5 text-xs text-gray-500">
              Suggested amount: {suggestedAmount}
              {currency === 'RSC' && !isExchangeRateLoading && ' (150 USD)'}
            </p>
          )}
        </div>

        {/* Fees breakdown */}
        <FeeBreakdown />

        {/* User balance */}
        <BalanceInfo amount={totalAmount} showWarning={userBalance < totalAmount} />

        <div className="flex flex-col gap-4">
          <Button
            variant="default"
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={!!amountError || netBountyAmount < 10 || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : bountyType === 'REVIEW' ? (
              'Create Bounty'
            ) : (
              'Publish Question'
            )}
          </Button>

          {/* Info Alert */}
          <Alert variant="info" className="text-left">
            If no solution satisfies your request, the full bounty amount (excluding platform fee)
            will be refunded to you
          </Alert>
        </div>
      </div>
    );
  };

  const renderDescriptionStep = () => (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileText className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Bounty Description</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Provide details about your bounty requirements for peer reviewers
        </p>
      </div>
      <SessionAwareCommentEditor
        key={`editor-${paperId}`}
        initialContent={reviewContent || ''}
        onUpdate={(c: CommentContent) => setReviewContent(c)}
        onSubmit={async () => {}}
        placeholder="Edit your bounty description..."
        compactToolbar={true}
        storageKey={`peer-review-editor-draft-${paperId}`}
        showHeader={false}
        showFooter={false}
      />
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 'TYPE':
        return renderTypeStep();
      case 'WORK':
        return renderWorkStep();
      case 'DETAILS':
        return renderDetailsStep();
      case 'AMOUNT':
        return renderAmountStep();
      case 'DESCRIPTION':
        return renderDescriptionStep();
      default:
        return null;
    }
  };

  /* ---------- Page ---------- */

  // Contributors for the avatar display
  const journalContributors = [
    {
      src: '/people/maulik.jpeg',
      alt: 'Maulik Dhandha',
      tooltip: 'Maulik Dhandha, Editor',
    },
    {
      src: '/people/emilio.jpeg',
      alt: 'Emilio Merheb',
      tooltip: 'Emilio Merheb, Editor',
    },
    {
      src: '/people/dominikus_brian.jpeg',
      alt: 'Dominikus Brian',
      tooltip: 'Editorial Board Member',
    },
    {
      src: '/people/jeffrey_koury.jpeg',
      alt: 'Jeffrey Koury',
      tooltip: 'Editorial Board Member',
    },
    {
      src: '/people/blob_48esqmw.jpeg',
      alt: 'Journal Editor',
      tooltip: 'Editorial Board Member',
    },
  ];

  return (
    <PageLayout rightSidebar={<ResearchCoinRightSidebar />}>
      <div className="w-full max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className={`mt-4 ${step === 'TYPE' ? 'text-center' : 'text-left'}`}>
          <div className={`flex flex-col ${step === 'TYPE' ? 'items-center' : ''} gap-3`}>
            {step !== 'TYPE' && (
              <button
                type="button"
                onClick={prevStep}
                className="self-start p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            {step === 'TYPE' && (
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 ">
                <Icon name="earn1" size={32} className="ml-1" color="#2563eb" />
              </div>
            )}
            <h1
              className={`text-3xl font-bold text-gray-900 ${step !== 'TYPE' ? 'self-start' : ''}`}
            >
              Create a Bounty
            </h1>
            {/* Contributors avatars - only show on TYPE step */}
            {step === 'TYPE' && (
              <div className="flex items-center justify-center mt-4 bg-blue-50 rounded-lg py-3 px-4 border border-blue-100 flex-col gap-3 w-full">
                <div className="flex -space-x-2">
                  {journalContributors.map((contributor, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full ring-2 ring-white overflow-hidden"
                      title={contributor.tooltip}
                    >
                      <img
                        src={contributor.src}
                        alt={contributor.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <span className="text-sm text-blue-700 font-medium">
                  Engage{' '}
                  <span className="border-b border-blue-700 border-b-2 pb-0.5">thousands</span> of
                  researchers and academics to help with your inquiry
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        {bountyType && (
          <div className="mb-6 space-y-2">
            {(() => {
              const isReview = bountyType === 'REVIEW';
              const stepsArr = isReview
                ? ['TYPE', 'WORK', 'DESCRIPTION', 'AMOUNT']
                : ['TYPE', 'DETAILS', 'AMOUNT'];
              const labelsMap: Record<string, string> = {
                TYPE: 'Bounty type',
                WORK: 'Select work',
                DESCRIPTION: 'Bounty description',
                DETAILS: 'Question details',
                AMOUNT: 'Amount',
              };
              const currentIndex = stepsArr.indexOf(step);
              const currentLabel = labelsMap[step] || '';
              const nextLabel = stepsArr[currentIndex + 1]
                ? labelsMap[stepsArr[currentIndex + 1]]
                : null;
              return (
                <>
                  <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                    <span>
                      Current step: <span className="text-gray-900">{currentLabel}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      {nextLabel ? (
                        <>
                          Next: <span className="text-gray-900">{nextLabel}</span>
                        </>
                      ) : (
                        `${currentIndex + 1} of ${stepsArr.length}`
                      )}
                    </span>
                  </div>
                  <Progress
                    value={currentIndex + 1}
                    max={stepsArr.length}
                    className="[&>div]:bg-blue-600"
                  />
                </>
              );
            })()}
          </div>
        )}

        {/* Wizard body */}
        <div className="min-h-[300px]">{renderStep()}</div>

        {/* Navigation controls (Next only, except on AMOUNT) */}
        {step !== 'AMOUNT' && (
          <div className="flex justify-end pt-4">
            <Button
              variant="default"
              size="lg"
              onClick={nextStep}
              disabled={
                // step-specific validations
                (step === 'TYPE' && !bountyType) ||
                (step === 'WORK' && (!selectedPaper || !paperId || isFetchingPaper)) ||
                (step === 'DETAILS' &&
                  (questionTitle.trim().length === 0 ||
                    !questionPlainText ||
                    questionPlainText.trim().length === 0 ||
                    selectedHubs.length === 0)) ||
                (step === 'DESCRIPTION' && !reviewContent)
              }
            >
              {step === 'WORK' && isFetchingPaper ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Next'
              )}
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

// Session-aware wrapper for CommentEditor
const SessionAwareCommentEditor = (props: any) => {
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
