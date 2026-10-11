'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Pencil, X } from 'lucide-react';
import { useWatch } from 'react-hook-form';
import { MIN_PUBLISH_TITLE_LENGTH } from '@/components/modals/ConfirmPublishModal';
import { usePublishingController } from '@/components/Notebook/PublishingForm';
import { getRequiredFields } from '@/components/Notebook/PublishingForm/completion';
import type { PublishingFormData } from '@/components/Notebook/PublishingForm/schema';
import { useSelectedGrant } from '@/components/Notebook/PublishingForm/useSelectedGrant';
import { cn } from '@/utils/styles';
import { AmountEditor } from './masthead/AmountWidget';
import { useCoverImagePicker } from './masthead/CoverImage';
import { EDITING_FIELD_CLASS, EDITING_INPUT_CLASS } from './masthead/MastheadLine';
import { MAX_TITLE_LENGTH, normalizeTitle } from './masthead/title';
import {
  detailValue,
  mastheadWidgetsFor,
  peopleOf,
  type MastheadWidgetConfig,
} from './masthead/mastheadWidgets';
import { PeopleEditor } from './masthead/PeopleWidget';
import { SelectGrantForNoteModal } from './masthead/SelectGrantForNoteModal';
import { TextEditor } from './masthead/TextWidget';
import { useLeaveToCommit } from './masthead/useLeaveToCommit';
import type { PublishReadiness } from './masthead/usePublishReadiness';

const TITLE_ROW = 'title';

interface PublishDetailsProps {
  readonly readiness: PublishReadiness;
  /** The note's title, and how the dialog changes it when it is too short to publish under. */
  readonly title: string;
  readonly onRename: (title: string) => void;
}

/**
 * Every detail the document carries, in the publish dialog, in one list: the
 * ones it cannot be published without first, then the rest, each of those
 * saying it is optional. Each row shows its value, with a pencil to say it
 * can be changed, or offers to add it, and the whole row opens its editor; a
 * required one that is still empty is marked, and the list's heading counts
 * them. The document itself never marks anything as missing; this is where
 * the user finds out.
 */
export function PublishDetails({ readiness, title, onRename }: PublishDetailsProps) {
  const { articleType, note } = usePublishingController();
  const values = useWatch<PublishingFormData>() as PublishingFormData;
  const { missing, titleMissing, titleTooShort, missingNames } = readiness;
  // One editor at a time.
  const [editingId, setEditingId] = useState<string | null>(null);

  const required = useMemo(
    () => new Set(articleType ? getRequiredFields(articleType) : []),
    [articleType]
  );
  const configs = mastheadWidgetsFor(articleType).filter((config) => !config.hiddenWhen?.(values));
  const requiredConfigs = configs.filter((config) => required.has(config.field));
  const optionalConfigs = configs.filter((config) => !required.has(config.field));
  const left = missingNames.length;

  const rowState = (id: string) => ({
    editing: editingId === id,
    onEditingChange: (editing: boolean) =>
      setEditingId((current) => {
        if (editing) return id;
        return current === id ? null : current;
      }),
  });

  const row = (config: MastheadWidgetConfig, optional: boolean) => (
    <DetailRow
      key={config.id}
      config={config}
      values={values}
      noteId={note?.id ?? null}
      attention={missing.includes(config.field)}
      optional={optional}
      {...rowState(config.id)}
    />
  );

  return (
    <section className="flex flex-col gap-2">
      <h3 className="flex items-baseline gap-2 text-[13px] font-semibold text-gray-900">
        Details
        {left > 0 && <span className="text-xs font-normal text-gray-500">{left} left</span>}
      </h3>
      {/* Not clipped, so the people picker's results can drop past the box; the
          end rows round their own hover instead. */}
      <div className="flex flex-col divide-y divide-gray-200 rounded-[10px] border border-gray-200 [&>div:first-child>button]:rounded-t-[9px] [&>div:last-child>button]:rounded-b-[9px] [&>div:last-child>div]:rounded-b-[9px] [&>div:first-child>div]:rounded-t-[9px]">
        <TitleRow
          title={title}
          missing={titleMissing}
          tooShort={titleTooShort}
          onRename={onRename}
          {...rowState(TITLE_ROW)}
        />
        {requiredConfigs.map((config) => row(config, false))}
        {optionalConfigs.map((config) => row(config, true))}
      </div>
    </section>
  );
}

