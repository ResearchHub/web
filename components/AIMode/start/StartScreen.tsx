'use client';

import type { ReactNode } from 'react';
import type { FundingIntent } from '@/components/Funding/fundingDirection';
import { FundTeamLink } from './StartContextChips';
import { IntentTabs } from './IntentTabs';

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
 * will draft — an RFP or a proposal — before a word is typed.
 */
export function StartScreen({ greeting, intent, onIntentChange, composer }: StartScreenProps) {
  return (
    <div className="flex min-h-[60vh] flex-col justify-center gap-6">
      <h2 className="mb-2 text-center font-serif text-4xl tracking-tight text-gray-900">
        {greeting}
      </h2>

      <div className="flex flex-col">
        <IntentTabs value={intent} onChange={onIntentChange} />
        <div className="-mx-3">{composer}</div>
      </div>

      {/* Both intents keep this row, so switching never shifts the tabs and box. */}
      <div className="flex min-h-11 justify-center">{intent === 'fund' && <FundTeamLink />}</div>
    </div>
  );
}
