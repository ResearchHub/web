'use client';

import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/styles';
import { artifactKindInfo } from './artifactKinds';

interface ArtifactCardProps {
  readonly title: string;
  readonly kind: string | undefined;
  /** The second line: the version, or how far a draft has got. */
  readonly caption: string;
  readonly live?: boolean;
  /** Absent where no viewer is mounted; the card is then a plain label. */
  readonly onOpen?: () => void;
}

/** An artifact in the activity feed, opening it in the viewer. */
export function ArtifactCard({ title, kind, caption, live = false, onOpen }: ArtifactCardProps) {
  const { icon: Icon, label } = artifactKindInfo(kind);
  const body = (
    <>
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50',
          live && 'motion-safe:animate-pulse'
        )}
      >
        <Icon className="h-4 w-4 text-gray-500" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-gray-900">{title}</span>
        <span className="block truncate text-xs text-gray-500">
          {label} · {caption}
        </span>
      </span>
      {onOpen && <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />}
    </>
  );
  const className =
    'mt-2 flex w-full max-w-sm items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm';
  if (!onOpen) return <div className={className}>{body}</div>;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(className, 'transition-colors hover:border-gray-300 hover:bg-gray-50')}
    >
      {body}
    </button>
  );
}
