'use client';

import type { ReactNode } from 'react';
import { BaseMenu } from '@/components/ui/form/BaseMenu';
import { FundingDraftMenuItems } from './fundingDraftOptions';
import type { FundingIntent } from './fundingDirection';

/** The choice between an RFP and a proposal, opened from `trigger`. */
export function NewDraftMenu({
  trigger,
  onSelect,
  align = 'start',
}: {
  readonly trigger: ReactNode;
  readonly onSelect: (intent: FundingIntent) => void;
  readonly align?: 'start' | 'end';
}) {
  return (
    <BaseMenu
      align={align}
      sideOffset={4}
      className="w-[320px] max-w-[calc(100vw-1rem)] rounded-xl p-1"
      trigger={trigger}
    >
      <FundingDraftMenuItems onSelect={(option) => onSelect(option.intent)} />
    </BaseMenu>
  );
}
