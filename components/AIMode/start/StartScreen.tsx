'use client';

import { useId, useState, type ReactNode } from 'react';
import type { FundingIntent } from '@/components/Funding/fundingDirection';
import { INTENT_COPY } from '../copy';
import { ConciergeCard } from './ConciergeCard';
import { HowItWorksCard, HowItWorksSteps } from './HowItWorks';
import { VisibilityCard } from './VisibilityCard';

interface StartScreenProps {
  readonly greeting: string;
  /**
   * Which side of the money the draft is on, decided by the door the user
   * came through: the composer's colour, wording and chips follow it.
   */
  readonly intent: FundingIntent;
  /**
   * The composer, whose first message creates the draft. For a researcher it
   * carries the profile and RFP chips in its toolbar.
   */
  readonly composer: ReactNode;
  /** Examples to send, under the composer. */
  readonly presets?: ReactNode;
}

/**
 * The screen that starts a new draft: describe the research you want to
 * fund, or the research you need funding for. What the assistant will draft
 * — an RFP or a proposal — was settled by the way in, before a word is
 * typed. One column; the document appears beside the chat once it exists.
 */
export function StartScreen({ greeting, intent, composer, presets }: StartScreenProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[680px] flex-col justify-center gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-serif text-4xl tracking-tight text-gray-900">{greeting}</h2>
        <p className="text-[15px] text-gray-500">{INTENT_COPY[intent].tagline}</p>
      </div>

      <div className="-mx-3">{composer}</div>

      {presets && <div className="-mt-2 mb-4">{presets}</div>}

      {/* Under the box, one card each: a funder can talk it through instead;
          a researcher hears who will see the proposal. */}
      {intent === 'fund' && <FunderCards />}
      {intent === 'need_funding' && <VisibilityCard className="-mt-2" />}
    </div>
  );
}

/**
 * A funder's pair under the composer: talk it through with a person, or see
 * how it works, which opens the steps beneath both.
 */
function FunderCards() {
  const [open, setOpen] = useState(false);
  const stepsId = useId();
  return (
    <div className="-mt-2 flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
        <ConciergeCard />
        <HowItWorksCard
          expanded={open}
          onToggle={() => setOpen((value) => !value)}
          controls={stepsId}
        />
      </div>
      {open && <HowItWorksSteps id={stepsId} />}
    </div>
  );
}
