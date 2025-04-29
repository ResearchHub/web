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
import { extractTextFromTipTap } from '@/components/Comment/lib/commentContentUtils';
import { StarterKit } from '@tiptap/starter-kit';
import { generateHTML } from '@tiptap/core';
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
import { Progress } from '@/components/ui/Progress';
import { Star, MessageCircleQuestion, Loader2 } from 'lucide-react';
import { PaperService } from '@/services/paper.service';
import { buildWorkUrl } from '@/utils/url';

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
  const [questionContent, setQuestionContent] = useState<any>(null);
  const [selectedHubs, setSelectedHubs] = useState<Hub[]>([]);

  // Shared – amount / currency
  const [currency, setCurrency] = useState<Currency>('RSC');
  const [inputAmount, setInputAmount] = useState<number>(0);
  const [amountError, setAmountError] = useState<string | undefined>();

  // User balance
  const { user } = useUser();
  const userBalance = user?.balance || 0;

  // Review comment editor content (peer review branch)
  const [reviewContent, setReviewContent] = useState<CommentContent | null>(null);

  const defaultBountyText = `I am assigning an incentive of $150 in ResearchCoin (RSC) per review (up to 2 reviews) for a high-quality, rigorous, and constructive peer review of this manuscript. If your expertise aligns well with this research, please read ResearchHub's Peer Review Guide with details about the process and examples of awarded reviews.

Requirements:

Submit your review within 14 days of the date this bounty was initiated.

Disclose AI use. Please refer to the AI Policy for additional details.

Disclose conflicts of interest.

Use the rating system in the "Peer Reviews" tab for all 5 criteria: overall assessment, introduction, methods, results, and discussion.

Please enhance the scientific quality, rigor, and content of the manuscript and avoid summaries.

Please critically assess the figures and tables.

I will review and award up to 2 high-quality peer reviews within 1 week following the 14 day submission window.`;

  // Initialise amount once exchange rate loads (150 USD equivalent)
  useEffect(() => {
    if (!isExchangeRateLoading && exchangeRate > 0 && inputAmount === 0) {
      setInputAmount(Math.round(150 / exchangeRate));
    }
  }, [exchangeRate, isExchangeRateLoading, inputAmount]);

  /* ---------- Helpers ---------- */

  const rscAmount = (() => {
    if (currency === 'RSC') return inputAmount;
    if (isExchangeRateLoading || exchangeRate === 0) return 0;
    return inputAmount / exchangeRate;
  })();

  const validateAmount = (amount: number) => {
    if (amount <= 0) return 'Please enter an amount';
    if (amount < 10) return 'Minimum bounty amount is 10 RSC';
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
    if (isExchangeRateLoading && currency === 'RSC') {
      toast.error('Exchange rate is loading. Please wait before switching to USD.');
      return;
    }
    if (currency === 'RSC') {
      // convert current amount to USD when switching
      setInputAmount(Number((inputAmount * exchangeRate).toFixed(2)));
      setCurrency('USD');
    } else {
      setInputAmount(Number((inputAmount / exchangeRate).toFixed(2)));
      setCurrency('RSC');
    }
  };

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
    if (
      !questionContent ||
      (typeof questionContent === 'string' && questionContent.trim() === '')
    ) {
      toast.error('Please enter the question details');
      setIsSubmitting(false);
      return;
    }
    // Convert content to HTML & plain text
    let html = '';
    let plain = '';
    try {
      if (typeof questionContent === 'string') {
        html = questionContent;
        plain = questionContent.replace(/(<([^>]+)>)/gi, '');
      } else {
        html = generateHTML(questionContent, [StarterKit]);
        plain = extractTextFromTipTap(questionContent);
      }
    } catch (e) {
      console.error('Failed to convert content', e);
      html =
        typeof questionContent === 'string' ? questionContent : JSON.stringify(questionContent);
      plain = html.replace(/(<([^>]+)>)/gi, '');
    }
    const toastId = toast.loading('Publishing question...');
    try {
      await PostService.upsert({
        assign_doi: false,
        document_type: 'QUESTION',
        full_src: html,
        renderable_text: plain,
        hubs: selectedHubs.map((h) => Number(h.id)),
        title: questionTitle,
      });
      toast.success('Question published!', { id: toastId });
      router.push('/bounties');
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
      <h2 className="text-xl font-semibold text-gray-900">What is this bounty for?</h2>
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
      </div>
    </div>
  );

  const renderWorkStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Which work is this bounty for?</h2>
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
            const contentJson = {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: defaultBountyText }],
                },
              ],
            } as any;

            setReviewContent(contentJson);

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

      {/* Comment editor will now be shown in the next step (DESCRIPTION) */}
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-900">Question details</h2>
      <Input
        value={questionTitle}
        onChange={(e) => setQuestionTitle(e.target.value)}
        placeholder="Question title..."
      />
      <div className="p-2 comment-editor-no-header-footer">
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
          onUpdate={(content: CommentContent) => setQuestionContent(content)}
          placeholder="Describe your question..."
          compactToolbar={true}
          storageKey={`question-editor-draft`}
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Select relevant topics</h3>
        <HubsSelector selectedHubs={selectedHubs} onChange={setSelectedHubs} error={null} />
      </div>
    </div>
  );

  const renderAmountStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">How much are you offering?</h2>
      <Input
        value={inputAmount === 0 ? '' : inputAmount.toString()}
        onChange={handleAmountChange}
        placeholder="0.00"
        rightElement={
          <button
            type="button"
            onClick={toggleCurrency}
            className="flex items-center gap-1 pr-3 text-gray-900 hover:text-gray-600"
          >
            <span className="font-medium">{currency}</span>
          </button>
        }
        inputMode="numeric"
        className="w-full h-12 text-left"
      />
      {amountError && <p className="text-red-500 text-sm">{amountError}</p>}
      {!amountError && (
        <p className="text-gray-500 text-sm">
          Suggested amount:{' '}
          {isExchangeRateLoading
            ? 'Loading...'
            : currency === 'USD'
              ? '150 USD'
              : `${Math.round(150 / exchangeRate)} RSC`}
        </p>
      )}

      {/* User balance */}
      <BalanceInfo amount={rscAmount} showWarning={userBalance < rscAmount} />

      <div className="flex flex-col gap-4">
        <Button
          variant="default"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={!!amountError || rscAmount < 10 || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : bountyType === 'REVIEW' ? (
            'Create Bounty'
          ) : (
            'Publish Question'
          )}
        </Button>
      </div>

      {/* Back button */}
      <Button variant="ghost" size="lg" className="w-full" onClick={prevStep}>
        Back
      </Button>
    </div>
  );

  const renderDescriptionStep = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Bounty Description</h2>
      <SessionAwareCommentEditor
        key={`editor-${paperId}`}
        initialContent={reviewContent || ''}
        onUpdate={(c: CommentContent) => setReviewContent(c)}
        onSubmit={async () => {}}
        placeholder="Edit your bounty description..."
        compactToolbar={true}
        storageKey={`peer-review-editor-draft-${paperId}`}
        hideSubmit={true}
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

  return (
    <PageLayout rightSidebar={<ResearchCoinRightSidebar />}>
      <div className="w-full max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="mt-4">
          <h1 className="text-3xl font-bold text-gray-900">Create a Bounty</h1>
          <p className="mt-2 text-gray-600">
            Engage the world's brightest minds by offering ResearchCoin for peer reviews or answers
            to your research questions.
          </p>
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

        {/* Add extra space below progress bar */}
        {bountyType && <div className="h-4"></div>}

        {/* Wizard body */}
        <div className="min-h-[300px]">{renderStep()}</div>

        {/* Navigation controls (except on AMOUNT, where submit is primary) */}
        <div className="flex justify-between pt-4">
          <Button variant="ghost" size="lg" onClick={prevStep} disabled={step === 'TYPE'}>
            Back
          </Button>
          {step !== 'AMOUNT' && (
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
                    !questionContent ||
                    (typeof questionContent === 'string'
                      ? questionContent.trim().length === 0
                      : false) ||
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
          )}
        </div>
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
