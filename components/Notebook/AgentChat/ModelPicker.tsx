'use client';

import { useRef, useState } from 'react';
import { Check, ChevronDown, Cpu } from 'lucide-react';
import { cn } from '@/utils/styles';
import { useOutsidePointerDown } from '@/hooks/useOutsidePointerDown';
import { modelLabel, type AgentModel } from '@/types/notebookChat';

interface ModelPickerProps {
  readonly models: AgentModel[];
  /** Ref in effect: the user's choice, or the model a started chat is pinned to. */
  readonly value: string;
  readonly onChange: (ref: string) => void;
  /**
   * The chat already ran a turn. The backend pins a conversation to its first
   * turn's model and rejects a switch, so the control reads out the pinned
   * model instead of offering choices that would 400.
   */
  readonly locked: boolean;
  readonly disabled?: boolean;
}

/**
 * Model selector for the composer. Sits beside the send button because the
 * choice belongs to the message being written — it applies to the next turn,
 * and only to a chat's first one.
 *
 * A single-model catalog and a pinned chat both render as a static label: with
 * nothing to choose, a menu would be a control that can't do anything.
 */
export function ModelPicker({ models, value, onChange, locked, disabled }: ModelPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useOutsidePointerDown(containerRef, () => setOpen(false), open);

  const label = modelLabel(models, value);
  const interactive = !locked && !disabled && models.length > 1;

  if (!interactive) {
    return (
      <span
        title={
          locked
            ? `This chat is running on ${label}. Start a new chat to use a different model.`
            : label
        }
        className="flex min-w-0 items-center gap-1 px-1 text-xs text-gray-500"
      >
        <Cpu className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="sr-only">Model:</span>
        <span className="truncate">{label}</span>
      </span>
    );
  }

  return (
    <div ref={containerRef} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex min-w-0 items-center gap-1 rounded-md px-1 py-0.5 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        <Cpu className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="sr-only">Model:</span>
        <span className="truncate">{label}</span>
        <ChevronDown
          className={cn('h-3 w-3 shrink-0 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        // Opens upward: the composer is pinned to the bottom of the panel.
        <div
          role="listbox"
          className="animate-in absolute bottom-full left-0 z-10 mb-1 max-h-72 w-64 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {models.map((model) => {
            const selected = model.ref === value;
            return (
              <button
                key={model.ref}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  setOpen(false);
                  onChange(model.ref);
                }}
                className={cn(
                  'flex w-full items-start gap-2 px-3 py-2 text-left transition-colors hover:bg-gray-50',
                  selected && 'bg-primary-50/60'
                )}
              >
                <Check
                  className={cn(
                    'mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-500',
                    !selected && 'invisible'
                  )}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-gray-800">
                    {model.label}
                  </span>
                  {model.description && (
                    <span className="mt-0.5 block text-xs text-gray-500">{model.description}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
