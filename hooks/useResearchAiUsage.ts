'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useUser } from '@/contexts/UserContext';
import { ApiClient } from '@/services/client';
import { NotebookChatService, chatErrorStatus } from '@/services/notebookChat.service';
import { researchAiJobs } from '@/store/researchAiJobs';
import type { ResearchAiUsageBudget } from '@/types/researchAiUsage';

/** Account-wide usage and known executions survive chat/note switches. */
export function useResearchAiUsage(enabled: boolean) {
  const { user } = useUser();
  const userId = String(user?.id ?? '');
  const snapshot = useSyncExternalStore(
    researchAiJobs.subscribe,
    () => researchAiJobs.getSnapshot(userId),
    researchAiJobs.getServerSnapshot
  );
  const [state, setState] = useState<{
    userId: string;
    budget: ResearchAiUsageBudget | null;
    failed: boolean;
  }>({ userId, budget: null, failed: false });
  const sequence = useRef(0);
  const refresh = useCallback(async (): Promise<ResearchAiUsageBudget | null> => {
    if (!userId) return null;
    const seq = ++sequence.current;
    try {
      const budget = await ApiClient.get<ResearchAiUsageBudget>('/api/research_ai/usage-budget/');
      if (seq !== sequence.current) return null;
      setState({ userId, budget, failed: false });
      return budget;
    } catch {
      if (seq === sequence.current) {
        setState((current) => ({
          userId,
          budget: current.userId === userId ? current.budget : null,
          failed: true,
        }));
      }
      return null;
    }
  }, [userId]);

  useEffect(() => {
    if (enabled) void refresh();
    return () => {
      sequence.current += 1;
    };
  }, [enabled, refresh, snapshot.completed]);

  const budget = state.userId === userId ? state.budget : null;
  // Refresh when today's window expires, including after a background-tab sleep.
  useEffect(() => {
    if (!enabled) return;
    const onFocus = () => {
      void refresh();
    };
    window.addEventListener('focus', onFocus);
    const delay = budget ? new Date(budget.resets_at).getTime() - Date.now() : NaN;
    const timer =
      Number.isFinite(delay) && delay > 0
        ? setTimeout(onFocus, Math.min(delay + 1000, 2_147_483_647))
        : undefined;
    return () => {
      window.removeEventListener('focus', onFocus);
      clearTimeout(timer);
    };
  }, [enabled, budget?.resets_at, refresh]);

  useEffect(() => {
    if (!enabled || snapshot.jobs.length === 0) return;
    let cancelled = false;
    let inFlight = false;
    const poll = async () => {
      if (inFlight) return;
      inFlight = true;
      await Promise.all(
        snapshot.jobs.map(async (job) => {
          try {
            const chat = await NotebookChatService.getChat(job.noteId, job.chatId, { live: true });
            if (!cancelled) researchAiJobs.observe(userId, job.noteId, chat);
          } catch (error) {
            // Lost note access must not leave a permanent local lock.
            if (!cancelled && [401, 403, 404].includes(chatErrorStatus(error) ?? 0)) {
              researchAiJobs.forget(userId, job.chatId);
            }
          }
        })
      );
      inFlight = false;
    };
    void poll();
    const timer = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [enabled, userId, snapshot.jobs]);

  return {
    budget,
    failed: state.userId === userId && state.failed,
    busy: snapshot.submitting || snapshot.jobs.length > 0,
    refresh,
  };
}
