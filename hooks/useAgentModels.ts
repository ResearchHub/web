'use client';

import { useEffect, useState } from 'react';
import { AgentModelService } from '@/services/agentModel.service';
import type { AgentModelCatalog } from '@/types/notebookModels';

/**
 * `loading` until the first fetch settles; `unavailable` for every failure —
 * the gate, a network blip, a backend without the endpoint. All of them mean
 * the same thing to the UI: no picker, and turns run on the server's default.
 */
export type AgentModelsStatus = 'loading' | 'ok' | 'unavailable';

export interface UseAgentModelsResult {
  readonly status: AgentModelsStatus;
  readonly catalog: AgentModelCatalog | null;
}

// The catalog is per-deployment, not per-note or per-user-action: one fetch
// serves every panel this session. Only successes are cached, so a transient
// failure is retried by the next mount rather than disabling the picker for
// the rest of the session.
let cachedCatalog: AgentModelCatalog | null = null;
let inFlight: Promise<AgentModelCatalog> | null = null;

function loadCatalog(): Promise<AgentModelCatalog> {
  if (cachedCatalog) return Promise.resolve(cachedCatalog);
  inFlight ??= AgentModelService.listModels()
    .then((catalog) => {
      cachedCatalog = catalog;
      return catalog;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

/** The models this user may select. Fetched once, when something needs it. */
export function useAgentModels(enabled: boolean): UseAgentModelsResult {
  const [result, setResult] = useState<UseAgentModelsResult>(() =>
    cachedCatalog ? { status: 'ok', catalog: cachedCatalog } : { status: 'loading', catalog: null }
  );

  useEffect(() => {
    if (!enabled || result.catalog != null) return;
    let cancelled = false;
    loadCatalog().then(
      (catalog) => {
        if (!cancelled) setResult({ status: 'ok', catalog });
      },
      () => {
        // Deliberately terminal for this mount: the deps can't change back, so
        // a failing endpoint is asked once, not once per render.
        if (!cancelled) setResult({ status: 'unavailable', catalog: null });
      }
    );
    return () => {
      cancelled = true;
    };
  }, [enabled, result.catalog]);

  return result;
}
