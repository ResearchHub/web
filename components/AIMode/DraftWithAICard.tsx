'use client';

import { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useFundingDrafting } from '@/components/Funding/useFundingDrafting';
import type { FundingIntent } from '@/components/Funding/fundingDirection';
import { useDismissableFeature } from '@/hooks/useDismissableFeature';
import { cn } from '@/utils/styles';

/** One key for the toast and the card, so closing either closes both. */
export const DRAFT_WITH_AI_CARD_FEATURE = 'draft_with_ai_card';

/** Long enough that the page settles before the toast arrives. */
const TOAST_DELAY_MS = 1200;
/** Matches the toast's transition, so it finishes leaving before it unmounts. */
const TOAST_EXIT_MS = 300;

/**
 * Tells people the workspace can draft an RFP or a proposal from a sentence,
 * with a door to each. Above the feed on phones, where the bottom corner
 * belongs to the nav and the funding power bar. Shown until dismissed.
 */
export function DraftWithAICard({ className }: { readonly className?: string }) {
  const { isDismissed, dismissFeature, dismissStatus } = useDismissableFeature(
    DRAFT_WITH_AI_CARD_FEATURE
  );

  if (dismissStatus !== 'checked' || isDismissed) return null;

  return (
    <section
      aria-label="Draft with AI"
      className={cn(
        'relative rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm',
        className
      )}
    >
      <DraftWithAIContent onDismiss={dismissFeature} buttonClassName="h-11" />
    </section>
  );
}

/**
 * The same pitch as a toast in the bottom-right corner, from the tablet
 * breakpoint up. For a signed-out visitor it rides above the Join banner
 * while that is up, which publishes its height as `--join-banner-height`.
 */
export function DraftWithAIToast() {
  const { isDismissed, dismissFeature, dismissStatus } = useDismissableFeature(
    DRAFT_WITH_AI_CARD_FEATURE
  );
  const isEligible = dismissStatus === 'checked' && !isDismissed;
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    if (!isEligible) return;
    const timer = window.setTimeout(() => setIsShown(true), TOAST_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isEligible]);

  if (!isEligible) return null;

  const dismiss = () => {
    setIsShown(false);
    window.setTimeout(dismissFeature, TOAST_EXIT_MS);
  };

  return (
    <section
      aria-label="Draft with AI"
      inert={!isShown}
      className={cn(
        'fixed bottom-[calc(1.5rem+var(--join-banner-height,0px))] right-6 z-50 hidden w-[360px] tablet:!block',
        'rounded-2xl border border-gray-200 bg-white p-4',
        'shadow-[0_16px_40px_-12px_rgba(15,23,42,0.28),0_2px_6px_-2px_rgba(15,23,42,0.08)]',
        'transition-[opacity,transform,bottom] duration-300 ease-out motion-reduce:transition-none',
        isShown ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      )}
    >
      <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-primary-700">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        New · Drafting with AI
      </p>
      <DraftWithAIContent onDismiss={dismiss} />
    </section>
  );
}

function DraftWithAIContent({
  onDismiss,
  buttonClassName,
}: {
  readonly onDismiss: () => void;
  readonly buttonClassName?: string;
}) {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { startNew } = useFundingDrafting();
  const start = (intent: FundingIntent) => executeAuthenticatedAction(() => startNew(intent));

  return (
    <>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute right-1.5 top-1.5 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-3 pr-6">
        <DraftPreview className="w-32 shrink-0" />
        <div className="min-w-0">
          <h2 className="font-serif text-xl leading-tight text-gray-900">
            Let AI write the first draft
          </h2>
          <p className="mt-1 text-[13px] leading-snug text-gray-600">
            One sentence in, a full RFP or proposal out.
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button className={cn('font-semibold', buttonClassName)} onClick={() => start('fund')}>
          New RFP
        </Button>
        <Button
          className={cn('font-semibold', buttonClassName)}
          variant="outlined"
          onClick={() => start('need_funding')}
        >
          New proposal
        </Button>
      </div>
    </>
  );
}

/** A request turning into an RFP: what the workspace does, drawn rather than said. */
function DraftPreview({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('flex flex-col gap-1.5 rounded-md bg-gray-100 p-2', className)}>
      <p className="max-w-[84%] self-end rounded-[10px] rounded-br-sm bg-gray-900 px-1.5 py-1 text-[9.5px] leading-snug text-white">
        Fund early-career labs testing antivirals for long COVID
      </p>
      <div className="flex flex-col gap-1 rounded-md border border-gray-200 bg-white p-1.5">
        <p className="flex items-center gap-1 text-[8px] font-semibold tracking-wide text-primary-700">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
          RFP · DRAFTING
        </p>
        <span className="h-[5px] w-full rounded-full bg-gray-200" />
        <span className="h-[5px] w-[64%] rounded-full bg-gray-200" />
      </div>
    </div>
  );
}
