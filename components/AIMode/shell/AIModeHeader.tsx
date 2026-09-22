'use client';

import { BriefcaseBusiness } from 'lucide-react';
import { TopBarBackButton } from '@/app/layouts/topbar/TopBarBackButton';
import { AI_MODE_NAME } from '../copy';

interface AIModeHeaderProps {
  /**
   * What is open, beside the name: the conversation's title when the chat is
   * the main pane, the document's when it is; null on the new-conversation
   * screen.
   */
  readonly title: string | null;
  /**
   * Receives the element the document pane renders its publish controls
   * into. Absent below the tablet breakpoint, where the drawer keeps them.
   */
  readonly publishControlsRef?: (element: HTMLDivElement | null) => void;
  /** Leaves the workspace for the page it opened over. */
  readonly onBack: () => void;
}

/** The workspace's top strip: the way back, the name, what is open, and the open document's publishing state. */
export function AIModeHeader({ title, publishControlsRef, onBack }: AIModeHeaderProps) {
  const backLabel = `Leave ${AI_MODE_NAME}`;
  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-3">
      <div className="flex min-w-0 items-center gap-2">
        <TopBarBackButton onClick={onBack} variant="mobile" label={backLabel} />
        <TopBarBackButton onClick={onBack} variant="desktop" label={backLabel} />
        <BriefcaseBusiness
          className="h-[18px] w-[18px] shrink-0 text-gray-900"
          aria-hidden="true"
        />
        <span className="shrink-0 text-base font-semibold tracking-tight text-gray-900">
          {AI_MODE_NAME}
        </span>
        {title != null && (
          <>
            <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-gray-200" />
            <span className="min-w-0 max-w-[320px] truncate text-sm text-gray-700">{title}</span>
          </>
        )}
      </div>
      {publishControlsRef && (
        <div ref={publishControlsRef} className="flex shrink-0 items-center" />
      )}
    </header>
  );
}
