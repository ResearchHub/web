'use client';

import { useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { PublishingFormData } from '@/components/Notebook/PublishingForm/schema';
import { cn } from '@/utils/styles';
import { AddDetail, DetailValue, EDITING_FIELD_CLASS, EDITING_INPUT_CLASS } from './MastheadLine';
import { formatAmount, type MastheadWidgetConfig } from './mastheadWidgets';
import { useLeaveToCommit } from './useLeaveToCommit';

/** Whole dollars, with room for any amount a fund would name. */
const MAX_DIGITS = 12;

const withSeparators = (digits: string): string =>
  digits ? new Intl.NumberFormat('en-US').format(Number.parseInt(digits, 10)) : '';

interface AmountWidgetProps {
  readonly config: MastheadWidgetConfig;
  readonly value: string | undefined;
  readonly editable: boolean;
  readonly editing: boolean;
  readonly onEditingChange: (editing: boolean) => void;
}

/** A sum in whole US dollars: a proposal's funding goal, an RFP's funding amount. */
export function AmountWidget({
  config,
  value,
  editable,
  editing,
  onEditingChange,
}: AmountWidgetProps) {
  const amount = formatAmount(value);

  if (editing && editable) {
    return (
      <span className="inline-flex max-w-full items-center gap-[7px]">
        <span className="shrink-0">{config.label}</span>
        <AmountEditor config={config} initial={value} onClose={() => onEditingChange(false)} />
      </span>
    );
  }
  if (amount) {
    return (
      <DetailValue label={config.label} onEdit={editable ? () => onEditingChange(true) : undefined}>
        {amount}
      </DetailValue>
    );
  }
  if (!editable) return null;
  return (
    <AddDetail icon={config.icon} label={config.addLabel} onClick={() => onEditingChange(true)} />
  );
}

/**
 * The amount as a small field: digits, shown with thousands separators.
 * Enter or leaving it keeps the amount, Escape does not.
 */
export function AmountEditor({
  config,
  initial,
  onClose,
}: {
  readonly config: MastheadWidgetConfig;
  readonly initial: string | undefined;
  readonly onClose: () => void;
}) {
  const { setValue } = useFormContext<PublishingFormData>();
  const startDigits = Number(initial) > 0 ? String(Math.trunc(Number(initial))) : '';
  const [digits, setDigits] = useState(startDigits);
  const ref = useRef<HTMLSpanElement>(null);

  const commit = () => {
    if (digits !== startDigits) {
      setValue('budget', digits, { shouldDirty: true, shouldValidate: true });
    }
    onClose();
  };
  useLeaveToCommit(ref, commit);

  return (
    <span ref={ref} className={cn(EDITING_FIELD_CLASS, 'h-8 w-[170px] min-w-0')}>
      <span className="font-medium text-gray-900">$</span>
      <input
        autoFocus
        type="text"
        inputMode="numeric"
        aria-label={`${config.label} in US dollars`}
        placeholder="0"
        value={withSeparators(digits)}
        onChange={(event) => {
          const next = event.target.value.replaceAll(/\D/g, '').replace(/^0+/, '');
          setDigits(next.slice(0, MAX_DIGITS));
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commit();
          } else if (event.key === 'Escape') {
            event.preventDefault();
            onClose();
          }
        }}
        className={cn(EDITING_INPUT_CLASS, 'font-medium')}
      />
      <span className="shrink-0 text-xs text-gray-600">USD</span>
    </span>
  );
}
