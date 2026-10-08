'use client';

import { useRef, useState, type ReactNode } from 'react';
import { useWatch } from 'react-hook-form';
import { MIN_PUBLISH_TITLE_LENGTH } from '@/components/modals/ConfirmPublishModal';
import { usePublishingController } from '@/components/Notebook/PublishingForm';
import type { PublishingFormData } from '@/components/Notebook/PublishingForm/schema';
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
import { TextEditor } from './masthead/TextWidget';
import { useLeaveToCommit } from './masthead/useLeaveToCommit';
import type { PublishReadiness } from './masthead/usePublishReadiness';

const TITLE_ROW = 'title';

interface MissingDetailsProps {
  readonly readiness: PublishReadiness;
  /** The note's title, and how the dialog changes it when it is too short to publish under. */
  readonly title: string;
  readonly onRename: (title: string) => void;
}

/**
 * What the document still needs before it can be published, listed in the
 * publish dialog with a way to give each one right there. The document
 * itself never marks anything as missing; this is where the user finds out.
 * The rows alone say it: a row stays once it is filled, showing what was
 * entered, so the list does not shift under the pointer.
 */
export function MissingDetails({ readiness, title, onRename }: MissingDetailsProps) {
  const { articleType } = usePublishingController();
  const values = useWatch<PublishingFormData>() as PublishingFormData;
  const widgets = mastheadWidgetsFor(articleType);
  const { missing, titleMissing, titleTooShort } = readiness;

  // What was missing when the dialog opened: the rows it keeps.
  const [rowIds] = useState<readonly string[]>(() => [
    ...(titleTooShort ? [TITLE_ROW] : []),
    ...missing.flatMap((field) => widgets.find((widget) => widget.field === field)?.id ?? []),
  ]);
  // One editor at a time.
  const [editingId, setEditingId] = useState<string | null>(null);

  if (rowIds.length === 0) return null;

  const configs = rowIds.flatMap((id) => widgets.find((widget) => widget.id === id) ?? []);

  const rowState = (id: string) => ({
    editing: editingId === id,
    onEditingChange: (editing: boolean) =>
      setEditingId((current) => {
        if (editing) return id;
        return current === id ? null : current;
      }),
  });

  return (
    <div className="flex flex-col divide-y divide-gray-200 rounded-[10px] border border-gray-200">
      {rowIds.includes(TITLE_ROW) && (
        <TitleRow
          title={title}
          missing={titleMissing}
          tooShort={titleTooShort}
          onRename={onRename}
          {...rowState(TITLE_ROW)}
        />
      )}
      {configs.map((config) => (
        <DetailRow key={config.id} config={config} values={values} {...rowState(config.id)} />
      ))}
    </div>
  );
}

/** The small outlined button at a row's right end: "Add", "Edit", "Change". */
function RowButton({
  onClick,
  children,
}: {
  readonly onClick: () => void;
  readonly children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[30px] shrink-0 rounded-lg border border-gray-300 bg-white px-3 text-[13px] font-medium text-gray-900 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40"
    >
      {children}
    </button>
  );
}

/** A row's value once it has one: click it to change it. */
const ROW_VALUE_CLASS =
  'min-w-0 max-w-[230px] truncate rounded-md px-1 text-right text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none';

interface RowProps {
  readonly label: string;
  /** A second, quieter line under the label. */
  readonly hint?: ReactNode;
  /** What sits at the row's right end: a button, a small field, or the value. */
  readonly control?: ReactNode;
  /** An editor too wide for the right end, on a line of its own under the label. */
  readonly below?: ReactNode;
}

function Row({ label, hint, control, below }: RowProps) {
  return (
    <div className="flex flex-col gap-2 px-3.5 py-2.5">
      <div className="flex min-h-[30px] items-center justify-between gap-3">
        <span className="flex min-w-0 flex-col">
          <span className="text-sm font-medium text-gray-900">{label}</span>
          {hint && <span className="text-xs text-gray-600">{hint}</span>}
        </span>
        {control}
      </div>
      {below}
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
  editing,
  onEditingChange,
}: RowEditing & {
  readonly config: MastheadWidgetConfig;
  readonly values: PublishingFormData;
}) {
  const open = () => onEditingChange(true);
  const close = () => onEditingChange(false);
  const value = detailValue(config, values);
  // What sits at the row's right end when no editor is open: the value, to change it, or Add.
  const control = value ? (
    <button type="button" onClick={open} title="Change" className={ROW_VALUE_CLASS}>
      {value}
    </button>
  ) : (
    <RowButton onClick={open}>Add</RowButton>
  );

  switch (config.kind) {
    case 'cover':
      return <CoverRow config={config} value={values.coverImage} />;
    case 'amount':
      return (
        <Row
          label={config.name}
          control={
            editing ? (
              <AmountEditor config={config} initial={values.budget} onClose={close} />
            ) : (
              control
            )
          }
        />
      );
    case 'people':
      return (
        <Row
          label={config.name}
          control={editing ? undefined : control}
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
          label={config.name}
          control={editing ? undefined : control}
          below={
            editing ? (
              <div className="flex">
                <TextEditor config={config} initial={value ?? ''} onClose={close} />
              </div>
            ) : undefined
          }
        />
      );
    // A proposal publishes without an RFP, so it is never listed here.
    case 'grant':
      return null;
  }
}

/** The cover image has no editor: Add opens the file picker, and the pick shows as a thumbnail. */
function CoverRow({
  config,
  value,
}: {
  readonly config: MastheadWidgetConfig;
  readonly value: PublishingFormData['coverImage'];
}) {
  const cover = useCoverImagePicker(value);
  return (
    <Row
      label={config.name}
      hint={cover.error ?? undefined}
      control={
        <span className="flex shrink-0 items-center gap-2.5">
          {cover.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover.imageUrl} alt="" className="h-[30px] w-12 rounded-md object-cover" />
          )}
          <RowButton onClick={cover.browse}>{cover.imageUrl ? 'Change' : 'Add'}</RowButton>
          <input {...cover.inputProps} data-testid="publish-dialog-cover-input" />
        </span>
      }
    />
  );
}

/**
 * The document's title, when it has none or one too short to publish under:
 * given or edited here in full, and written into the document's heading.
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
      // The editor below says it all while it is open.
      hint={editing ? undefined : <TitleHint title={title} missing={missing} tooShort={tooShort} />}
      control={
        editing ? undefined : (
          <RowButton onClick={() => onEditingChange(true)}>{missing ? 'Add' : 'Edit'}</RowButton>
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

/** The title as it stands, and what it lacks: a short one is not missing, so it says how short. */
function TitleHint({
  title,
  missing,
  tooShort,
}: {
  readonly title: string;
  readonly missing: boolean;
  readonly tooShort: boolean;
}) {
  if (missing) return <>Your document needs a title</>;
  return (
    <>
      <span className="block truncate text-gray-900">{title}</span>
      {tooShort && (
        <span className="block text-amber-700">Too short: {titleLength(title.length)}</span>
      )}
    </>
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
        <span className={cn(EDITING_FIELD_CLASS, 'h-9 min-w-0 flex-1')}>
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
          className="h-9 shrink-0 rounded-lg bg-primary-600 px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
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
