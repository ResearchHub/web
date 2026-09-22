'use client';

import type { ReactNode } from 'react';
import type { FundingIntent } from '@/components/Funding/fundingDirection';
import { INTENT_COPY } from '../copy';
import { FundTeamLink } from './StartContextChips';
import { IntentTabs } from './IntentTabs';
import { StartJourney } from './StartJourney';

interface StartScreenProps {
  readonly greeting: string;
  readonly intent: FundingIntent;
  readonly onIntentChange: (intent: FundingIntent) => void;
  /**
   * The composer, whose first message starts the conversation. Its box sits
   * right under the intent tabs and takes their colour; for a researcher it
   * carries the profile and RFP chips in its toolbar.
   */
  readonly composer: ReactNode;
}

/**
 * The new-conversation screen: say whether you are here to fund research or
 * to get yours funded, then describe it. The choice fixes what the assistant
 * will draft — an RFP or a proposal — before a word is typed. Beside the
 * composer, the road from this conversation to funded science.
 */
export function StartScreen({ greeting, intent, onIntentChange, composer }: StartScreenProps) {
  return (
    <div className="flex min-h-[60vh] flex-col justify-center">
      {/* Side by side once the pane is wide enough; the rail drops under the composer before that. */}
      <div className="flex flex-col gap-2 wide:!flex-row wide:!items-center wide:!gap-10">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="font-serif text-4xl tracking-tight text-gray-900">{greeting}</h2>
            <p className="text-[15px] text-gray-500">{INTENT_COPY[intent].tagline}</p>
          </div>

          <div className="flex flex-col">
            <IntentTabs value={intent} onChange={onIntentChange} />
            <div className="-mx-3">{composer}</div>
          </div>

          {/* Both intents keep this row, so switching never shifts the tabs and box. */}
          <div className="-mt-3 flex min-h-11 items-center">
            {intent === 'fund' && <FundTeamLink />}
          </div>
        </div>

        <StartJourney intent={intent} className="w-full shrink-0 wide:!w-[340px]" />
      </div>
    </div>
  );
}
