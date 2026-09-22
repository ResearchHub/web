import { cn } from '@/utils/styles';

/**
 * Whether a note is out in the world or still being written, as a dot: blue
 * once published, amber while a draft. The same two colours wherever notes
 * are listed — the workspace sidebar, the My Funding sections.
 */
const NOTE_STATUS = {
  published: { label: 'Published', dotClass: 'bg-primary-500' },
  draft: { label: 'Draft', dotClass: 'bg-amber-400' },
} as const;

interface NoteStatusDotProps {
  readonly published: boolean;
  readonly className?: string;
}

export function NoteStatusDot({ published, className }: NoteStatusDotProps) {
  const status = published ? NOTE_STATUS.published : NOTE_STATUS.draft;
  return (
    <span
      role="img"
      aria-label={status.label}
      title={status.label}
      className={cn('inline-block h-2 w-2 shrink-0 rounded-full', status.dotClass, className)}
    />
  );
}

interface NoteStatusLineProps extends NoteStatusDotProps {
  /** After the status, e.g. when it was last edited. */
  readonly detail?: string;
}

/** "● Draft · Edited 2 hours ago": the line over an item in a list that mixes drafts and published work. */
export function NoteStatusLine({ published, detail, className }: NoteStatusLineProps) {
  const status = published ? NOTE_STATUS.published : NOTE_STATUS.draft;
  return (
    <p className={cn('flex items-center gap-2 text-xs text-gray-500', className)}>
      <NoteStatusDot published={published} />
      <span className="font-medium text-gray-700">{status.label}</span>
      {detail && (
        <>
          <span aria-hidden="true">·</span>
          <span>{detail}</span>
        </>
      )}
    </p>
  );
}
