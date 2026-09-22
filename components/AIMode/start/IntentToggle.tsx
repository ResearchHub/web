'use client';

import { FundingDirectionIcon } from '@/components/Funding/FundingDirectionIcon';
import {
  directionForIntent,
  FUNDING_DIRECTION,
  type FundingIntent,
} from '@/components/Funding/fundingDirection';
import { ButtonGroup } from '@/components/ui/ButtonGroup';
import { INTENT_COPY } from '../copy';

const INTENTS: readonly FundingIntent[] = ['fund', 'need_funding'];

interface IntentToggleProps {
  readonly value: FundingIntent;
  readonly onChange: (intent: FundingIntent) => void;
}

/** I want to fund | I need funding — each side in its money's colour. */
export function IntentToggle({ value, onChange }: IntentToggleProps) {
  return (
    <ButtonGroup
      size="lg"
      value={value}
      onChange={(next) => onChange(next as FundingIntent)}
      className="self-start rounded-[14px]"
      options={INTENTS.map((intent) => {
        const direction = directionForIntent(intent);
        return {
          value: intent,
          activeClassName: FUNDING_DIRECTION[direction].textClass,
          label: (
            <>
              <FundingDirectionIcon direction={direction} colored={intent === value} />
              {INTENT_COPY[intent].label}
            </>
          ),
        };
      })}
    />
  );
}
