'use client';

import { Sparkles } from 'lucide-react';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useFundingDrafting } from '@/components/Funding/useFundingDrafting';
import type { FundingIntent } from '@/components/Funding/fundingDirection';
import { HomePromoFrame, type HomePromoSlotProps } from './HomePromoFrame';

/** Kept from when this was the only promo, so earlier dismissals still hold. */
const DRAFT_WITH_AI_FEATURE = 'draft_with_ai_card';

/**
 * Tells people the workspace can draft an RFP or a proposal from a sentence,
 * with a door to each.
 */
export function DraftWithAIPromo({ variant, className }: HomePromoSlotProps) {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { startNew } = useFundingDrafting();
  const start = (intent: FundingIntent) => executeAuthenticatedAction(() => startNew(intent));

  return (
    <HomePromoFrame
      variant={variant}
      className={className}
      feature={DRAFT_WITH_AI_FEATURE}
      label="Draft with AI"
      eyebrow={{ icon: Sparkles, text: 'New · Drafting with AI' }}
      preview={<DraftPreview />}
      title="Let AI write the first draft"
      description="One sentence in, a full RFP or proposal out."
      primaryAction={{ label: 'New RFP', onClick: () => start('fund') }}
      secondaryAction={{ label: 'New proposal', onClick: () => start('need_funding') }}
    />
  );
}

/** A request turning into an RFP: what the workspace does, drawn rather than said. */
function DraftPreview() {
  return (
    <div className="flex flex-col gap-1.5 rounded-md bg-gray-100 p-2">
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
