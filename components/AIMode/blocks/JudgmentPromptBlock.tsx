'use client';

import { ArrowRight, Check, Scale } from 'lucide-react';
import { cn } from '@/utils/styles';
import { useAIMode } from '../lib/AIModeContext';
import type { GrantRecord } from '../lib/types';

const formatUsd = (amount: number) => `$${amount.toLocaleString('en-US')}`;

interface JudgmentPromptBlockProps {
  readonly grant: GrantRecord | null;
}

/**
 * The transcript's handle on the judgment document. Editing and confirming
 * happen in the side panel; this card says what the rules currently are and
 * whether they are active, so the turn still reads as complete once the panel
 * is closed.
 */
export const JudgmentPromptBlock = ({ grant }: JudgmentPromptBlockProps) => {
  const { actions } = useAIMode();

  if (!grant) return null;

  const { policy, confirmed } = grant.judgment;
  const summary =
    policy.mode === 'ai'
      ? `AI-managed · ${policy.minReviewScore.toFixed(1)} review bar · up to ${formatUsd(policy.maxPerProposalUsd)} per proposal`
      : `Self-managed · ${policy.minReviewScore.toFixed(1)} review bar · you release every dollar`;

  return (
    <button
      type="button"
      onClick={() => actions.openDocument('judgment', 'policy')}
      className={cn(
        'group flex w-full max-w-[520px] items-center gap-4 rounded-2xl border p-4 text-left transition-colors',
        confirmed
          ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100/70'
          : 'border-gray-200 bg-white shadow-sm hover:border-primary-300 hover:bg-gray-50'
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          confirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-primary-50 text-primary-600'
        )}
      >
        {confirmed ? <Check className="h-5 w-5" /> : <Scale className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold text-gray-900">
          {confirmed ? 'Judgment rules active' : 'Judgment rules · draft'}
        </div>
        <div className="truncate text-sm text-gray-600">{summary}</div>
      </div>
      <div className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary-600">
        {confirmed ? 'View' : 'Review'}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
};
