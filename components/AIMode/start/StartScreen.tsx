'use client';

import type { ReactNode } from 'react';
import type { FundingIntent } from '@/components/Funding/fundingDirection';
import { INTENT_COPY } from '../copy';
import { ConciergeCard } from './ConciergeCard';
import { StartJourney } from './StartJourney';

interface StartScreenProps {
  readonly greeting: string;
  /**
   * Which side of the money this conversation is on, decided by the door the
   * user came through: the composer's colour, wording and chips follow it.
   */
  readonly intent: FundingIntent;
  /**
   * The composer, whose first message starts the conversation. For a
   * researcher it carries the profile and RFP chips in its toolbar.
   */
  readonly composer: ReactNode;
}

/**
 * The new-conversation screen: describe the research you want to fund, or
 * the research you need funding for. What the assistant will draft — an RFP
 * or a proposal — was settled by the way in, before a word is typed. Beside
 * the composer, the road from this conversation to funded science.
 */
export function StartScreen({ greeting, intent, composer }: StartScreenProps) {
  return (
    <div className="flex min-h-[60vh] flex-col justify-center">
      {/* Side by side once the pane is wide enough; the rail drops under the composer before that. */}
      <div className="flex flex-col gap-2 wide:!flex-row wide:!items-center wide:!gap-10">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="font-serif text-4xl tracking-tight text-gray-900">{greeting}</h2>
            <p className="text-[15px] text-gray-500">{INTENT_COPY[intent].tagline}</p>
          </div>

          <div className="-mx-3">{composer}</div>

          {/* A funder can talk it through instead; a researcher's context is in the box's chips. */}
          {intent === 'fund' && <ConciergeCard className="-mt-2" />}
        </div>

        <StartJourney intent={intent} className="w-full shrink-0 wide:!w-[340px]" />
      </div>
    </div>
  );
}
