'use client';

import { Check, Gauge, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/utils/styles';
import { Slider } from '@/components/ui/Slider';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { ChoicePills } from '@/components/ui/ChoicePills';
import { FieldLabel } from '@/components/ui/FieldLabel';
import { MenuTrigger } from '@/components/ui/MenuTrigger';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import {
  availableEffortLevels,
  availableThinkingModes,
  clampTemperature,
  EFFORT_LABELS,
  formatTemperature,
  formatModelMultiplier,
  summarizeGenerationOptions,
  TEMPERATURE_MAX,
  TEMPERATURE_MIN,
  TEMPERATURE_NEUTRAL,
  TEMPERATURE_STEP,
  temperatureAvailable,
  THINKING_LABELS,
  type AgentModel,
  type GenerationOptions,
} from '@/types/agentModels';

interface ModelControlsProps {
  readonly models: AgentModel[];
  /** The model the next turn runs on. Nothing renders without one. */
  readonly model: AgentModel | null;
  /** The open chat is committed to its model — the picker locks shut. */
  readonly pinned: boolean;
  readonly effortPinned: boolean;
  readonly options: GenerationOptions;
  readonly onSelectModel: (ref: string) => void;
  readonly onChangeOptions: (options: GenerationOptions) => void;
  readonly disabled: boolean;
  readonly multiplierExplanation: string;
}

/**
 * Widest the panels go. Set by the widest row the catalog produces — seven
 * effort pills — plus a little slack, since the row scrolls rather than
 * wraps and a few pixels short would clip the last pill rather than move it.
 * Never wider than the viewport allows.
 */
const PANEL_WIDTH = 'w-[360px] max-w-[calc(100vw-1rem)]';

/**
 * The composer's two controls: which model answers, and how hard it works.
 *
 * Model and effort lock after the first turn. Once effort is locked the
 * panel only says so: thinking and temperature depend on the effort the chat
 * runs at, and offering them under a lock reads as a control that half works.
 *
 * The model picker is a menu (`BaseMenu`): one choice, closes on pick. The
 * effort panel is a popover: it holds all three controls, temperature
 * included — they are one decision about how much work a turn does — and the
 * user adjusts them in place, so it must not close on each click. Only the
 * controls the model can actually honor are drawn, in combinations it will
 * accept. The backend refuses a temperature sent to a reasoning model, so
 * that slider is simply absent until thinking is off.
 */
export function ModelControls({
  models,
  model,
  pinned,
  effortPinned,
  options,
  onSelectModel,
  onChangeOptions,
  disabled,
  multiplierExplanation,
}: ModelControlsProps) {
  if (!model) return null;

  const effortLevels = availableEffortLevels(model, options.thinking);
  // A single mode is not a choice: models that always reason take no toggle,
  // they just reason.
  const thinkingModes =
    model.capabilities.thinking.length > 1
      ? availableThinkingModes(model, effortPinned, options.effort ?? null)
      : [];
  const showTemperature = temperatureAvailable(model, options.thinking);
  // Claude refuses sampling params to a model that is still reasoning, which
  // would otherwise read as a control that went missing on its own.
  const temperatureNeedsThinkingOff =
    !showTemperature && model.capabilities.temperature && thinkingModes.includes('disabled');
  const hasEffort = model.capabilities.effort.length > 0 || options.effort != null;
  const hasEffortMenu = hasEffort || thinkingModes.length > 0 || showTemperature;
  const effortLocked = effortPinned && hasEffort;
  const lockedEffortLabel = options.effort ? EFFORT_LABELS[options.effort] : 'Locked effort';
  const lockedEffortDescription = options.effort
    ? `${EFFORT_LABELS[options.effort]} effort is locked for this chat. Start a new chat to change it.`
    : 'Effort is locked for this chat. Start a new chat to change it.';
  const allowedModels = models.filter((option) => option.allowed);

  return (
    <div className="flex items-center gap-1">
      <BaseMenu
        align="start"
        disabled={disabled || pinned}
        className={cn(PANEL_WIDTH, 'rounded-xl shadow-xl')}
        trigger={
          <MenuTrigger
            disabled={disabled || pinned}
            title={
              pinned
                ? `${model.label} — locked for this chat. Start a new chat to switch models.`
                : model.label
            }
            icon={
              pinned ? (
                <Lock className="h-3 w-3 shrink-0 text-gray-400" aria-hidden="true" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary-500" aria-hidden="true" />
              )
            }
            srLabel={pinned ? 'Assistant model, locked for this chat:' : 'Assistant model:'}
            className="max-w-[180px]"
          >
            {model.label}
          </MenuTrigger>
        }
      >
        <div className="max-h-64 overflow-y-auto" role="group" aria-label="Assistant model">
          {allowedModels.map((option) => (
            <ModelRow
              key={option.ref}
              model={option}
              selected={option.ref === model.ref}
              multiplierExplanation={multiplierExplanation}
              onSelect={() => onSelectModel(option.ref)}
            />
          ))}
          {allowedModels.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-500">No models are available.</p>
          )}
        </div>
      </BaseMenu>

      {hasEffortMenu && model.allowed && (
        <Popover>
          <PopoverTrigger asChild>
            <MenuTrigger
              disabled={disabled}
              title={
                effortLocked
                  ? lockedEffortDescription
                  : summarizeGenerationOptions(options).join(' · ') || 'Model defaults'
              }
              icon={
                effortLocked ? (
                  <Lock className="h-3 w-3 shrink-0 text-gray-400" aria-hidden="true" />
                ) : (
                  <Gauge className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                )
              }
              srLabel={effortLocked ? 'Effort, locked for this chat:' : 'Effort:'}
              className="max-w-[140px]"
            >
              {effortLocked ? lockedEffortLabel : effortButtonLabel(options)}
            </MenuTrigger>
          </PopoverTrigger>
          <PopoverContent aria-label="Effort" className={cn(PANEL_WIDTH, 'space-y-3 shadow-xl')}>
            {effortLocked && (
              <p className="text-sm leading-snug text-gray-500">{lockedEffortDescription}</p>
            )}

            {!effortLocked && effortLevels.length > 0 && (
              <ChoicePills
                label="Effort"
                unsetLabel="Auto"
                value={options.effort}
                choices={effortLevels.map((level) => ({
                  value: level,
                  label: EFFORT_LABELS[level],
                }))}
                onChange={(effort) => onChangeOptions({ effort })}
              />
            )}

            {!effortLocked && thinkingModes.length > 0 && (
              <ChoicePills
                label="Extended thinking"
                unsetLabel="Auto"
                value={options.thinking}
                choices={thinkingModes.map((mode) => ({
                  value: mode,
                  label: THINKING_LABELS[mode],
                }))}
                hint={
                  temperatureNeedsThinkingOff
                    ? 'Temperature is only available with thinking off.'
                    : null
                }
                onChange={(thinking) => onChangeOptions({ thinking })}
              />
            )}

            {!effortLocked && showTemperature && (
              <TemperatureControl
                value={options.temperature}
                onChange={(temperature) => onChangeOptions({ temperature })}
              />
            )}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

/**
 * What the effort button says at a glance. Effort is the control people reach
 * for, so it wins the label; the others only surface when nothing outranks
 * them, and the full picture is in the button's title.
 */
function effortButtonLabel(options: GenerationOptions): string {
  if (options.effort) return EFFORT_LABELS[options.effort];
  if (options.thinking) return `Thinking ${THINKING_LABELS[options.thinking].toLowerCase()}`;
  if (options.temperature != null) return `Temp ${formatTemperature(options.temperature)}`;
  return 'Auto';
}

function ModelRow({
  model,
  selected,
  onSelect,
  multiplierExplanation,
}: {
  readonly multiplierExplanation: string;
  readonly model: AgentModel;
  readonly selected: boolean;
  readonly onSelect: () => void;
}) {
  return (
    <BaseMenuItem
      onSelect={onSelect}
      aria-current={selected}
      className={cn(
        'cursor-pointer items-start gap-2 rounded-lg px-2 py-2',
        'focus:bg-gray-50 data-[highlighted]:bg-gray-50',
        selected && 'bg-primary-50/60 focus:bg-primary-50/60 data-[highlighted]:bg-primary-50/60'
      )}
    >
      <Check
        className={cn(
          'mt-0.5 h-3.5 w-3.5 shrink-0',
          selected ? 'text-primary-500' : 'text-transparent'
        )}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-gray-800">{model.label}</span>
        {model.description && (
          <span className="mt-0.5 block text-[11px] leading-snug text-gray-500">
            {model.description}
          </span>
        )}
      </span>
      <span className="shrink-0 text-xs tabular-nums text-gray-500" title={multiplierExplanation}>
        {formatModelMultiplier(model.multiplier)}
      </span>
    </BaseMenuItem>
  );
}

/**
 * Temperature parks mid-range while unset, reading "Auto": the server's own
 * default isn't published, so the slider shows a neutral position rather than
 * claiming a number nobody chose. The first drag commits one.
 */
function TemperatureControl({
  value,
  onChange,
}: {
  readonly value: number | undefined;
  readonly onChange: (value: number | undefined) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <FieldLabel className="mb-0">Temperature</FieldLabel>
        {value == null ? (
          <span className="text-[11px] text-gray-400">Auto</span>
        ) : (
          <span className="flex items-baseline gap-2">
            <span className="text-[11px] tabular-nums text-gray-700">
              {formatTemperature(value)}
            </span>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="text-[11px] text-gray-400 underline-offset-2 transition-colors hover:text-gray-600 hover:underline"
            >
              Auto
            </button>
          </span>
        )}
      </div>
      <Slider
        value={[value ?? TEMPERATURE_NEUTRAL]}
        min={TEMPERATURE_MIN}
        max={TEMPERATURE_MAX}
        step={TEMPERATURE_STEP}
        aria-label="Temperature"
        onValueChange={([next]) => onChange(clampTemperature(next))}
        className={cn(value == null && 'opacity-60')}
      />
    </div>
  );
}
