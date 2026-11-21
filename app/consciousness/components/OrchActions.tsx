'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { ArrowRight, Plus } from 'lucide-react';
import { cn } from '@/utils/styles';

interface OrchActions {
  /**
   * Start a proposal for this RFP. The workspace cannot be told which of the
   * page's questions it answers, so every entry point starts the same draft.
   */
  submitProposal: () => void;
  /** Open the contribute panel for the RFP's funding pool. */
  addToPool: () => void;
}

export const OrchActionsContext = createContext<OrchActions | null>(null);

/**
 * The page's two actions, adding to the pool (the primary one) and submitting
 * a proposal, before any RFP is loaded: each only says it opens soon. With
 * the RFP loaded, `LiveRfpActions` replaces both with the real flows.
 */
export function OrchActionsProvider({ children }: { children: ReactNode }) {
  const submitProposal = useCallback(() => {
    toast('Proposals open soon.', { id: 'orch-action' });
  }, []);

  const addToPool = useCallback(() => {
    toast('Funding opens soon.', { id: 'orch-action' });
  }, []);

  const value = useMemo(() => ({ submitProposal, addToPool }), [submitProposal, addToPool]);
  return <OrchActionsContext.Provider value={value}>{children}</OrchActionsContext.Provider>;
}

function useOrchActions() {
  const ctx = useContext(OrchActionsContext);
  if (!ctx) throw new Error('useOrchActions must be used within OrchActionsProvider');
  return ctx;
}

type Size = 'sm' | 'md' | 'lg';

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-5 text-[14px]',
  lg: 'h-12 px-6 text-[15px]',
};

export function SubmitProposalButton({
  size = 'md',
  label = 'Submit a proposal',
  className,
}: {
  size?: Size;
  label?: string;
  className?: string;
}) {
  const { submitProposal } = useOrchActions();
  return (
    <button
      type="button"
      onClick={submitProposal}
      className={cn('o-btn o-btn-ghost', SIZES[size], className)}
    >
      {label}
      <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={2.2} />
    </button>
  );
}

export function AddToPoolButton({
  size = 'md',
  label = 'Fund the research',
  className,
}: {
  size?: Size;
  label?: string;
  className?: string;
}) {
  const { addToPool } = useOrchActions();
  return (
    <button
      type="button"
      onClick={addToPool}
      className={cn('o-btn o-btn-gold', SIZES[size], className)}
    >
      <Plus aria-hidden className="h-4 w-4" strokeWidth={2.2} />
      {label}
    </button>
  );
}

/** A quiet text link that starts a proposal on one question. */
export function TrackApplyLink({ label }: { label: string }) {
  const { submitProposal } = useOrchActions();
  return (
    <button
      type="button"
      onClick={submitProposal}
      className="group inline-flex items-center gap-2 text-[15px] font-medium text-[var(--o-gold)] hover:text-[var(--o-text)]"
    >
      {label}
      <ArrowRight
        aria-hidden
        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
      />
    </button>
  );
}
