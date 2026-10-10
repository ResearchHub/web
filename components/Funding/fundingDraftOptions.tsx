'use client';

import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { FUNDING_KIND_ICON } from './fundingKind';
import type { FundingIntent } from './fundingDirection';

export interface FundingDraftOption {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: ReactNode;
  /** Which side of the money the option starts: an RFP funds, a proposal needs funding. */
  readonly intent: FundingIntent;
}

/** The two things a user can start drafting: wherever a new draft is offered, these are the choices. */
export const FUNDING_DRAFT_OPTIONS: readonly FundingDraftOption[] = [
  {
    id: 'give-funding',
    title: 'Request for Proposal',
    description: 'Fund specific research you care about',
    icon: (
      <FontAwesomeIcon icon={FUNDING_KIND_ICON.rfp} className="h-[18px] w-[18px] text-gray-700" />
    ),
    intent: 'fund',
  },
  {
    id: 'request-funding',
    title: 'Proposal',
    description: 'Raise money for your research',
    icon: (
      <FontAwesomeIcon
        icon={FUNDING_KIND_ICON.proposal}
        className="h-[18px] w-[18px] text-gray-700"
      />
    ),
    intent: 'need_funding',
  },
];

/** One option's face: its icon in a tile, its name and what it is for. */
export function FundingDraftOptionContent({ option }: { readonly option: FundingDraftOption }) {
  return (
    <div className="relative flex w-full items-center gap-3 pr-6">
      <div className="flex-shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 transition-colors duration-150 group-hover:bg-gray-50">
          {option.icon}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold tracking-[0.01em] text-gray-900">{option.title}</div>
        <div className="text-xs text-gray-600">{option.description}</div>
      </div>
      <ChevronRight className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-900 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    </div>
  );
}

/** The options as items of a `BaseMenu`. */
export function FundingDraftMenuItems({
  onSelect,
}: {
  readonly onSelect: (option: FundingDraftOption) => void;
}) {
  return (
    <div className="space-y-1">
      {FUNDING_DRAFT_OPTIONS.map((option) => (
        <BaseMenuItem
          key={option.id}
          onClick={() => onSelect(option)}
          className="group w-full cursor-pointer rounded-lg px-2 py-2 transition-colors duration-150 hover:bg-gray-100 focus:bg-gray-100"
        >
          <FundingDraftOptionContent option={option} />
        </BaseMenuItem>
      ))}
    </div>
  );
}
