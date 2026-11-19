'use client';

import { useContext } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { OrchActionsContext } from '@/app/consciousness/components/OrchActions';
import { cn } from '@/utils/styles';

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
  label = 'Add to the pool',
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

/** A quiet text link that starts a proposal. */
export function ProposeLink({ label }: { label: string }) {
  const { submitProposal } = useActions();
  return (
    <button type="button" onClick={submitProposal} className="a-link group">
      {label}
      <ArrowRight
        aria-hidden
        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
      />
    </button>
  );
}
