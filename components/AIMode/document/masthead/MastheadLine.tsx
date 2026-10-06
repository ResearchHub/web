'use client';

import type { ReactNode } from 'react';
import { X, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/styles';

/** A detail being edited: a small field in the byline's place. The only blue in the masthead. */
export const EDITING_FIELD_CLASS =
  'flex items-center gap-2 rounded-lg border border-solid border-primary-600 bg-white px-2.5 ring-[3px] ring-primary-600/15';

/** The text input inside such a field. */
export const EDITING_INPUT_CLASS =
  'min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:outline-none focus:ring-0';

interface AddDetailProps {
  readonly icon: LucideIcon;
  /** What to do: "Add cover". */
  readonly label: string;
  readonly onClick: () => void;
}

/**
 * A detail with no value yet: a quiet icon and what to do, among the
 * byline's values. Nothing on the document marks it as required; the publish dialog
 * lists what is still empty when Publish is clicked.
 */
export function AddDetail({ icon: Icon, label, onClick }: AddDetailProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-mx-1 inline-flex items-center gap-1.5 rounded-md px-1 text-gray-500 transition-colors hover:text-gray-900 focus-visible:bg-gray-50 focus-visible:outline-none"
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {label}
    </button>
  );
}

interface DetailValueProps {
  readonly label: string;
  readonly children: ReactNode;
  /** Re-opens the detail's editor; absent when the value cannot be changed. */
  readonly onEdit?: () => void;
  /** Takes the value away; only a detail the work can publish without offers it. */
  readonly onClear?: () => void;
  readonly clearLabel?: string;
  /** Keep the value on one line and ellipsize it; names wrap instead. */
  readonly truncate?: boolean;
}

/**
 * A detail with a value: its label and the value, like the byline of the
 * published page. The same for every detail under the title.
 */
export function DetailValue({
  label,
  children,
  onEdit,
  onClear,
  clearLabel,
  truncate = false,
}: DetailValueProps) {
  const valueClass = cn('min-w-0 text-left font-medium text-gray-900', truncate && 'truncate');
  return (
    <span className="group inline-flex min-w-0 max-w-full items-center gap-[5px]">
      <span className="shrink-0">{label}</span>
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className={cn(
            valueClass,
            '-mx-1 rounded-md px-1 transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none'
          )}
        >
          {children}
        </button>
      ) : (
        <span className={valueClass}>{children}</span>
      )}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label={clearLabel}
          title={clearLabel}
          className="shrink-0 rounded-md p-0.5 text-gray-400 opacity-0 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:opacity-100 group-hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
