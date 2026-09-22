import type { FundingIntent } from '@/components/Funding/fundingDirection';
import { cn } from '@/utils/styles';
import { INTENT_COPY } from '../copy';

/**
 * How the composer looks when it starts a conversation: roomier than the
 * in-chat one, shadowed, its border and send button in the intent's colour —
 * blue when the user is here to fund, emerald when they need funding.
 */
export const START_COMPOSER_MIN_ROWS = 3;

/** The box's border, in the colour of the side of the money it is for. */
const INTENT_BOX_CLASS: Record<FundingIntent, string> = {
  fund: 'border-primary-200 focus-within:border-primary-300',
  need_funding: 'border-emerald-200 focus-within:border-emerald-300',
};

export function startComposerBoxClass(intent: FundingIntent, extra?: string): string {
  return cn(
    'rounded-2xl px-4 py-3 shadow-sm focus-within:shadow-md',
    INTENT_BOX_CLASS[intent],
    extra
  );
}

export function startComposerSendClass(intent: FundingIntent): string | undefined {
  return intent === 'need_funding' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : undefined;
}

export const startComposerPlaceholder = (intent: FundingIntent): string =>
  INTENT_COPY[intent].placeholder;
