'use client';

import { FundingDirectionIcon } from '@/components/Funding/FundingDirectionIcon';
import { directionForIntent, type FundingIntent } from '@/components/Funding/fundingDirection';
import { cn } from '@/utils/styles';
import { INTENT_COPY } from '../copy';

const INTENTS: readonly FundingIntent[] = ['fund', 'need_funding'];

/** The active tab and the composer box below it share the intent's colour. */
const INTENT_STYLE: Record<FundingIntent, { readonly tab: string; readonly box: string }> = {
  fund: {
    tab: 'border-primary-200 text-primary-700',
    box: 'border-primary-200 focus-within:border-primary-300',
  },
  need_funding: {
    tab: 'border-emerald-200 text-emerald-700',
    box: 'border-emerald-200 focus-within:border-emerald-300',
  },
};

/** Classes for the composer box under the tabs, so its border matches the open tab. */
export const intentBoxClass = (intent: FundingIntent): string => INTENT_STYLE[intent].box;

interface IntentTabsProps {
  readonly value: FundingIntent;
  readonly onChange: (intent: FundingIntent) => void;
}

/**
 * I want to fund | I need funding, as tabs on the composer's top edge: the
 * open one merges into the box, so the choice reads as what the box is for.
 */
export function IntentTabs({ value, onChange }: IntentTabsProps) {
  return (
    <div role="tablist" aria-label="What you are here to do" className="flex items-end gap-1">
      {INTENTS.map((intent) => {
        const active = intent === value;
        return (
          <button
            key={intent}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(intent)}
            className={cn(
              'relative flex items-center gap-2 rounded-t-xl border border-b-0 px-4 text-sm transition-colors',
              active
                ? cn('z-10 -mb-px bg-white pb-2 pt-2.5 font-semibold', INTENT_STYLE[intent].tab)
                : 'border-gray-200 bg-gray-50 pb-1.5 pt-2 font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <FundingDirectionIcon
              direction={directionForIntent(intent)}
              colored={active}
              className="h-[22px] w-[22px]"
            />
            {INTENT_COPY[intent].label}
          </button>
        );
      })}
    </div>
  );
}
