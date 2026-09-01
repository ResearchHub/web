'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown, Gauge, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/utils/styles';
import { Slider } from '@/components/ui/Slider';
import { useOutsidePointerDown } from '@/hooks/useOutsidePointerDown';
import {
  availableEffortLevels,
  clampTemperature,
  EFFORT_LABELS,
  formatTemperature,
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
} from '@/types/notebookModels';

interface ModelControlsProps {
  readonly models: AgentModel[];
  /** The model the next turn runs on. Nothing renders without one. */
  readonly model: AgentModel | null;
  /** The open chat is committed to its model — the picker locks shut. */
  readonly pinned: boolean;
  readonly options: GenerationOptions;
  readonly onSelectModel: (ref: string) => void;
  readonly onChangeOptions: (options: GenerationOptions) => void;
  readonly disabled: boolean;
}

type OpenMenu = 'model' | 'effort' | null;

/**
 * The composer's two dropdowns: which model answers, and how hard it works.
 *
 * They are separate because they lock separately. A conversation keeps the
 * model its first turn ran on, so the model picker shuts for good once a turn
 * has run; effort, thinking and temperature are re-read on every message, so
 * they stay open for the life of the chat.
 *
 * The effort menu holds all three, temperature included — they are one
 * decision about how much work a turn does, and only the controls the model
 * can actually honor are drawn, in combinations it will accept. The backend
 * refuses a temperature sent to a reasoning model, so that slider is simply
 * absent until thinking is off.
 */
export function ModelControls({
  models,
  model,
  pinned,
  options,
  onSelectModel,
  onChangeOptions,
  disabled,
}: ModelControlsProps) {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  useOutsidePointerDown(containerRef, () => setOpenMenu(null), openMenu != null);

  // Escape closes the open menu. Bound to the document rather than the wrapper
  // so the wrapper stays a plain layout div — and so it still fires once focus
  // has left the menu.
  useEffect(() => {
    if (openMenu == null) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [openMenu]);

  if (!model) return null;

  const effortLevels = availableEffortLevels(model, options.thinking);
  // A single mode is not a choice: models that always reason take no toggle,
  // they just reason.
  const thinkingModes = model.capabilities.thinking.length > 1 ? model.capabilities.thinking : [];
  const showTemperature = temperatureAvailable(model, options.thinking);
  // Claude refuses sampling params to a model that is still reasoning, which
  // would otherwise read as a control that went missing on its own.
  const temperatureNeedsThinkingOff =
    !showTemperature && model.capabilities.temperature && thinkingModes.includes('disabled');
  const hasEffortMenu = effortLevels.length > 0 || thinkingModes.length > 0 || showTemperature;

  const toggle = (menu: Exclude<OpenMenu, null>) =>
    setOpenMenu((current) => (current === menu ? null : menu));

  return (
    // Deliberately not positioned: both menus open against the composer box
    // (see ChatComposer), which is wider than this row and wider still than
    // either button — anchored to a button they would run off the panel.
    <div ref={containerRef} className="flex items-center gap-1">
      <ControlButton
        onClick={() => toggle('model')}
        open={openMenu === 'model'}
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

      {hasEffortMenu && (
        <ControlButton
          onClick={() => toggle('effort')}
          open={openMenu === 'effort'}
          disabled={disabled}
          title={summarizeGenerationOptions(options).join(' · ') || 'Model defaults'}
          icon={<Gauge className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />}
          srLabel="Effort:"
          className="max-w-[140px]"
        >
          {effortButtonLabel(options)}
        </ControlButton>
      )}

      {openMenu === 'model' && (
        <Menu label="Assistant model">
          <div className="max-h-64 overflow-y-auto p-1">
            {models.map((option) => (
              <ModelRow
                key={option.ref}
                model={option}
                selected={option.ref === model.ref}
                onSelect={() => {
                  setOpenMenu(null);
                  onSelectModel(option.ref);
                }}
              />
            ))}
            {models.length === 0 && (
              <p className="px-3 py-2 text-sm text-gray-500">No models are available.</p>
            )}
          </div>
        </Menu>
      )}

      {openMenu === 'effort' && (
        <Menu label="Effort">
          <div className="space-y-3 px-3 py-3">
            {effortLevels.length > 0 && (
              <OptionPills
                label="Effort"
                value={options.effort}
                choices={effortLevels.map((level) => ({
                  value: level,
                  label: EFFORT_LABELS[level],
                }))}
                onChange={(effort) => onChangeOptions({ effort })}
              />
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
          </div>
        </Menu>
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

function ControlButton({
  onClick,
  open,
  disabled,
  title,
  icon,
  srLabel,
  className,
  children,
}: {
  readonly onClick: () => void;
  readonly open: boolean;
  readonly disabled: boolean;
  readonly title: string;
  readonly icon: ReactNode;
  readonly srLabel: string;
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-haspopup="dialog"
      aria-expanded={open}
      title={title}
      className={cn(
        'flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium',
        'text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent',
        open && 'bg-gray-100 text-gray-900',
        className
      )}
    >
      {icon}
      <span className="sr-only">{srLabel}</span>
      <span className="truncate">{children}</span>
      <ChevronDown
        className={cn('h-3 w-3 shrink-0 text-gray-400 transition-transform', open && 'rotate-180')}
        aria-hidden="true"
      />
    </button>
  );
}

/**
 * Widest the menus go. Set by the widest row the catalog produces — seven
 * effort pills — plus a little slack, since the row scrolls rather than
 * wraps and a few pixels short would clip the last pill rather than move it.
 */
const MAX_MENU_WIDTH = 'max-w-[360px]';

/**
 * Opens upward against the composer box it is positioned against: the
 * composer sits at the bottom of the panel, and the action row alone is too
 * narrow to seat that row of pills. Never wider than the box, so a panel
 * dragged narrower takes the menus with it.
 */
function Menu({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return (
    <div
      role="dialog"
      aria-label={label}
      className={cn(
        'animate-in absolute bottom-full left-0 z-20 mb-2 w-full overflow-hidden',
        'rounded-xl border border-gray-200 bg-white shadow-xl',
        MAX_MENU_WIDTH
      )}
    >
      {children}
    </div>
  );
}

function ModelRow({
  model,
  selected,
  onSelect,
}: {
  readonly model: AgentModel;
  readonly selected: boolean;
  readonly onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected}
      className={cn(
        'flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors',
        'hover:bg-gray-50 focus:outline-none focus-visible:bg-gray-50',
        selected && 'bg-primary-50/60 hover:bg-primary-50/60'
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
    </button>
  );
}

/**
 * A labelled row of single-choice pills, always led by "Auto" — leaving a
 * control alone is the common case and has to be reachable again once set.
 *
 * One line, always. The widest case the catalog produces — seven effort
 * levels — fits at the panel's default width; drag the panel narrower than
 * that and the row scrolls rather than wrapping into an orphan.
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
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
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
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          Temperature
        </p>
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
