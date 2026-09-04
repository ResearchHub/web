'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAgentModels, type AgentModelsStatus } from '@/hooks/useAgentModels';
import {
  findModel,
  modelMultiplierExplanation,
  normalizeGenerationOptions,
  unknownModel,
  type AgentModel,
  type GenerationOptions,
  type GenerationRequest,
} from '@/types/notebookModels';

const NO_MODELS: AgentModel[] = [];
interface StoredPreference extends GenerationOptions {
  ref?: string;
}

export interface UseAgentModelSelectionOptions {
  readonly enabled: boolean;
  readonly canSelect: boolean;
  readonly conversationKey: string;
  readonly locked: boolean;
  /**
   * The model the open chat's first turn ran on. A conversation keeps its
   * model for life, so this — when set — outranks the new-chat default.
   */
  readonly pinnedRef: string | null;
}

export interface AgentModelSelection {
  readonly status: AgentModelsStatus;
  readonly multiplierExplanation: string;
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

/** New conversations start with the API default; choices live only in this chat. */
export function useAgentModelSelection({
  enabled,
  canSelect,
  conversationKey,
  locked,
  pinnedRef,
}: UseAgentModelSelectionOptions): AgentModelSelection {
  const { status, catalog } = useAgentModels(enabled);
  const [choice, setChoice] = useState<{ key: string; preference: StoredPreference }>({
    key: conversationKey,
    preference: {},
  });
  const preference = choice.key === conversationKey ? choice.preference : {};
  useEffect(() => {
    setChoice({ key: conversationKey, preference: {} });
  }, [conversationKey]);
  const models = useMemo(
    () => catalog?.models.filter((model) => model.allowed) ?? NO_MODELS,
    [catalog]
  );

  const model = useMemo(() => {
    if (catalog == null) return null;
    // A pinned ref is named even when the catalog no longer carries it, so a
    // chat on a retired model still says what it is running.
    if (pinnedRef) return findModel(catalog.models, pinnedRef) ?? unknownModel(pinnedRef);
    return (
      findModel(models, preference.ref ?? null) ??
      findModel(models, catalog.default) ??
      models[0] ??
      null
    );
  }, [catalog, models, pinnedRef, preference.ref]);

  const options = useMemo(
    () => (model ? normalizeGenerationOptions(model, preference) : {}),
    [model, preference]
  );

  const selectModel = useCallback(
    (ref: string) => {
      if (!canSelect || locked || !models.some((model) => model.ref === ref)) return;
      setChoice((current) => ({
        key: conversationKey,
        preference: { ...(current.key === conversationKey ? current.preference : {}), ref },
      }));
    },
    [canSelect, locked, models, conversationKey]
  );

  const setOptions = useCallback(
    (next: GenerationOptions) => {
      if (!canSelect) return;
      setChoice((current) => ({
        key: conversationKey,
        preference: { ...(current.key === conversationKey ? current.preference : {}), ...next },
      }));
    },
    [canSelect, conversationKey]
  );

  const request = useMemo<GenerationRequest>(() => {
    if (!canSelect || model == null || !model.allowed) return {};
    return { ...(!locked && { model: model.ref }), ...options };
  }, [canSelect, model, options, locked]);

  return {
    status,
    multiplierExplanation: modelMultiplierExplanation(catalog),
    models,
    model,
    pinned: locked,
    options,
    selectModel,
    setOptions,
    request,
  };
}
