/**
 * Types for the agent model catalog (`GET /api/research_ai/models/`) and the
 * per-turn generation controls a selected model accepts.
 *
 * Wire shapes stay snake_case-free but verbatim, like `types/notebookChat.ts`.
 *
 * The catalog says *what* each model accepts (its `capabilities`); the rules
 * below say which *combinations* the backend will take. They mirror
 * `research_ai.services.agent.model_capabilities.validate_generation_options`,
 * so the picker can only ever assemble a legal request — an illegal pairing
 * is a control that isn't offered, never a 400 on send.
 */

/** Provider names the catalog uses; the ref prefix is one of these. */
export const CLAUDE_PLATFORM = 'claude_platform';
export const OPENROUTER = 'openrouter';

export const EFFORT_LEVELS = ['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'] as const;
export type EffortLevel = (typeof EFFORT_LEVELS)[number];

export const THINKING_MODES = ['adaptive', 'disabled'] as const;
export type ThinkingMode = (typeof THINKING_MODES)[number];

export const TEMPERATURE_MIN = 0;
export const TEMPERATURE_MAX = 2;
export const TEMPERATURE_STEP = 0.05;
/** Where the slider parks while temperature is unset — mid-range, sent to nobody. */
export const TEMPERATURE_NEUTRAL = 1;

export const EFFORT_LABELS: Record<EffortLevel, string> = {
  none: 'None',
  minimal: 'Minimal',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  xhigh: 'Very high',
  max: 'Max',
};

export const THINKING_LABELS: Record<ThinkingMode, string> = {
  adaptive: 'On',
  disabled: 'Off',
};

/** Optional request controls one model accepts, straight from the catalog. */
export interface AgentModelCapabilities {
  /** Selectable effort levels; empty means the model takes no effort at all. */
  readonly effort: EffortLevel[];
  /** Selectable thinking modes; empty means the model takes no thinking flag. */
  readonly thinking: ThinkingMode[];
  readonly temperature: boolean;
}

export interface AgentModel {
  /** Canonical `<provider>:<model id>` ref — exactly what a request sends. */
  readonly ref: string;
  readonly label: string;
  readonly description: string;
  readonly provider: string;
  readonly capabilities: AgentModelCapabilities;
}

export interface AgentModelCatalog {
  /** The ref that runs when a request names no model. */
  readonly default: string;
  /** Server-ordered: strongest first within each family. */
  readonly models: AgentModel[];
}

/**
 * Per-turn model controls. Every field is optional and an omitted one means
 * "whatever the server is configured to do", which is the resting state of
 * the picker — nothing is sent until the user asks for it.
 */
export interface GenerationOptions {
  readonly effort?: EffortLevel;
  readonly thinking?: ThinkingMode;
  readonly temperature?: number;
}

/** The generation fields of a send, ready to spread into the request body. */
export interface GenerationRequest extends GenerationOptions {
  /**
   * Omitted once the conversation is pinned: the server keeps the model its
   * first turn ran on and rejects an attempt to change it.
   */
  readonly model?: string;
}

/** Raw catalog response — `capabilities` arrives as open-ended strings. */
export interface AgentModelCatalogResponse {
  default?: string;
  models?: Array<{
    ref?: string;
    label?: string;
    description?: string;
    provider?: string;
    capabilities?: {
      effort?: string[];
      thinking?: string[];
      temperature?: boolean;
    };
  }>;
}

function isEffortLevel(value: string): value is EffortLevel {
  return (EFFORT_LEVELS as readonly string[]).includes(value);
}

function isThinkingMode(value: string): value is ThinkingMode {
  return (THINKING_MODES as readonly string[]).includes(value);
}

/** The provider half of a ref; the whole ref when it carries no prefix. */
export function providerOf(ref: string): string {
  const separator = ref.indexOf(':');
  return separator === -1 ? ref : ref.slice(0, separator);
}

/** The model-id half of a ref, e.g. `openai/gpt-5.6-sol`. */
export function modelIdOf(ref: string): string {
  const separator = ref.indexOf(':');
  return separator === -1 ? ref : ref.slice(separator + 1);
}

/**
 * Narrow a catalog response, dropping controls this client has no copy for.
 * A newer backend adding an effort level shows the levels we do know rather
 * than an unlabelled pill, and a malformed entry drops out entirely.
 */
