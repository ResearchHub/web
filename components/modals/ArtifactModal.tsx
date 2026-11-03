'use client';

import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Check, ChevronLeft, ChevronRight, Copy, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { MarkdownMessage } from '@/components/AgentChat/MarkdownMessage';
import { ArtifactFrame } from '@/components/AgentChat/artifacts/ArtifactFrame';
import { rendersInFrame } from '@/components/AgentChat/artifacts/artifactDocument';
import { artifactFilename, artifactKindInfo } from '@/components/AgentChat/artifacts/artifactKinds';
import { cn } from '@/utils/styles';

export interface ArtifactModalVersion {
  number: number;
  latest: number;
  onSelect: (number: number) => void;
}

interface ArtifactModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly kind?: string;
  readonly language?: string;
  /** Null while the content loads. */
  readonly content: string | null;
  readonly error?: string | null;
  /** The agent is still writing it: the code streams in and there is no preview yet. */
  readonly writing?: boolean;
  readonly version?: ArtifactModalVersion | null;
}

type View = 'preview' | 'code';

function hasPreview(kind: string | undefined): boolean {
  return kind === 'markdown' || rendersInFrame(kind ?? '');
}

function download(content: string, filename: string, mimeType: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function CodeView({ content, follow }: { readonly content: string; readonly follow: boolean }) {
  const ref = useRef<HTMLPreElement>(null);
  // While the agent writes, keep the newest line in view.
  useEffect(() => {
    if (follow && ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [content, follow]);
  return (
    <pre
      ref={ref}
      className="h-full overflow-auto whitespace-pre-wrap break-words bg-gray-50 p-4 font-mono text-xs leading-relaxed text-gray-800"
    >
      {content}
    </pre>
  );
}

/**
 * An artifact from an agent chat, nearly full screen: its preview (sandboxed
 * for pages, components, images and diagrams) or its source, with copy,
 * download and its versions.
 */
export function ArtifactModal({
  isOpen,
  onClose,
  title,
  kind,
  language = '',
  content,
  error,
  writing = false,
  version,
}: ArtifactModalProps) {
  const [view, setView] = useState<View>('preview');
  const [copied, setCopied] = useState(false);
  const previewable = hasPreview(kind);
  const shown: View = previewable && !writing ? view : 'code';
  const { icon: Icon, label, mimeType } = artifactKindInfo(kind);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    if (content == null) return;
    navigator.clipboard
      .writeText(content)
      .then(() => setCopied(true))
      .catch(() => {});
  };

  let body;
  if (error) {
    body = <p className="p-6 text-sm text-gray-500">{error}</p>;
  } else if (content == null) {
    body = (
      <div className="flex h-full items-center justify-center">
        <Loader size="md" />
      </div>
    );
  } else if (shown === 'code') {
    body = <CodeView content={content} follow={writing} />;
  } else if (kind === 'markdown') {
    body = (
      <div className="h-full overflow-auto px-6 py-5">
        <MarkdownMessage content={content} className="mx-auto max-w-3xl text-gray-800" />
      </div>
    );
  } else {
    body = <ArtifactFrame kind={kind ?? ''} content={content} title={title} />;
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[9999]">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 md:p-6">
        <DialogPanel className="flex h-full w-full flex-col overflow-hidden bg-white shadow-xl md:rounded-xl">
          <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-2.5">
            <Icon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate text-sm font-semibold text-gray-900">
                {title}
              </DialogTitle>
              <p className="truncate text-xs text-gray-500">
                {label}
                {language && kind === 'code' ? ` · ${language}` : ''}
                {writing ? ' · Writing…' : ''}
              </p>
            </div>

            {version && version.latest > 1 && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <button
                  type="button"
                  aria-label="Previous version"
                  disabled={version.number <= 1}
                  onClick={() => version.onSelect(version.number - 1)}
                  className="rounded p-1 hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="whitespace-nowrap tabular-nums">
                  Version {version.number} of {version.latest}
                </span>
                <button
                  type="button"
                  aria-label="Next version"
                  disabled={version.number >= version.latest}
                  onClick={() => version.onSelect(version.number + 1)}
                  className="rounded p-1 hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {previewable && (
              <div className="flex rounded-md bg-gray-100 p-0.5 text-xs font-medium">
                {(['preview', 'code'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    disabled={writing && option === 'preview'}
                    onClick={() => setView(option)}
                    aria-pressed={shown === option}
                    className={cn(
                      'rounded px-2.5 py-1 capitalize text-gray-600 disabled:opacity-40',
                      shown === option && 'bg-white text-gray-900 shadow-sm'
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={copied ? 'Copied' : 'Copy'}
              title={copied ? 'Copied' : 'Copy'}
              disabled={content == null || writing}
              onClick={copy}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Download"
              title="Download"
              disabled={content == null || writing}
              onClick={() =>
                content != null &&
                download(content, artifactFilename(title, kind ?? '', language), mimeType)
              }
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Close"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="min-h-0 flex-1">{body}</div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
