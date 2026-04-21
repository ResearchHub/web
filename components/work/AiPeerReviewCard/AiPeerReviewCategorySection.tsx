'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/pro-solid-svg-icons';
import type { CategoryBlock, ItemDecisionValue } from '@/types/aiPeerReview';
import { cn } from '@/utils/styles';
import { Tooltip } from '@/components/ui/Tooltip';
import { humanizeItemKey } from './labels';

interface CategorySectionProps {
  label: string;
  block: CategoryBlock;
}

const DECISION_TEXT: Record<ItemDecisionValue, string> = {
  Yes: 'text-green-700',
  No: 'text-red-700',
  Partial: 'text-amber-700',
  'N/A': 'text-gray-500',
};

export function AiPeerReviewCategorySection({ label, block }: CategorySectionProps) {
  const [open, setOpen] = useState(false);
  const itemEntries = Object.entries(block.items);

  return (
    <div className="rounded-lg border border-gray-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5">
          <FontAwesomeIcon
            icon={faChevronDown}
            className={cn(
              'h-3 w-3 text-gray-500 transition-transform',
              open ? 'rotate-0' : '-rotate-90'
            )}
          />
          <span className="text-sm font-medium text-gray-900">{label}</span>
        </div>
      </button>
      {open && itemEntries.length > 0 && (
        <ul className="border-t border-gray-200 px-4 py-3 space-y-2">
          {itemEntries.map(([key, decision]) => {
            const labelText = humanizeItemKey(key);
            const labelNode = decision.justification ? (
              <Tooltip content={decision.justification} width="w-72" position="top">
                <span className="cursor-help border-b border-dashed border-gray-300 text-sm text-gray-800">
                  {labelText}
                </span>
              </Tooltip>
            ) : (
              <span className="text-sm text-gray-800">{labelText}</span>
            );
            return (
              <li key={key} className="flex items-center justify-between gap-2">
                {labelNode}
                <span className={cn('text-sm font-medium', DECISION_TEXT[decision.decision])}>
                  {decision.decision}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
