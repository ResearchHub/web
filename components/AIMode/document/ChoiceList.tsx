'use client';

import { useId, type ReactNode } from 'react';
import { Check, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/styles';

/** What a choice gives on one count: yes or no. */
export type Mark = 'yes' | 'no';

export interface ChoiceOption<T extends string> {
  readonly value: T;
  readonly label: string;
  /** At the row's right end: what the option is at a glance (a globe for public, a lock for private). */
  readonly icon?: LucideIcon;
  /** What the option is, in a few words under its label, for someone new to the idea. */
  readonly description?: string;
  /**
   * What the option means, said as plain points rather than weighed with
   * checks and crosses: for an option whose upsides depend on what the person
   * choosing wants. Takes the counts' place for this option.
   */
  readonly notes?: readonly string[];
  /** Shown under the option while it is the one picked: what picking it asks for next. */
  readonly details?: ReactNode;
}

/** One count the options are weighed on, and how each option fares on it. Options with notes have no mark. */
export interface ChoiceCount<T extends string> {
  readonly label: string;
  readonly marks: Partial<Record<T, Mark>>;
}

const MARK_STYLE: Record<Mark, { icon: LucideIcon; className: string }> = {
  yes: { icon: Check, className: 'bg-emerald-100 text-emerald-700' },
  no: { icon: X, className: 'bg-gray-100 text-gray-500' },
};

function MarkIcon({ mark, label }: { readonly mark: Mark; readonly label: string }) {
  const { icon: Icon, className } = MARK_STYLE[mark];
  return (
    <span
      role="img"
      aria-label={label}
      className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full', className)}
    >
      <Icon className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
    </span>
  );
}

interface ChoiceListProps<T extends string> {
  /** Names the choice for assistive technology; the section shows it visibly. */
  readonly label: string;
  readonly options: readonly ChoiceOption<T>[];
  /** What each option gives, one line per count. */
  readonly counts?: readonly ChoiceCount<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
}

/**
 * A choice made from a list of options, each a row to pick that says in a
 * few words what it is; the picked one opens to say, line by line with a
 * check or a cross, what it gives, or, for an option with notes, its points.
 * The others say it to a screen reader with their radio, without opening.
 */
export function ChoiceList<T extends string>({
  label,
  options,
  counts = [],
  value,
  onChange,
}: ChoiceListProps<T>) {
  const id = useId();
  const markLabel = (mark: Mark) => (mark === 'yes' ? 'Yes' : 'No');
  // Each option's lines: its notes, or the counts it has a mark on.
  const linesOf = (option: ChoiceOption<T>) =>
    option.notes
      ? option.notes.map((note) => ({ text: note, mark: undefined }))
      : counts.flatMap((count) => {
          const mark = count.marks[option.value];
          return mark ? [{ text: count.label, mark }] : [];
        });

  return (
    <div
      role="radiogroup"
      aria-label={label}
      // Not clipped, so what an option's details drop (search results) shows in full;
      // the end rows round their own background instead.
      className="flex flex-col divide-y divide-gray-200 rounded-[10px] border border-gray-200 [&>div:first-child>button]:rounded-t-[9px] [&>div:first-child]:rounded-t-[9px] [&>div:last-child>button]:rounded-b-[9px] [&>div:last-child]:rounded-b-[9px]"
    >
      {options.map((option) => {
        const checked = option.value === value;
        const lines = linesOf(option);
        return (
          <div key={option.value} className={cn(checked && 'bg-primary-50/60')}>
            <button
              type="button"
              role="radio"
              aria-checked={checked}
              aria-describedby={!checked && lines.length > 0 ? `${id}-${option.value}` : undefined}
              onClick={() => onChange(option.value)}
              className={cn(
                'flex min-h-[52px] w-full items-start gap-3 px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600/40 md:min-h-12',
                !checked && 'hover:bg-gray-50'
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'mt-0.5 h-4 w-4 shrink-0 rounded-full',
                  checked ? 'border-[5px] border-primary-600' : 'border-[1.5px] border-gray-400'
                )}
              />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[15px] font-semibold text-gray-900 md:text-sm">
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-[13px] leading-snug text-gray-600">
                    {option.description}
                  </span>
                )}
              </span>
              {option.icon && (
                <option.icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-900" aria-hidden="true" />
              )}
            </button>
            {checked && lines.length > 0 && (
              <ul className="-mt-0.5 flex flex-col gap-2.5 pb-3.5 pl-[42px] pr-3.5">
                {lines.map(({ text, mark }) => (
                  <li key={text} className="flex items-start gap-2.5">
                    {mark ? (
                      <MarkIcon mark={mark} label={markLabel(mark)} />
                    ) : (
                      // A plain point, neither for nor against: the marks' circle, empty, in
                      // blue so it reads as neither a check's green nor a cross's gray.
                      <span
                        aria-hidden="true"
                        className="h-5 w-5 shrink-0 rounded-full bg-primary-100"
                      />
                    )}
                    <span
                      className={cn(
                        'text-sm leading-5 md:text-[13px]',
                        mark === 'no' ? 'text-gray-500' : 'text-gray-700'
                      )}
                    >
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {checked && option.details && (
              <div className="pb-3.5 pl-[42px] pr-3.5">{option.details}</div>
            )}
            {!checked && lines.length > 0 && (
              <span id={`${id}-${option.value}`} className="sr-only">
                {lines
                  .map(({ text, mark }) => (mark ? `${text}: ${markLabel(mark)}.` : `${text}.`))
                  .join(' ')}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
