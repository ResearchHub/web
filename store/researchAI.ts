import type { AgentModelCatalog } from '@/types/agentModels';
import { isBudgetExhausted, isResearchAIBudget, type ResearchAIBudget } from '@/types/researchAI';

export interface ResearchAIState {
  budget: ResearchAIBudget | null;
  budgetStatus: 'loading' | 'ok' | 'unavailable';
  catalog: AgentModelCatalog | null;
  catalogStatus: 'loading' | 'ok' | 'unavailable';
}

export const INITIAL_RESEARCH_AI_STATE: ResearchAIState = {
  budget: null,
  budgetStatus: 'loading',
  catalog: null,
  catalogStatus: 'loading',
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
  let catalogQueued = false;
  let budgetRevision = 0;
  let lastBudgetFetch = 0;

  const update = (patch: Partial<ResearchAIState>) => {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  };
  const acceptBudget = (budget: ResearchAIBudget) => {
    update({ budget, budgetStatus: 'ok' });
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

  const refreshCatalog = (force = false): Promise<void> => {
    if (catalogFlight) {
      // A model rejection can arrive after the active GET was snapshotted.
      // Queue one authoritative follow-up rather than accepting stale access.
      if (force) catalogQueued = true;
      return catalogFlight;
    }
    catalogFlight = loaders
      .catalog()
      .then((catalog) => update({ catalog, catalogStatus: 'ok' }))
      // Keep the last successful catalog through transient failures so an
      // already-selected model cannot silently turn into the server default.
      .catch(() => update({ catalogStatus: 'unavailable' }))
      .finally(() => {
        catalogFlight = null;
        if (catalogQueued) {
          catalogQueued = false;
          void refreshCatalog(true);
        }
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
    recordLimit: (value?: unknown) => {
      budgetRevision += 1;
      if (isResearchAIBudget(value)) acceptBudget(value);
      void refreshBudget(true);
    },
    isSubmissionBlocked: () => state.budget?.tier === 'blocked' || isBudgetExhausted(state.budget),
  };
}
