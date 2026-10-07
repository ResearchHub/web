'use client';

import { ExternalLink, Send } from 'lucide-react';
import { usePublishingController } from '@/components/Notebook/PublishingForm';
import { getWorkPath } from '@/components/Notebook/PublishingForm/formMapping';
import { Loader } from '@/components/ui/Loader';
import { cn } from '@/utils/styles';

/**
 * The document's Publish button, floating at the bottom centre of the pane.
 * It never waits on missing details and never comments on them: every click
 * opens the publish dialog, which lists what is still empty and lets it be
 * filled in there. Once published it says so, with a way to the page and an
 * Update button.
 */
export function PublishPill() {
  const controller = usePublishingController();
  const { note, editor, articleType, workId, isPublished, isChangelog } = controller;

  // A type this surface cannot publish has no button to press.
  const isNewPreprint = articleType === 'discussion' && !workId && !isChangelog;
  if (!articleType || isNewPreprint || controller.blockedMessage) return null;

  const handleClick = () => void controller.requestPublish();

  const busyLabel = controller.isUpserting
    ? 'Publishing...'
    : controller.isLinkingNonprofit
      ? 'Linking nonprofit...'
      : controller.isRedirecting
        ? 'Redirecting...'
        : null;
  const disabled =
    controller.readOnly || controller.isDeclined || controller.isPublishing || editor == null;

  const livePath =
    isPublished && note?.post && workId ? getWorkPath(articleType, workId, note.post.slug) : null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[22px] flex justify-center px-4">
      {livePath ? (
        <div className="pointer-events-auto flex h-11 items-center rounded-full border border-gray-200 bg-white pl-4 pr-1 shadow-lg">
          <a
            href={livePath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
          >
            Published
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <span aria-hidden="true" className="mx-3 h-5 w-px bg-gray-200" />
          <PublishAction
            label={busyLabel ?? 'Update'}
            busy={busyLabel != null}
            disabled={disabled}
            onClick={handleClick}
            size="sm"
          />
        </div>
      ) : (
        <PublishAction
          label={busyLabel ?? 'Publish'}
          busy={busyLabel != null}
          disabled={disabled}
          onClick={handleClick}
          size="lg"
          className="pointer-events-auto"
        />
      )}
    </div>
  );
}

/**
 * The blue button: a paper plane and its label. On hover it lifts, the blue
 * runs into indigo, a streak of light crosses it and the plane takes off and
 * lands again; with reduced motion only the colours change. While the
 * publish is under way a spinner stands in for the plane.
 */
function PublishAction({
  label,
  busy,
  disabled,
  onClick,
  size,
  className,
}: {
  readonly label: string;
  readonly busy: boolean;
  readonly disabled: boolean;
  readonly onClick: () => void;
  /** The floating pill, or the button inside the published pill. */
  readonly size: 'lg' | 'sm';
  readonly className?: string;
}) {
  const large = size === 'lg';
  // Nothing moves for a button that cannot be pressed.
  const lively = !disabled;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid="workspace-publish"
      className={cn(
        'group relative inline-flex items-center overflow-hidden rounded-full bg-primary-600 font-semibold text-white',
        'transition-[transform,box-shadow] duration-300 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        large
          ? 'h-11 gap-2 pl-5 pr-6 text-[15px] shadow-[0_10px_28px_rgba(37,99,235,0.3),0_2px_6px_rgba(17,24,39,0.12)]'
          : 'h-9 gap-1.5 pl-3.5 pr-4 text-sm',
        lively &&
          (large
            ? 'hover:shadow-[0_16px_40px_rgba(79,70,229,0.45),0_4px_10px_rgba(17,24,39,0.14)]'
            : 'hover:shadow-[0_6px_18px_rgba(79,70,229,0.4)]'),
        lively && 'active:scale-[0.97] motion-safe:hover:-translate-y-0.5',
        className
      )}
    >
      {lively && (
        <>
          {/* The blue running into indigo: a gradient can't transition, so it fades in over the fill. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
          {/* A streak of light that crosses once per hover, parked off the left edge between. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/40 to-transparent motion-safe:group-hover:animate-shimmer-quick"
          />
        </>
      )}
      <span
        className={cn(
          'relative flex shrink-0 items-center justify-center',
          large ? 'h-4 w-4' : 'h-3.5 w-3.5'
        )}
      >
        {busy ? (
          <Loader size="sm" className="h-full w-full" />
        ) : (
          <Send
            aria-hidden="true"
            strokeWidth={2.25}
            className={cn('h-full w-full', lively && 'motion-safe:group-hover:animate-take-off')}
          />
        )}
      </span>
      <span className="relative whitespace-nowrap">{label}</span>
    </button>
  );
}
