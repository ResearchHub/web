'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { cn } from '@/utils/styles';
import { ARTIFACT_ERROR_MESSAGE, buildArtifactDocument } from './artifactDocument';

interface ArtifactFrameProps {
  readonly kind: string;
  readonly content: string;
  readonly title: string;
  readonly className?: string;
}

/**
 * An artifact running in its sandbox (see `artifactDocument`). Errors the page
 * reports are shown over its bottom edge; any other message from it is
 * ignored, and only a message from this frame's own window counts.
 */
export function ArtifactFrame({ kind, content, title, className }: ArtifactFrameProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const srcDoc = useMemo(() => buildArtifactDocument(kind, content), [kind, content]);
  const [error, setError] = useState<{ srcDoc: string | null; message: string } | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source == null || event.source !== frameRef.current?.contentWindow) return;
      const data = event.data as { type?: unknown; message?: unknown } | null;
      if (data?.type !== ARTIFACT_ERROR_MESSAGE || typeof data.message !== 'string') return;
      setError({ srcDoc, message: data.message });
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [srcDoc]);

  if (srcDoc == null) return null;
  // An error belongs to the document that raised it; a new version starts clean.
  const shownError = error?.srcDoc === srcDoc ? error.message : null;

  return (
    <div className={cn('relative h-full w-full bg-white', className)}>
      <iframe
        ref={frameRef}
        // Scripts only: no same-origin access, top navigation, popups or forms.
        sandbox="allow-scripts"
        srcDoc={srcDoc}
        title={title}
        referrerPolicy="no-referrer"
        className="h-full w-full border-0"
      />
      {shownError && (
        <div className="absolute inset-x-3 bottom-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 shadow-sm">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p className="min-w-0 break-words">
            <span className="font-medium">This artifact hit an error:</span> {shownError}
          </p>
        </div>
      )}
    </div>
  );
}