/**
 * What a row offers at its right end while it has no value: "Add", or
 * "Change" for a picture. Not a button of its own, since the whole row is
 * one. Amber while it adds something the work cannot be published without.
 */
function AddPill({
  attention = false,
  children,
}: {
  readonly attention?: boolean;
  readonly children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'flex h-8 shrink-0 items-center rounded-lg border px-3 text-[13px] font-medium md:h-[30px]',
        attention
          ? 'border-amber-500 bg-amber-50 text-amber-900 group-hover:bg-amber-100'
          : 'border-gray-300 bg-white text-gray-900 group-hover:border-gray-400'
      )}
    >
      {children}
    </span>
  );
}

/** A row's value at its right end, cut short when it does not fit. */
function RowValue({
  locked = false,
  children,
}: {
  /** It can no longer be changed, such as an open fundraise's goal. */
  readonly locked?: boolean;
  readonly children: ReactNode;
}) {
  return (
    <>
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-right text-[15px] font-medium md:text-sm',
          locked ? 'text-gray-600' : 'text-gray-900'
        )}
      >
        {children}
      </span>
      {/* Says the value can be changed; darker while the row is hovered. */}
      {!locked && (
        <Pencil
          className="h-3.5 w-3.5 shrink-0 text-gray-400 transition-colors group-hover:text-gray-700 group-focus-visible:text-gray-700"
          aria-hidden="true"
        />
      )}
    </>
  );
}

interface RowProps {
  readonly label: string;
  /** The work can be published without it: said after the label. */
  readonly optional?: boolean;
  /** The work cannot be published until this row is given a value, or a better one. */
  readonly attention?: boolean;
  /** A second, quieter line under the label. */
  readonly hint?: ReactNode;
  /** The value, or what to do while there is none, at the row's right end. */
  readonly trailing?: ReactNode;
  /** Opens the row's editor; the whole row is the button. Absent for a value that is locked. */
  readonly onOpen?: () => void;
  /** An editor that takes the right end's place while it is open. */
  readonly inlineEditor?: ReactNode;
  /** An editor too wide for the right end, on a line of its own under the label. */
  readonly below?: ReactNode;
  /** An editor is open: the row brings itself into view in the dialog's scrolling body. */
  readonly editing?: boolean;
  /** Rendered beside the row, outside its button: a file input, a modal. */
  readonly extra?: ReactNode;
  /** Takes the value away, from an × at the row's right end, beside its button. */
  readonly onRemove?: {
    readonly label: string;
    readonly onClick: () => void;
    readonly disabled?: boolean;
  };
}

const ROW_CLASS =
  'flex min-h-[52px] w-full items-center gap-3 px-3.5 py-2.5 text-left md:min-h-[50px]';

function Row({
  label,
  optional = false,
  attention = false,
  hint,
  trailing,
  onOpen,
  inlineEditor,
  below,
  editing = false,
  extra,
  onRemove,
}: RowProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (editing) ref.current?.scrollIntoView({ block: 'nearest' });
  }, [editing]);

  const content = (
    <>
      <span className="flex shrink-0 flex-col">
        <span className="flex items-center gap-2 text-[15px] font-medium text-gray-900 md:text-sm">
          {attention && (
            <span
              aria-hidden="true"
              className="h-[7px] w-[7px] shrink-0 rounded-full bg-amber-600"
            />
          )}
          {label}
          {optional && (
            <span className="text-[13px] font-normal text-gray-500 md:text-xs">optional</span>
          )}
          {attention && <span className="sr-only">(needed to publish)</span>}
        </span>
        {hint && <span className="text-xs text-gray-600">{hint}</span>}
      </span>
      {inlineEditor ?? (
        <span className="flex min-w-0 flex-1 items-center justify-end gap-2.5">{trailing}</span>
      )}
    </>
  );

  const openButton = onOpen && (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        ROW_CLASS,
        'group transition-colors focus-visible:bg-gray-50 focus-visible:outline-none',
        // With an × beside it, the pair shares one hover and the row leaves it room.
        onRemove ? 'w-auto min-w-0 flex-1' : 'hover:bg-gray-50'
      )}
    >
      {content}
    </button>
  );

  return (
    <div ref={ref}>
      {openButton && !editing && onRemove ? (
        <div className="flex items-center pr-2 transition-colors hover:bg-gray-50">
          {openButton}
          <button
            type="button"
            aria-label={onRemove.label}
            title={onRemove.label}
            onClick={onRemove.onClick}
            disabled={onRemove.disabled}
            className="-ml-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40 disabled:opacity-50 md:h-8 md:w-8"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : openButton && !editing ? (
        openButton
      ) : (
        <div className={ROW_CLASS}>{content}</div>
      )}
      {below && <div className="px-3.5 pb-3">{below}</div>}
      {extra}
    </div>
  );
}

