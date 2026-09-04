import type { AgentModelCatalog } from '@/types/notebookModels';
import { isBudgetExhausted, isResearchAIBudget, type ResearchAIBudget } from '@/types/researchAI';

export interface ResearchAIState {
  budget: ResearchAIBudget | null;
  budgetStatus: 'loading' | 'ok' | 'unavailable';
  catalog: AgentModelCatalog | null;
  catalogStatus: 'loading' | 'ok' | 'unavailable';
  /** A provider may reject its next call while some recorded credits remain. */
  limitResetAt: string | null;
}

export const INITIAL_RESEARCH_AI_STATE: ResearchAIState = {
  budget: null,
  budgetStatus: 'loading',
  catalog: null,
  catalogStatus: 'loading',
  limitResetAt: null,
};

/** One store per authenticated session, shared across notes and AI workflows. */
export function createResearchAIStore(loaders: {
  budget: () => Promise<unknown>;
  catalog: () => Promise<AgentModelCatalog>;
}) {
  let state = INITIAL_RESEARCH_AI_STATE;
  const listeners = new Set<() => void>();
  let budgetFlight: Promise<void> | null = null;
  let catalogFlight: Promise<void> | null = null;
  let budgetQueued = false;
  let budgetRevision = 0;
  let lastBudgetFetch = 0;

  const update = (patch: Partial<ResearchAIState>) => {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  };
  const acceptBudget = (budget: ResearchAIBudget) => {
    update({
      budget,
      budgetStatus: 'ok',
      limitResetAt:
        state.limitResetAt && Date.parse(budget.resets_at) <= Date.parse(state.limitResetAt)
          ? state.limitResetAt
          : null,
    });
  };

  const refreshBudget = (force = false): Promise<void> => {
    if (budgetFlight) {
      // A terminal event may follow the snapshot of the currently running GET.
      if (force) budgetQueued = true;
      return budgetFlight;
    }
    if (!force && Date.now() - lastBudgetFetch < 15_000) return Promise.resolve();
    lastBudgetFetch = Date.now();
    const revision = budgetRevision;
    budgetFlight = loaders
      .budget()
      .then((value) => {
        if (revision !== budgetRevision) return;
        if (!isResearchAIBudget(value)) throw new Error('Credit budget unavailable');
        acceptBudget(value);
      })
      .catch(() => {
        if (revision === budgetRevision) update({ budgetStatus: 'unavailable' });
      })
      .finally(() => {
        budgetFlight = null;
        if (budgetQueued) {
          budgetQueued = false;
          void refreshBudget(true);
        }
      });
    return budgetFlight;
  };

  const refreshCatalog = (): Promise<void> => {
    if (catalogFlight) return catalogFlight;
    catalogFlight = loaders
      .catalog()
      .then((catalog) => update({ catalog, catalogStatus: 'ok' }))
      .catch(() => update({ catalog: null, catalogStatus: 'unavailable' }))
      .finally(() => {
        catalogFlight = null;
      });
    return catalogFlight;
  };

  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    refreshBudget,
    refreshCatalog,
    /** 429 budget is top-level, and must outrank an older in-flight GET. */
    recordLimit: (value?: unknown, occurredAt?: string | null) => {
      // Reopening yesterday's failed conversation must not exhaust today's allowance.
      if (
        occurredAt &&
        Number.isFinite(Date.parse(occurredAt)) &&
        new Date(occurredAt).toISOString().slice(0, 10) !== new Date().toISOString().slice(0, 10)
      )
        return;
      budgetRevision += 1;
      if (isResearchAIBudget(value)) acceptBudget(value);
      const nextReset = new Date();
      nextReset.setUTCHours(24, 0, 0, 0);
      const knownReset = state.budget?.resets_at;
      update({
        limitResetAt:
          knownReset && Date.parse(knownReset) > Date.now() ? knownReset : nextReset.toISOString(),
      });
      void refreshBudget(true);
    },
    isSubmissionBlocked: () =>
      state.budget?.tier === 'blocked' ||
      isBudgetExhausted(state.budget) ||
      state.limitResetAt !== null,
  };
}
