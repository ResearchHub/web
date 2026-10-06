'use client';

import { ExternalLink } from 'lucide-react';
import { usePublishingController } from '@/components/Notebook/PublishingForm';
import { getWorkPath } from '@/components/Notebook/PublishingForm/formMapping';

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

  const buttonClass =
    'rounded-full bg-primary-600 font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';
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
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            data-testid="workspace-publish"
            className={`${buttonClass} h-9 px-4 text-sm`}
          >
            {busyLabel ?? 'Update'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          data-testid="workspace-publish"
          className={`${buttonClass} pointer-events-auto h-11 px-6 text-[15px] shadow-[0_10px_28px_rgba(37,99,235,0.3),0_2px_6px_rgba(17,24,39,0.12)]`}
        >
          {busyLabel ?? 'Publish'}
        </button>
      )}
    </div>
  );
}