interface RowEditing {
  readonly editing: boolean;
  readonly onEditingChange: (editing: boolean) => void;
}

function DetailRow({
  config,
  values,
  noteId,
  attention,
  optional,
  editing,
  onEditingChange,
}: RowEditing & {
  readonly config: MastheadWidgetConfig;
  readonly values: PublishingFormData;
  /** The note the RFP a proposal answers is saved to; null until it has loaded. */
  readonly noteId: number | null;
  readonly attention: boolean;
  readonly optional: boolean;
}) {
  const open = () => onEditingChange(true);
  const close = () => onEditingChange(false);
  const value = detailValue(config, values);
  const locked = Boolean(value) && Boolean(config.lockedWhen?.(values));
  const shared = {
    label: config.name,
    optional,
    attention,
    editing,
    onOpen: locked ? undefined : open,
    trailing: value ? (
      <RowValue locked={locked}>{value}</RowValue>
    ) : (
      <AddPill attention={attention}>Add</AddPill>
    ),
  };

  switch (config.kind) {
    case 'cover':
      return (
        <CoverRow
          config={config}
          value={values.coverImage}
          attention={attention}
          optional={optional}
        />
      );
    case 'amount':
      return (
        <Row
          {...shared}
          inlineEditor={
            editing ? (
              <span className="flex min-w-0 flex-1 justify-end">
                <AmountEditor config={config} initial={values.budget} onClose={close} />
              </span>
            ) : undefined
          }
        />
      );
    case 'people':
      return (
        <Row
          {...shared}
          trailing={editing ? undefined : shared.trailing}
          below={
            editing ? (
              <PeopleEditor
                config={config}
                value={peopleOf(values, config.field)}
                onClose={close}
              />
            ) : undefined
          }
        />
      );
    case 'text':
    case 'paragraph':
      return (
        <Row
          {...shared}
          trailing={editing ? undefined : shared.trailing}
          below={
            editing ? (
              <div className="flex">
                <TextEditor config={config} initial={value ?? ''} onClose={close} />
              </div>
            ) : undefined
          }
        />
      );
    // Picked in the RFP modal, which saves it to the note.
    case 'grant':
      if (noteId == null) return null;
      return (
        <GrantRow
          shared={shared}
          noteId={noteId}
          hasValue={Boolean(value)}
          editing={editing}
          onClose={close}
        />
      );
  }
}

/**
 * The RFP a proposal answers: picked in the RFP modal, which saves it to the
 * note, and taken away with the row's ×, since a proposal can go without one.
 */
function GrantRow({
  shared,
  noteId,
  hasValue,
  editing,
  onClose,
}: {
  readonly shared: Omit<RowProps, 'editing'>;
  readonly noteId: number;
  readonly hasValue: boolean;
  readonly editing: boolean;
  readonly onClose: () => void;
}) {
  const { isSaving, save } = useSelectedGrant(noteId);
  return (
    <Row
      {...shared}
      // The modal is the editor; the row stays a button under it.
      editing={false}
      onRemove={
        hasValue
          ? {
              label: 'Stop applying to this RFP',
              onClick: () => void save(null),
              disabled: isSaving,
            }
          : undefined
      }
      extra={<SelectGrantForNoteModal noteId={noteId} isOpen={editing} onClose={onClose} />}
    />
  );
}

