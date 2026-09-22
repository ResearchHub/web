'use client';

import type { ReactNode } from 'react';
import type { FundingIntent } from '@/components/Funding/fundingDirection';
import { Logo } from '@/components/ui/Logo';
import type { SelectedGrantDetails } from '@/types/grant';
import { IntentCtas } from './IntentCtas';
import { IntentToggle } from './IntentToggle';

interface StartScreenProps {
  readonly greeting: string;
  readonly intent: FundingIntent;
  readonly onIntentChange: (intent: FundingIntent) => void;
  readonly selectedGrant: SelectedGrantDetails | null;
  readonly onSelectGrant: (grant: SelectedGrantDetails | null) => void;
  /** The composer, whose first message starts the conversation. */
  readonly composer: ReactNode;
}

/**
 * The new-conversation screen: say whether you are here to fund research or
 * to get yours funded, then describe it. The choice fixes what the assistant
 * will draft — an RFP or a proposal — before a word is typed.
 */
export function StartScreen({
  greeting,
  intent,
  onIntentChange,
  selectedGrant,
  onSelectGrant,
  composer,
}: StartScreenProps) {
  return (
    <div className="flex min-h-[60vh] flex-col justify-center gap-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
          <Logo size={34} noText />
        </div>
        <h2 className="font-serif text-3xl tracking-tight text-gray-900">{greeting}</h2>
      </div>

      <div className="flex justify-center">
        <IntentToggle value={intent} onChange={onIntentChange} />
      </div>

      <div className="-mx-3">{composer}</div>

      <IntentCtas intent={intent} selectedGrant={selectedGrant} onSelectGrant={onSelectGrant} />
    </div>
  );
}
