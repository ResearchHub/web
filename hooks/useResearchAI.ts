'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { useSession } from 'next-auth/react';
import { ApiClient } from '@/services/client';
import { AgentModelService } from '@/services/agentModel.service';
import { createResearchAIStore, INITIAL_RESEARCH_AI_STATE } from '@/store/researchAI';

const stores = new Map<string, ReturnType<typeof createResearchAIStore>>();
const createStore = () =>
  createResearchAIStore({
    budget: () => ApiClient.get('/api/research_ai/usage-budget/'),
    catalog: () => AgentModelService.listModels(),
  });

/** Session-scoped memory only: never persist allowances or share them between accounts. */
export function useResearchAI(enabled = false) {
  const { data: session } = useSession();
  const token = session?.authToken;
  const store = useMemo(() => {
    if (!token || typeof window === 'undefined') return createStore();
    let current = stores.get(token);
    if (!current) {
      current = createStore();
      stores.set(token, current);
    }
    return current;
  }, [token]);
  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => INITIAL_RESEARCH_AI_STATE
  );

  useEffect(() => {
    if (!enabled || !token) return;
    const refresh = () => {
      void store.refreshBudget(true);
      void store.refreshCatalog();
    };
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [enabled, token, store]);

  // Refresh at reset even when the composer is idle. Failed/stale reset reads
  // retry with a bounded delay rather than leaving Send disabled all day.
  useEffect(() => {
    if (!enabled || !token) return;
    const resetsAt = state.budget?.resets_at ?? state.limitResetAt;
    if (!resetsAt) return;
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;
    const schedule = () => {
      timer = setTimeout(
        async () => {
          await store.refreshBudget(true);
          if (!cancelled) schedule();
        },
        Math.min(
          2_147_483_647,
          Math.max(
            5_000,
            Date.parse(store.getSnapshot().budget?.resets_at ?? resetsAt) - Date.now() + 1000
          )
        )
      );
    };
    schedule();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, token, store, state.budget?.resets_at, state.limitResetAt]);

  return { ...state, ...store };
}