export function toAgentModelCatalog(response: AgentModelCatalogResponse): AgentModelCatalog {
  const models: AgentModel[] = [];
  for (const model of response.models ?? []) {
    if (!model?.ref) continue;
    models.push({
      ref: model.ref,
      label: model.label?.trim() || modelIdOf(model.ref),
      description: model.description ?? '',
      provider: model.provider || providerOf(model.ref),
      capabilities: {
        effort: (model.capabilities?.effort ?? []).filter(isEffortLevel),
        thinking: (model.capabilities?.thinking ?? []).filter(isThinkingMode),
        temperature: model.capabilities?.temperature === true,
      },
    });
  }
  return { default: response.default ?? '', models };
}

export function findModel(models: AgentModel[], ref: string | null): AgentModel | null {
  if (!ref) return null;
  return models.find((model) => model.ref === ref) ?? null;
}

/**
 * Display stand-in for a ref the catalog doesn't offer — a chat pinned to a
 * model since retired, or one whose provider lost its credentials. Its
 * capabilities read empty, so it is named but never configured.
 */
export function unknownModel(ref: string): AgentModel {
  return {
    ref,
    label: modelIdOf(ref) || ref,
    description: '',
    provider: providerOf(ref),
    capabilities: { effort: [], thinking: [], temperature: false },
  };
}

/**
 * Effort levels legal alongside `thinking`.
 *
 * OpenRouter maps effort onto one reasoning budget, so the two controls can
 * contradict each other: with thinking off the only effort it will take is
 * the one asking for none, and with thinking on that same level is the
 * contradiction. Claude Opus 5 separately refuses its top two levels with
 * thinking off.
 */
export function availableEffortLevels(
  model: AgentModel,
  thinking: ThinkingMode | undefined
): EffortLevel[] {
  let levels: EffortLevel[] = model.capabilities.effort;
  if (model.provider === OPENROUTER) {
    if (thinking === 'disabled') levels = levels.filter((level) => level === 'none');
    if (thinking === 'adaptive') levels = levels.filter((level) => level !== 'none');
  }
  if (thinking === 'disabled' && modelIdOf(model.ref).toLowerCase().includes('opus-5')) {
    levels = levels.filter((level) => level !== 'xhigh' && level !== 'max');
  }
  return levels;
}

/**
 * Whether a temperature may accompany `thinking`. Claude Platform rejects
 * sampling params on any model that reasons unless reasoning is explicitly
 * turned off — leaving thinking unset is not enough for it.
 */
export function temperatureAvailable(
  model: AgentModel,
  thinking: ThinkingMode | undefined
): boolean {
  if (!model.capabilities.temperature) return false;
  if (model.provider === CLAUDE_PLATFORM && model.capabilities.thinking.length > 0) {
    return thinking === 'disabled';
  }
  return true;
}

/** Snap to the slider's step and the server's finite 0–2 range. */
export function clampTemperature(value: number): number | undefined {
  if (!Number.isFinite(value)) return undefined;
  const clamped = Math.min(TEMPERATURE_MAX, Math.max(TEMPERATURE_MIN, value));
  return Number((Math.round(clamped / TEMPERATURE_STEP) * TEMPERATURE_STEP).toFixed(2));
}

export function formatTemperature(value: number): string {
  return value.toFixed(2);
}

/**
 * Drop every option `model` cannot carry, in dependency order: thinking
 * first, since it decides which efforts and whether a temperature survive.
 *
 * Callers keep the user's raw choices and normalize on the way out, so an
 * effort a model can't take comes back when they return to one that can.
 */
export function normalizeGenerationOptions(
  model: AgentModel,
  options: GenerationOptions
): GenerationOptions {
  const thinking =
    options.thinking != null && model.capabilities.thinking.includes(options.thinking)
      ? options.thinking
      : undefined;
  const effort =
    options.effort != null && availableEffortLevels(model, thinking).includes(options.effort)
      ? options.effort
      : undefined;
  const temperature =
    options.temperature != null && temperatureAvailable(model, thinking)
      ? clampTemperature(options.temperature)
      : undefined;
  return {
    ...(effort != null && { effort }),
    ...(thinking != null && { thinking }),
    ...(temperature != null && { temperature }),
  };
}

/**
 * One-line summary of what has been changed from the defaults, for the
 * picker's button and its tooltip. Empty when nothing has.
 */
export function summarizeGenerationOptions(options: GenerationOptions): string[] {
  const parts: string[] = [];
  if (options.effort) parts.push(`${EFFORT_LABELS[options.effort]} effort`);
  if (options.thinking) parts.push(`Thinking ${THINKING_LABELS[options.thinking].toLowerCase()}`);
  if (options.temperature != null) parts.push(`Temp ${formatTemperature(options.temperature)}`);
  return parts;
}
