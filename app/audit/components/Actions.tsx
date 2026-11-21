'use client';

import { useContext } from 'react';
import { ArrowDown, ArrowRight, Plus } from 'lucide-react';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { OrchActionsContext } from '@/app/consciousness/components/OrchActions';
import { cn } from '@/utils/styles';
import { HOW_TO_APPLY_ID } from '../data/content';

/**
 * The page's two buttons, in its own style. The actions are the RFP landing
 * pages' shared ones (`OrchActionsContext`): adding to the pool and starting
 * a proposal.
 */
function useActions() {
  const ctx = useContext(OrchActionsContext);
  if (!ctx) throw new Error('The audit page buttons need an actions provider');
  return ctx;
}

type Size = 'sm' | 'md' | 'lg';

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-5 text-[14px]',
  lg: 'h-12 px-6 text-[15px]',
};

export function AddToPoolButton({
  size = 'md',
  label = 'Fund the audit',
  className,
}: {
  size?: Size;
  label?: string;
  className?: string;
}) {
  const { addToPool } = useActions();
  return (
    <button
      type="button"
      onClick={addToPool}
      className={cn('a-btn a-btn-solid', SIZES[size], className)}
    >
      <Plus aria-hidden className="h-4 w-4" strokeWidth={2.2} />
      {label}
    </button>
  );
}

export function SubmitProposalButton({
  size = 'md',
  label = 'Submit a proposal',
  className,
}: {
  size?: Size;
  label?: string;
  className?: string;
}) {
  const { submitProposal } = useActions();
  return (
    <button
      type="button"
      onClick={submitProposal}
      className={cn('a-btn a-btn-line', SIZES[size], className)}
    >
      {label}
      <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={2.2} />
    </button>
  );
}

/**
 * A quiet link to the FAQ's "How do I apply?", which it opens and scrolls
 * to. `placement` says where on the page it was clicked, for the funnel.
 */
export function HowToApplyLink({
  placement,
  className,
}: {
  placement: 'hero' | 'dock';
  className?: string;
}) {
  const open = () => {
    AnalyticsService.logEvent(LogEvent.RFP_HOW_TO_APPLY_CLICKED, { page: 'audit', placement });
    const entry = document.getElementById(HOW_TO_APPLY_ID);
    if (entry instanceof HTMLDetailsElement) entry.open = true;
  };
  return (
    <a
      href={`#${HOW_TO_APPLY_ID}`}
      onClick={open}
      className={cn(
        'inline-flex items-center gap-1 text-[13.5px] font-medium text-[var(--a-soft)] underline decoration-[color:var(--a-line-2)] underline-offset-4 transition-colors hover:text-[var(--a-ink)]',
        className
      )}
    >
      See how to apply
      <ArrowDown aria-hidden className="h-3.5 w-3.5" strokeWidth={2.2} />
    </a>
  );
}
