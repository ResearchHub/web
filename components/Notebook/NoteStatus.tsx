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
  /** The status is written out beside the dot, so the dot itself says nothing. */
  readonly decorative?: boolean;
  readonly className?: string;
}

export function NoteStatusDot({ published, decorative = false, className }: NoteStatusDotProps) {
  const status = published ? NOTE_STATUS.published : NOTE_STATUS.draft;
  const classes = cn('inline-block h-2 w-2 shrink-0 rounded-full', status.dotClass, className);
  if (decorative) return <span aria-hidden="true" className={classes} />;
  return <span role="img" aria-label={status.label} title={status.label} className={classes} />;
}

interface NoteStatusLineProps extends NoteStatusDotProps {
  /** After the status, e.g. when it was last edited. */
  readonly detail?: string;
}

/**
 * "● Draft · Edited 2 hours ago": over a published card, or inside a draft's
 * row. A span, so it can sit inside a button as well as stand on its own.
 */
export function NoteStatusLine({ published, detail, className }: NoteStatusLineProps) {
  const status = published ? NOTE_STATUS.published : NOTE_STATUS.draft;
  return (
    <span className={cn('flex items-center gap-2 text-xs text-gray-500', className)}>
      <NoteStatusDot published={published} decorative />
      <span className="font-medium text-gray-700">{status.label}</span>
      {detail && (
        <>
          <span aria-hidden="true">·</span>
          <span>{detail}</span>
        </>
      )}
    </span>
  );
}
