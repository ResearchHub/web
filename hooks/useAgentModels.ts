'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { AgentModelService } from '@/services/agentModel.service';
import { chatErrorStatus } from '@/services/notebookChat.service';
import type { AgentModelCatalog } from '@/types/notebookModels';

export type AgentModelsStatus = 'loading' | 'ok' | 'unavailable' | 'unauthorized';

export interface UseAgentModelsResult {
  readonly status: AgentModelsStatus;
  readonly catalog: AgentModelCatalog | null;
  readonly refresh: () => Promise<void>;
}

/** Eligibility is user-specific and can change. Revalidate on every panel open. */
export function useAgentModels(enabled: boolean): UseAgentModelsResult {
  const { user } = useUser();
  const userId = user?.id;
  const sequence = useRef(0);
  const [result, setResult] = useState<{
    userId: typeof userId;
    status: AgentModelsStatus;
    catalog: AgentModelCatalog | null;
  }>({ userId, status: 'loading', catalog: null });

  const refresh = useCallback(async () => {
    const seq = ++sequence.current;
    setResult({ userId, status: 'loading', catalog: null });
    if (userId == null) return;
    try {
      const catalog = await AgentModelService.listModels();
      if (seq === sequence.current) setResult({ userId, status: 'ok', catalog });
    } catch (error) {
      if (seq !== sequence.current) return;
      const status = chatErrorStatus(error);
      setResult({
        userId,
        status: status === 401 || status === 403 ? 'unauthorized' : 'unavailable',
        catalog: null,
      });
    }
  }, [userId]);

  useEffect(() => {
    if (enabled) void refresh();
    return () => {
      sequence.current += 1;
    };
  }, [enabled, refresh]);

  return {
    ...(result.userId === userId ? result : { status: 'loading' as const, catalog: null }),
    refresh,
  };
}
