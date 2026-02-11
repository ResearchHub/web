'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { ResearchCoinRightSidebar } from '@/components/ResearchCoin/ResearchCoinRightSidebar';
import { Button } from '@/components/ui/Button';
import { Search } from '@/components/Search/Search';
import { JSONContent } from '@tiptap/core';
import { SessionProvider, useSession } from 'next-auth/react';
import { HubsSelector, Hub } from '@/app/paper/create/components/HubsSelector';
import { Currency } from '@/types/root';
import { BountyType } from '@/types/bounty';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { CommentService } from '@/services/comment.service';
import { PostService } from '@/services/post.service';
import { toast } from 'react-hot-toast';
import { BalanceInfo } from '@/components/modals/BalanceInfo';
import { useUser } from '@/contexts/UserContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { ArrowLeft, Star, MessageCircleQuestion, Loader2 } from 'lucide-react';
import { PaperService } from '@/services/paper.service';
import { buildWorkUrl } from '@/utils/url';
import { CurrencyInput } from '@/components/ui/form/CurrencyInput';
import { FeeBreakdown } from '@/components/Bounty/lib/FeeBreakdown';
import { useAmountInput } from '@/hooks/useAmountInput';
import { useCurrencyConversion } from '@/components/Bounty/lib/useCurrencyConversion';
import { calculateBountyFees } from '@/components/Bounty/lib/bountyUtil';
import { extractUserMentions } from '@/components/Comment/lib/commentUtils';
import { removeCommentDraftById } from '@/components/Comment/lib/commentDraftStorage';

type WizardStep = 'TYPE' | 'WORK' | 'DETAILS' | 'AMOUNT';

export default function CreateBountyPage() {
  const router = useRouter();
  const { exchangeRate, isLoading: isExchangeRateLoading } = useExchangeRate();
  const { showUSD, toggleCurrency: toggleGlobalCurrency } = useCurrencyPreference();
  const currency: Currency = showUSD ? 'USD' : 'RSC';
  const { convertToRSC, convertToUSD } = useCurrencyConversion(exchangeRate);

  const [step, setStep] = useState<WizardStep>('TYPE');
  const [bountyType, setBountyType] = useState<BountyType | null>(null);
  const [paperId, setPaperId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionTitle, setQuestionTitle] = useState('');
  const [selectedHubs, setSelectedHubs] = useState<Hub[]>([]);

  const {
    amount: inputAmount,
    setAmount: setInputAmount,
    error: amountError,
    handleAmountChange,
    getFormattedValue: getFormattedInputValue,
  } = useAmountInput();

  const { user } = useUser();
  const userBalance = user?.balance || 0;

  const rscAmount = currency === 'RSC' ? inputAmount : convertToRSC(inputAmount);
  const { platformFee, totalAmount } = calculateBountyFees(rscAmount);

  const toggleCurrency = () => {
    if (isExchangeRateLoading) return;
    setInputAmount(showUSD ? convertToRSC(inputAmount) : convertToUSD(inputAmount));
    toggleGlobalCurrency();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading('Creating bounty...');
    try {
      await CommentService.createComment({
        workId: paperId?.toString() || '0',
        contentType: 'paper',
        content: JSON.stringify({ type: 'doc', content: [] }),
        bountyAmount: rscAmount,
        bountyType: bountyType || 'REVIEW',
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      toast.success('Bounty created!', { id: toastId });
      router.push('/feed');
    } catch (err) {
      toast.error('Failed', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout rightSidebar={<ResearchCoinRightSidebar />}>
      <div className="max-w-2xl mx-auto py-10 space-y-10">
        <h1 className="text-3xl font-bold">Create a Bounty</h1>
        
        {step === 'TYPE' && (
          <div className="grid grid-cols-2 gap-4">
             <Button variant="outlined" onClick={() => { setBountyType('REVIEW'); setStep('WORK'); }}>Peer Review</Button>
             <Button variant="outlined" onClick={() => { setBountyType('ANSWER'); setStep('AMOUNT'); }}>Question</Button>
          </div>
        )}

        {step === 'WORK' && (
          <Search onSelect={(s) => { setPaperId(Number(s.id)); setStep('AMOUNT'); }} displayMode="inline" />
        )}

        {step === 'AMOUNT' && (
          <div className="space-y-6">
            <CurrencyInput
              value={getFormattedInputValue()}
              onChange={handleAmountChange}
              currency={currency}
              onCurrencyToggle={toggleCurrency}
              error={amountError}
            />
            <FeeBreakdown rscAmount={rscAmount} platformFee={platformFee} totalAmount={totalAmount} />
            <BalanceInfo amount={totalAmount} showWarning={userBalance < totalAmount} />
            <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>Create</Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
