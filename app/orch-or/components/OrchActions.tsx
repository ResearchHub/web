'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { ArrowRight, Plus } from 'lucide-react';
import { cn } from '@/utils/styles';
import { ORCH_OR_RFP } from '../data/mockRfp';

interface OrchActions {
  /** Start a proposal for this RFP, optionally from one question. */
  submitProposal: (trackId?: string) => void;
  /** Open the contribute panel for the RFP's funding pool. */
  addToPool: () => void;
}

const OrchActionsContext = createContext<OrchActions | null>(null);

/**
 * The page's two actions. This preview round only says where each would go.
 *
 * Live wiring, once the RFP exists (see docs/orch-or-rfp-landing-plan.md §7):
 * - Wrap the page in `FundPanelProvider` → `GrantPageProvider` →
 *   `FundraiseProvider`, as `app/rfp/[id]/[slug]/layout.tsx` does, ideally by
 *   rendering this page from that layout when the RFP id matches, so the
 *   canonical /rfp/:id/:slug URL and its data fetch are kept.
 * - `submitProposal` = `useGrantPage().applyToRfp`: it stores the RFP in
 *   sessionStorage and routes to `/workspace?new=proposal&rfp=<grantId>`.
 *   The question id is not passed today; it could prefill the workspace later.
 * - `addToPool` = `useFundPanel().openFundPanel`, and this provider must mount
 *   `<ContributeToFundraiseModal mode="fundingPool" variant="panel" … />`
 *   itself (as `WorkHeaderGrant` does), because this page has no WorkHeader.
 */
export function OrchActionsProvider({ children }: { children: ReactNode }) {
  const submitProposal = useCallback((trackId?: string) => {
    toast(
      `Preview: this opens the AI proposal workspace for this RFP${
        trackId ? ` (question: ${trackId})` : ''
      }.`,
      { id: 'orch-action' }
    );
  }, []);

  const addToPool = useCallback(() => {
    toast(`Preview: this opens the panel for adding to the ${ORCH_OR_RFP.funder.name} pool.`, {
      id: 'orch-action',
    });
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
  trackId,
  label = 'Submit a proposal',
  className,
}: {
  size?: Size;
  trackId?: string;
  label?: string;
  className?: string;
}) {
  const { submitProposal } = useOrchActions();
  return (
    <button
      type="button"
      onClick={() => submitProposal(trackId)}
      className={cn('o-btn o-btn-gold', SIZES[size], className)}
    >
      {label}
      <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={2.2} />
    </button>
  );
}

export function AddToPoolButton({
  size = 'md',
  label = 'Add to the pool',
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
      className={cn('o-btn o-btn-ghost', SIZES[size], className)}
    >
      <Plus aria-hidden className="h-4 w-4" strokeWidth={2.2} />
      {label}
    </button>
  );
}

/** A quiet text link that starts a proposal on one question. */
export function TrackApplyLink({ trackId, label }: { trackId: string; label: string }) {
  const { submitProposal } = useOrchActions();
  return (
    <button
      type="button"
      onClick={() => submitProposal(trackId)}
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