/** The cover image has no editor: the row opens the file picker, and the pick shows as a thumbnail. */
function CoverRow({
  config,
  value,
  attention,
  optional,
}: {
  readonly config: MastheadWidgetConfig;
  readonly value: PublishingFormData['coverImage'];
  readonly attention: boolean;
  readonly optional: boolean;
}) {
  const cover = useCoverImagePicker(value);
  const needed = attention && !cover.imageUrl;
  return (
    <Row
      label={config.name}
      optional={optional}
      attention={needed}
      hint={cover.error ?? undefined}
      onOpen={cover.browse}
      trailing={
        <>
          {cover.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover.imageUrl} alt="" className="h-[30px] w-12 rounded-md object-cover" />
          )}
          <AddPill attention={needed}>{cover.imageUrl ? 'Change' : 'Add'}</AddPill>
        </>
      }
      extra={<input {...cover.inputProps} data-testid="publish-dialog-cover-input" />}
    />
  );
}

/**
 * The document's title, given or edited here in full and written into the
 * document's heading. Marked while it has none or one too short to publish
 * under.
 */
function TitleRow({
  title,
  missing,
  tooShort,
  onRename,
  editing,
  onEditingChange,
}: RowEditing & {
  readonly title: string;
  readonly missing: boolean;
  readonly tooShort: boolean;
  readonly onRename: (title: string) => void;
}) {
  return (
    <Row
      label="Title"
      attention={tooShort}
      editing={editing}
      onOpen={() => onEditingChange(true)}
      // The editor below says it all while it is open.
      hint={
        !editing && !missing && tooShort ? (
          <span className="text-amber-700">Too short: {titleLength(title.length)}</span>
        ) : undefined
      }
      trailing={
        editing ? undefined : missing ? (
          <AddPill attention>Add</AddPill>
        ) : (
          <RowValue>{title}</RowValue>
        )
      }
      below={
        editing ? (
          <TitleEditor title={title} onRename={onRename} onClose={() => onEditingChange(false)} />
        ) : undefined
      }
    />
  );
}

/** How a title's length stands against the minimum to publish under. */
function titleLength(length: number): string {
  return length < MIN_PUBLISH_TITLE_LENGTH
    ? `${length} of at least ${MIN_PUBLISH_TITLE_LENGTH} characters`
    : `${length} characters`;
}

function TitleEditor({
  title,
  onRename,
  onClose,
}: {
  readonly title: string;
  readonly onRename: (title: string) => void;
  readonly onClose: () => void;
}) {
  const [draft, setDraft] = useState(title);
  const ref = useRef<HTMLDivElement>(null);
  const next = normalizeTitle(draft);
  const short = next.length < MIN_PUBLISH_TITLE_LENGTH;
  const commit = () => {
    // A note is never left without a title.
    if (next && next !== title) onRename(next);
    onClose();
  };
  useLeaveToCommit(ref, commit);

  return (
    <div ref={ref} className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className={cn(EDITING_FIELD_CLASS, 'h-10 min-w-0 flex-1 md:h-9')}>
          <input
            autoFocus
            type="text"
            aria-label="Title"
            aria-describedby="publish-title-length"
            placeholder="Add a title"
            maxLength={MAX_TITLE_LENGTH}
            enterKeyHint="done"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                commit();
              } else if (event.key === 'Escape') {
                // Handled here, so the dialog does not take it as its own and close.
                event.preventDefault();
                onClose();
              }
            }}
            className={EDITING_INPUT_CLASS}
          />
        </span>
        {/* Enter saves too, but a phone's keyboard may not offer it. */}
        <button
          type="button"
          onClick={commit}
          disabled={!next}
          className="h-10 shrink-0 rounded-lg bg-primary-600 px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 md:h-9"
        >
          Save
        </button>
      </div>
      {/* Counts as the user types, so they know when it is long enough
          without having to save to find out. */}
      <span
        id="publish-title-length"
        aria-live="polite"
        className={cn('text-xs', next && short ? 'text-amber-700' : 'text-gray-500')}
      >
        {next ? titleLength(next.length) : `At least ${MIN_PUBLISH_TITLE_LENGTH} characters`}
      </span>
    </div>
  );
}
