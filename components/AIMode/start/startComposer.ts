import type { FundingIntent } from '@/components/Funding/fundingDirection';
import { cn } from '@/utils/styles';
import { INTENT_COPY } from '../copy';
import { intentBoxClass } from './IntentTabs';

/**
 * How the composer looks when it starts a conversation: roomier than the
 * in-chat one, shadowed, its border and send button in the intent's colour.
 * One definition, whether it sits under the intent tabs in the workspace or
 * on its own under the My Funding tabs.
 */
export const START_COMPOSER_MIN_ROWS = 3;

export function startComposerBoxClass(intent: FundingIntent, extra?: string): string {
  return cn(
    'rounded-2xl px-4 py-3 shadow-sm focus-within:shadow-md',
    intentBoxClass(intent),
    extra
  );
}

export function startComposerSendClass(intent: FundingIntent): string | undefined {
  return intent === 'need_funding' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : undefined;
}

export const startComposerPlaceholder = (intent: FundingIntent): string =>
  INTENT_COPY[intent].placeholder;
