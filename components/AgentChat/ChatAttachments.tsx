'use client';

import { useState } from 'react';
import { AlertCircle, AlertTriangle, ExternalLink, FileText, X } from 'lucide-react';
import { Loader } from '@/components/ui/Loader';
import { Progress } from '@/components/ui/Progress';
import { AgentFileService, agentFileErrorMessage } from '@/services/agentFile.service';
import type { ComposerAttachment } from '@/store/chatAttachments';
import { cn } from '@/utils/styles';
import {
  agentFileCaveats,
  describeAgentFile,
  formatFileSize,
  hasNoReadableText,
  type AgentFile,
} from '@/types/agentFile';

const UNREADABLE_SCAN =
  'This PDF has no readable text and this chat’s model can’t view pages, so the assistant won’t be able to read it. Choose a model that accepts images, or attach a version with selectable text.';

function statusLine(item: ComposerAttachment): string {
  switch (item.phase) {
    case 'uploading':
      return item.file ? `Uploading ${Math.round(item.progress * 100)}%` : 'Starting upload…';
    case 'processing':
      return item.slow
        ? 'Still reading. Scanned pages can take a couple of minutes.'
        : 'Reading file…';
    case 'failed':
      return item.error ?? 'This file could not be attached.';
    default:
      return [item.file ? describeAgentFile(item.file) : null, formatFileSize(item.sizeBytes)]
        .filter(Boolean)
        .join(' · ');
  }
}

function ComposerAttachmentChip({
  item,
  onRemove,
  modelAcceptsImages,
}: {
  readonly item: ComposerAttachment;
  readonly onRemove: (key: string) => void;
  readonly modelAcceptsImages?: boolean;
}) {
  const failed = item.phase === 'failed';
  const working = item.phase === 'uploading' || item.phase === 'processing';
  const percent = Math.round(item.progress * 100);
  // Only when the model is known not to take images; unknown gets no warning.
  const unreadable =
    item.phase === 'ready' &&
    item.file != null &&
    hasNoReadableText(item.file) &&
    modelAcceptsImages === false;
  // A reason has to be readable in full, so it takes the row.
  const wide = failed || unreadable;
  const caveats =
    item.phase === 'ready' && item.file != null && !unreadable ? agentFileCaveats(item.file) : [];

  return (
    <li
      className={cn(
        'flex min-w-0 items-start gap-2 rounded-lg border py-1.5 pl-2 pr-1 text-xs',
        wide ? 'w-full' : 'max-w-full border-gray-200 bg-gray-50',
        failed && 'border-red-200 bg-red-50',
        unreadable && 'border-amber-200 bg-amber-50'
      )}
    >
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
        {failed && <AlertCircle className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />}
        {unreadable && <AlertTriangle className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />}
        {working && <Loader size="sm" className="!h-3.5 !w-3.5 text-primary-500" />}
        {item.phase === 'ready' && !unreadable && (
          <FileText className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
        )}
      </span>
      <span className={cn('min-w-0', wide ? 'flex-1' : 'max-w-[220px]')}>
        <span className="block truncate font-medium text-gray-800" title={item.filename}>
          {item.filename}
        </span>
        <span
          className={cn(
            'block',
            wide ? 'break-words' : 'truncate text-gray-500',
            failed && 'text-red-700',
            unreadable && 'text-amber-800'
          )}
        >
          {unreadable ? UNREADABLE_SCAN : statusLine(item)}
        </span>
        {caveats.length > 0 && (
          <span className="block break-words text-gray-600">{caveats.join(' · ')}</span>
        )}
        {item.phase === 'uploading' && (
          <div
            role="progressbar"
            aria-label={`Uploading ${item.filename}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="mt-1 min-w-[120px]"
          >
            <Progress value={percent} size="xs" variant="primary" />
          </div>
        )}
      </span>
      <button
        type="button"
        onClick={() => onRemove(item.key)}
        title="Remove file"
        className="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only">Remove {item.filename}</span>
      </button>
    </li>
  );
}

interface ComposerAttachmentListProps {
  readonly items: readonly ComposerAttachment[];
  readonly onRemove: (key: string) => void;
  /** Whether the chat's model takes images; undefined when unknown. */
  readonly modelAcceptsImages?: boolean;
}

/** One chip per unsent file, above the message it will go out with. */
export function ComposerAttachmentList({
  items,
  onRemove,
  modelAcceptsImages,
}: ComposerAttachmentListProps) {
  if (items.length === 0) return null;
  const failed = items.some((item) => item.phase === 'failed');
  const waiting = items.some((item) => item.phase !== 'ready');

  return (
    <div className="mb-2">
      <ul
        aria-label="Attached files"
        className="flex max-h-44 flex-wrap items-start gap-1.5 overflow-y-auto"
      >
        {items.map((item) => (
          <ComposerAttachmentChip
            key={item.key}
            item={item}
            onRemove={onRemove}
            modelAcceptsImages={modelAcceptsImages}
          />
        ))}
      </ul>
      {waiting && (
        <p className="mt-1.5 text-[11px] text-gray-500">
          {failed
            ? 'Remove the file that couldn’t be attached, then send.'
            : 'You can send once your files are ready.'}
        </p>
      )}
      {/* Phases only, so progress percentages are never read out. */}
      <output className="sr-only">
        {items.map((item) => `${item.filename}: ${item.phase}`).join('. ')}
      </output>
    </div>
  );
}

function MessageAttachment({ file }: { readonly file: AgentFile }) {
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = async () => {
    if (opening) return;
    setError(null);
    setOpening(true);
    // Opened inside the click: a tab opened after the await is blocked as a pop-up.
    const tab = window.open('', '_blank');
    try {
      const url = await AgentFileService.getDownloadUrl(file.id);
      if (tab) {
        tab.opener = null;
        tab.location.replace(url);
      } else {
        setError('Your browser blocked the new tab. Allow pop-ups for this site and try again.');
      }
    } catch (err) {
      tab?.close();
      setError(agentFileErrorMessage(err, 'This file could not be opened.'));
    } finally {
      setOpening(false);
    }
  };

  return (
    <li className="flex max-w-[85%] flex-col items-end gap-1">
      <button
        type="button"
        onClick={open}
        title={`Open ${file.filename}`}
        className="flex max-w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-left transition-colors hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <FileText className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
        <span className="min-w-0">
          <span className="sr-only">Open </span>
          <span className="block truncate text-sm font-medium text-gray-800">{file.filename}</span>
          <span className="block truncate text-xs text-gray-500">
            {[describeAgentFile(file), ...agentFileCaveats(file)].join(' · ')}
          </span>
        </span>
        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-gray-400">
          {opening ? (
            <Loader size="sm" className="!h-3.5 !w-3.5" />
          ) : (
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </span>
      </button>
      {error && <output className="text-xs text-red-600">{error}</output>}
    </li>
  );
}

interface MessageAttachmentsProps {
  readonly files: readonly AgentFile[];
}

/** The files a message was sent with; each opens through its download link. */
export function MessageAttachments({ files }: MessageAttachmentsProps) {
  if (files.length === 0) return null;
  return (
    <ul aria-label="Attached files" className="flex flex-col items-end gap-1.5">
      {files.map((file) => (
        <MessageAttachment key={file.id} file={file} />
      ))}
    </ul>
  );
}
