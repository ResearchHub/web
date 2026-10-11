'use client';

import { useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { PublishingFormData } from '@/components/Notebook/PublishingForm/schema';
import { cn } from '@/utils/styles';
import { AddDetail, DetailValue, EDITING_FIELD_CLASS, EDITING_INPUT_CLASS } from './MastheadLine';
import type { MastheadWidgetConfig } from './mastheadWidgets';
import { useLeaveToCommit } from './useLeaveToCommit';

/** The schema's limit on an organization's name. */
const MAX_LINE_LENGTH = 200;

type TextField = 'organization' | 'shortDescription';

interface TextWidgetProps {
  readonly config: MastheadWidgetConfig;
  readonly value: string | undefined;
  readonly editable: boolean;
  readonly editing: boolean;
  readonly onEditingChange: (editing: boolean) => void;
}

/**
 * Words the author types: one line after a label (who an RFP is offered
 * by), or a few sentences that stand as a paragraph (its short description).
 * Unset, either is an offer in the byline; the masthead gives a paragraph
 * that is set or being written a place of its own under it.
 */
export function TextWidget({ config, value, editable, editing, onEditingChange }: TextWidgetProps) {
  const text = value?.trim() ?? '';
  const paragraph = config.kind === 'paragraph';
  const edit = editable ? () => onEditingChange(true) : undefined;

  if (editing && editable) {
    const editor = (
      <TextEditor config={config} initial={text} onClose={() => onEditingChange(false)} />
    );
    return paragraph ? (
      editor
    ) : (
      <span className="inline-flex max-w-full items-center gap-[7px]">
        <span className="shrink-0">{config.label}</span>
        {editor}
      </span>
    );
  }
  if (text && paragraph) {
    const className = 'whitespace-pre-wrap break-words text-[15px] leading-relaxed text-gray-700';
    return edit ? (
      <button
        type="button"
        onClick={edit}
        aria-label={`Edit the ${config.label.toLowerCase()}`}
        className={cn(
          className,
          '-mx-1 rounded-md px-1 text-left transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none'
        )}
      >
        {text}
      </button>
    ) : (
      <p className={className}>{text}</p>
    );
  }
  if (text) {
    return (
      <DetailValue label={config.label} onEdit={edit} truncate>
        {text}
      </DetailValue>
    );
  }
  if (!edit) return null;
  return <AddDetail icon={config.icon} label={config.addLabel} onClick={edit} />;
}

/**
 * The words as a field: one line, or for a paragraph a box that grows with
 * its text. Enter or leaving it keeps them, Escape does not.
 */
export function TextEditor({
  config,
  initial,
  onClose,
}: {
  readonly config: MastheadWidgetConfig;
  readonly initial: string;
  readonly onClose: () => void;
}) {
  const { setValue } = useFormContext<PublishingFormData>();
  const field: TextField = config.field === 'organization' ? 'organization' : 'shortDescription';
  const [draft, setDraft] = useState(initial);
  const ref = useRef<HTMLSpanElement>(null);

  const commit = () => {
    const next = draft.trim();
    if (next !== initial) setValue(field, next, { shouldDirty: true, shouldValidate: true });
    onClose();
  };
  useLeaveToCommit(ref, commit);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Shift+Enter still breaks a line in the paragraph.
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      commit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  if (config.kind === 'paragraph') {
    return (
      <span ref={ref} className={cn(EDITING_FIELD_CLASS, 'w-full items-start py-2')}>
        {/* The hidden copy sizes the cell, so the field grows with its text. */}
        <span className="grid min-w-0 flex-1 text-base leading-relaxed md:text-[15px]">
          <span
            aria-hidden="true"
            className="invisible col-start-1 row-start-1 min-h-[3lh] whitespace-pre-wrap break-words"
          >
            {draft}{' '}
          </span>
          <textarea
            autoFocus
            aria-label={config.label}
            placeholder="What this RFP is for and what you are looking to fund"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={(event) => {
              const end = event.currentTarget.value.length;
              event.currentTarget.setSelectionRange(end, end);
            }}
            className={cn(
              EDITING_INPUT_CLASS,
              'col-start-1 row-start-1 resize-none overflow-hidden text-base leading-relaxed md:text-[15px]'
            )}
          />
        </span>
      </span>
    );
  }

  return (
    <span ref={ref} className={cn(EDITING_FIELD_CLASS, 'h-8 w-[260px] min-w-0')}>
      <input
        autoFocus
        type="text"
        aria-label={config.label}
        placeholder="University, company, foundation…"
        maxLength={MAX_LINE_LENGTH}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        className={EDITING_INPUT_CLASS}
      />
    </span>
  );
}
