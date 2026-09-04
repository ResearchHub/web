'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAgentModels, type AgentModelsStatus } from '@/hooks/useAgentModels';
import {
  findModel,
  modelMultiplierExplanation,
  normalizeGenerationOptions,
  unknownModel,
  type AgentModel,
  type EffortLevel,
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
  /** Any recorded turn locks effort, including legacy turns without a model. */
  readonly effortPinned: boolean;
  /** Latest execution's saved effort. Null means the server did not record it. */
  readonly pinnedEffort: EffortLevel | null;
}

export interface AgentModelSelection {
  readonly status: AgentModelsStatus;
  readonly multiplierExplanation: string;
  readonly models: AgentModel[];
  /** The model the next turn runs on, or null while there is no catalog. */
  readonly model: AgentModel | null;
  /** The open chat has already committed to a model. */
  readonly pinned: boolean;
  readonly effortPinned: boolean;
  /** Compatible controls, including the chat's saved effort for display. */
  readonly options: GenerationOptions;
  readonly selectModel: (ref: string) => void;
  /** Patch: pass a field as `undefined` to hand it back to the server. */
  readonly setOptions: (options: GenerationOptions) => void;
  /** Generation fields for a send, ready to spread into the request body. */
  readonly request: GenerationRequest;
}

/**
 * New chats start with the API default and keep choices only for that chat.
 * Model and effort lock after the first turn; thinking and temperature remain
 * configurable when the saved model/effort combination supports them.
 */
export function useAgentModelSelection({
  enabled,
  canSelect,
  conversationKey,
  locked,
  pinnedRef,
  effortPinned,
  pinnedEffort,
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
    () => (model ? normalizeGenerationOptions(model, preference, effortPinned, pinnedEffort) : {}),
    [model, preference, effortPinned, pinnedEffort]
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
      // A saved effort stays visible, but must never overwrite this chat's
      // choice or leak into its later requests.
      const { effort, ...perTurn } = next;
      const patch = effortPinned ? perTurn : next;
      setChoice((current) => ({
        key: conversationKey,
        preference: { ...(current.key === conversationKey ? current.preference : {}), ...patch },
      }));
    },
    [canSelect, conversationKey, effortPinned]
  );

  const request = useMemo<GenerationRequest>(() => {
    if (!canSelect || model == null || !model.allowed) return {};
    const { effort, ...perTurn } = options;
    return {
      ...(!locked && { model: model.ref }),
      ...(effortPinned ? perTurn : options),
    };
  }, [canSelect, model, options, locked, effortPinned]);

  return {
    status,
    multiplierExplanation: modelMultiplierExplanation(catalog),
    models,
    model,
    pinned: locked,
    effortPinned,
    options,
    selectModel,
    setOptions,
    request,
  };
}
