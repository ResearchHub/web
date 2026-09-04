'use client';

import { useResearchAI } from '@/hooks/useResearchAI';
import type { AgentModelCatalog } from '@/types/notebookModels';

export type AgentModelsStatus = 'loading' | 'ok' | 'unavailable';
export interface UseAgentModelsResult {
  readonly status: AgentModelsStatus;
  readonly catalog: AgentModelCatalog | null;
}

/** Availability is user-specific and refreshed with the shared AI budget. */
export function useAgentModels(enabled: boolean): UseAgentModelsResult {
  const { catalog, catalogStatus } = useResearchAI(enabled);
  return { catalog, status: catalogStatus };
}
