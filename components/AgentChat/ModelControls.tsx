'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Check, ChevronDown, Gauge, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/utils/styles';
import { Slider } from '@/components/ui/Slider';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
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
  type EffortLevel,
  type GenerationOptions,
  type ThinkingMode,
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
 * Model and effort lock after the first turn. The effort panel still offers
 * independent thinking and temperature controls where the model allows them.
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
  const thinkingRestricted =
    effortPinned &&
    thinkingModes.length < model.capabilities.thinking.length &&
    model.capabilities.thinking.length > 1;
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
          <ControlButton
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
          </ControlButton>
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
            <ControlButton
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
            </ControlButton>
          </PopoverTrigger>
          <PopoverContent aria-label="Effort" className={cn(PANEL_WIDTH, 'space-y-3 shadow-xl')}>
            {effortLocked ? (
              <p className="text-xs leading-snug text-gray-500">{lockedEffortDescription}</p>
            ) : (
              effortLevels.length > 0 && (
                <OptionPills
                  label="Effort"
                  value={options.effort}
                  choices={effortLevels.map((level) => ({
                    value: level,
                    label: EFFORT_LABELS[level],
                  }))}
                  onChange={(effort) => onChangeOptions({ effort })}
                />
              )
            )}

            {thinkingRestricted && (
              <p className="text-[11px] leading-snug text-gray-500">
                Thinking options are limited by this chat's locked effort. Start a new chat for all
                options.
              </p>
            )}

            {thinkingModes.length > 0 && (
              <OptionPills
                label="Extended thinking"
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

            {showTemperature && (
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

interface ControlButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly icon: ReactNode;
  readonly srLabel: string;
}

/**
 * The compact trigger chip: icon, label, chevron. Forwards its ref and spreads
 * the rest of its props so a Radix trigger can drive it (`asChild`); the
 * chevron turns on the `data-state` Radix stamps on an open trigger.
 */
const ControlButton = forwardRef<HTMLButtonElement, ControlButtonProps>(function ControlButton(
  { icon, srLabel, className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      {...props}
      className={cn(
        'group flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium',
        'text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent',
        'data-[state=open]:bg-gray-100 data-[state=open]:text-gray-900',
        className
      )}
    >
      {icon}
      <span className="sr-only">{srLabel}</span>
      <span className="truncate">{children}</span>
      <ChevronDown
        className="h-3 w-3 shrink-0 text-gray-400 transition-transform group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </button>
  );
});

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
 * A labelled row of single-choice pills, always led by "Auto" — leaving a
 * control alone is the common case and has to be reachable again once set.
 *
 * One line, always. The widest case the catalog produces — seven effort
 * levels — fits at the panel's width; a narrower viewport scrolls the row
 * rather than wrapping it into an orphan.
 */
function OptionPills<T extends EffortLevel | ThinkingMode>({
  label,
  value,
  choices,
  hint,
  onChange,
}: {
  readonly label: string;
  readonly value: T | undefined;
  readonly choices: ReadonlyArray<{ value: T; label: string }>;
  readonly hint?: ReactNode;
  readonly onChange: (value: T | undefined) => void;
}) {
  const items: ReadonlyArray<{ value: T | undefined; label: string }> = [
    { value: undefined, label: 'Auto' },
    ...choices,
  ];

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {/* w-max so the pills keep their natural size and the row scrolls past
          the edge rather than compressing them. */}
      <div className="scrollbar-hide overflow-x-auto" role="group" aria-label={label}>
        <div className="flex w-max gap-[3px]">
          {items.map((item) => (
            <Pill
              key={item.label}
              selected={value === item.value}
              onClick={() => onChange(item.value)}
            >
              {item.label}
            </Pill>
          ))}
        </div>
      </div>
      {hint && <p className="mt-1.5 text-[11px] leading-snug text-gray-500">{hint}</p>}
    </div>
  );
}

function FieldLabel({ children }: { readonly children: ReactNode }) {
  return (
    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
      {children}
    </p>
  );
}

function Pill({
  selected,
  onClick,
  children,
}: {
  readonly selected: boolean;
  readonly onClick: () => void;
  readonly children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'shrink-0 whitespace-nowrap rounded-md border px-1.5 py-1 text-[11px] font-medium transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        selected
          ? 'border-primary-400 bg-primary-50 text-primary-700'
          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
      )}
    >
      {children}
    </button>
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
        <FieldLabel>Temperature</FieldLabel>
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
