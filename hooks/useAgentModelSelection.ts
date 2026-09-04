'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useAgentModels, type AgentModelsStatus } from '@/hooks/useAgentModels';
import {
  findModel,
  normalizeGenerationOptions,
  unknownModel,
  type AgentModel,
  type GenerationOptions,
  type GenerationRequest,
} from '@/types/notebookModels';

const STORAGE_KEY = 'notebook:agent-model';

/** Stable empty list so consumers can depend on `models` by identity. */
const NO_MODELS: AgentModel[] = [];

/**
 * The user's raw choices, kept exactly as they made them. Values a given
 * model can't take are dropped on the way out rather than on the way in, so
 * an effort survives a detour through a model that doesn't offer it.
 */
interface StoredPreference extends GenerationOptions {
  ref?: string;
}

function readPreference(storageKey: string): StoredPreference {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed != null && typeof parsed === 'object' ? (parsed as StoredPreference) : {};
  } catch {
    // Unparseable, or storage denied — fall back to the server's defaults.
    return {};
  }
}

export interface UseAgentModelSelectionOptions {
  readonly enabled: boolean;
  /**
   * The model the open chat's first turn ran on. A conversation keeps its
   * model for life, so this — when set — outranks the user's standing choice.
   */
  readonly pinnedRef: string | null;
  readonly started?: boolean;
}

export interface AgentModelSelection {
  readonly status: AgentModelsStatus;
  readonly refresh: () => Promise<void>;
  readonly models: AgentModel[];
  /** The model the next turn runs on, or null while there is no catalog. */
  readonly model: AgentModel | null;
  /** The open chat has already committed to a model. */
  readonly pinned: boolean;
  /** The user's controls, narrowed to what {@link model} actually accepts. */
  readonly options: GenerationOptions;
  readonly selectModel: (ref: string) => void;
  /** Patch: pass a field as `undefined` to hand it back to the server. */
  readonly setOptions: (options: GenerationOptions) => void;
  /** Generation fields for a send, ready to spread into the request body. */
  readonly request: GenerationRequest;
}

/**
 * Which model the next turn runs on, and how.
 *
 * The model choice is a browser-level preference — the last one picked is the
 * one a new chat starts on — while a chat already under way reports its own
 * pin, which wins. The generation controls stay per-turn either way: the
 * server re-reads them on every message, so effort and thinking remain live
 * even on a chat whose model is settled.
 */
export function useAgentModelSelection({
  enabled,
  pinnedRef,
  started = false,
}: UseAgentModelSelectionOptions): AgentModelSelection {
  const { status, catalog, refresh } = useAgentModels(enabled);
  const { user } = useUser();
  const storageKey = `${STORAGE_KEY}:${user?.id ?? 'anonymous'}`;
  const pinned = started || pinnedRef != null;
  const [preference, setPreference] = useState<StoredPreference>({});
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);

  // Read after mount, never during initialization: localStorage is unavailable
  // on the server and a differing first client render would hydrate-mismatch.
  useEffect(() => {
    setPreference(readPreference(storageKey));
    setHydratedKey(storageKey);
  }, [storageKey]);

  useEffect(() => {
    if (hydratedKey !== storageKey) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(preference));
    } catch {
      // A blocked or full store just means the choice lasts this session.
    }
  }, [hydratedKey, storageKey, preference]);

  const models = catalog?.models ?? NO_MODELS;

  const model = useMemo(() => {
    if (catalog == null) return null;
    // A pinned ref is named even when the catalog no longer carries it, so a
    // chat on a retired model still says what it is running.
    if (pinnedRef) return findModel(models, pinnedRef) ?? unknownModel(pinnedRef);
    const allowedModels = models.filter((option) => option.allowed);
    return (
      findModel(allowedModels, hydratedKey === storageKey ? (preference.ref ?? null) : null) ??
      findModel(allowedModels, catalog.default) ??
      allowedModels[0] ??
      null
    );
  }, [catalog, models, pinnedRef, preference.ref, hydratedKey, storageKey]);

  const options = useMemo(
    () =>
      model && hydratedKey === storageKey ? normalizeGenerationOptions(model, preference) : {},
    [model, preference, hydratedKey, storageKey]
  );

  const selectModel = useCallback(
    (ref: string) => {
      if (pinned || !findModel(models, ref)?.allowed) return;
      setPreference((current) => ({ ...current, ref }));
    },
    [models, pinned]
  );

  const setOptions = useCallback((next: GenerationOptions) => {
    setPreference((current) => ({ ...current, ...next }));
  }, []);

  const request = useMemo<GenerationRequest>(() => {
    if (model == null) return {};
    // Naming the pinned model again would be accepted, but only while nothing
    // raced us. Leaving it out lets the server answer from its own record.
    return { ...(!pinned && model.allowed && { model: model.ref }), ...options };
  }, [model, options, pinned]);

  return {
    status,
    refresh,
    models,
    model,
    pinned,
    options,
    selectModel,
    setOptions,
    request,
  };
}
