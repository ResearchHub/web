'use client';

import { useCallback, useEffect, useState } from 'react';
import { AgentModelService, chatErrorStatus } from '@/services/notebookChat.service';
import type { AgentModel, AvailableModels } from '@/types/notebookChat';

/** The user's standing choice for chats they start. Per browser, like the panel width. */
const STORAGE_KEY = 'notebook:agent-chat-model';

export type AgentModelsAccess = 'loading' | 'ok' | 'hidden' | 'error';

/**
 * Process-wide cache. The catalog is a server-side constant for the life of a
 * deployment, so every mount shares one fetch. Only successes are cached — a
 * failed load has to stay retryable on the next mount.
 */
let cachedCatalog: AvailableModels | null = null;
let inFlight: Promise<AvailableModels> | null = null;

function loadCatalog(): Promise<AvailableModels> {
  if (cachedCatalog) return Promise.resolve(cachedCatalog);
  if (!inFlight) {
    inFlight = AgentModelService.listModels()
      .then((catalog) => {
        cachedCatalog = catalog;
        return catalog;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

export interface UseAgentModelsResult {
  models: AgentModel[];
  /** Ref the backend runs for a turn carrying no selection; empty until loaded. */
  defaultRef: string;
  access: AgentModelsAccess;
  /** The ref a new chat should be started with — the user's choice, else the default. */
  selectedRef: string;
  selectModel: (ref: string) => void;
}

/**
 * The selectable model catalog plus the user's standing preference.
 *
 * The two belong together: a stored preference is only meaningful against the
 * roster that validates it, since the catalog is credential-aware and a model
 * can disappear between sessions. 401/403/404 collapse to `hidden` the same
 * way the chat listing does — the server-side gate is authoritative and the
 * picker simply doesn't appear.
 */
export function useAgentModels(enabled: boolean): UseAgentModelsResult {
  const [catalog, setCatalog] = useState<AvailableModels | null>(cachedCatalog);
  const [access, setAccess] = useState<AgentModelsAccess>(cachedCatalog ? 'ok' : 'loading');
  const [preference, setPreference] = useState('');

  // Read after mount, never during initialization: localStorage is unavailable
  // on the server and a differing first client render would hydrate-mismatch.
  useEffect(() => {
    setPreference(window.localStorage.getItem(STORAGE_KEY) ?? '');
  }, []);

  useEffect(() => {
    if (!enabled || cachedCatalog) return;
    let active = true;
    loadCatalog()
      .then((data) => {
        if (!active) return;
        setCatalog(data);
        setAccess('ok');
      })
      .catch((error: unknown) => {
        if (!active) return;
        const status = chatErrorStatus(error);
        setAccess(status === 401 || status === 403 || status === 404 ? 'hidden' : 'error');
      });
    return () => {
      active = false;
    };
  }, [enabled]);

  const selectModel = useCallback((ref: string) => {
    setPreference(ref);
    window.localStorage.setItem(STORAGE_KEY, ref);
  }, []);

  const models = catalog?.models ?? [];
  const defaultRef = catalog?.default ?? '';
  // A stored ref can name a model the catalog no longer offers (retired, or
  // its provider's credentials removed). Fall back to the server default
  // rather than submitting a selection the API would reject.
  const selectedRef = models.some((model) => model.ref === preference) ? preference : defaultRef;

  return { models, defaultRef, access, selectedRef, selectModel };
}
