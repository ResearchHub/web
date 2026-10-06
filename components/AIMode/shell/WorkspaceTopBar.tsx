'use client';

import { useEffect, useMemo } from 'react';
import { PanelLeftOpen } from 'lucide-react';
import { useTopBarSlot } from '@/contexts/TopBarSlotContext';
import { cn } from '@/utils/styles';

interface WorkspaceTopBarProps {
  /** What is open: the document's title, or "New RFP" or "New proposal" on the start screen. */
  readonly title: string;
  /**
   * Shows or hides the user's documents while the app's left column is an
   * icon rail with no room for them; absent once the column holds them, and
   * on a phone, where the ☰ menu has them.
   */
  readonly onToggleList?: () => void;
  readonly listOpen?: boolean;
}

/**
 * Puts the workspace's open title in the app's top bar, beside the back
 * arrow, where the page's own name would be. Renders nothing itself: the top
 * bar's slots live inside `PageLayout`, so this sits among the page's
 * children and hands the title up from there.
 */
export function WorkspaceTopBar({ title, onToggleList, listOpen = false }: WorkspaceTopBarProps) {
  const slot = useTopBarSlot();
  const setTitle = slot?.setTitle;
  const setLeading = slot?.setLeading;

  useEffect(() => {
    setTitle?.(title);
  }, [setTitle, title]);
  useEffect(() => () => setTitle?.(null), [setTitle]);

  const listButton = useMemo(() => {
    if (!onToggleList) return null;
    const label = listOpen ? 'Hide documents' : 'Show documents';
    return (
      <button
        type="button"
        onClick={onToggleList}
        aria-pressed={listOpen}
        aria-label={label}
        title={label}
        className={cn(
          'mr-2 hidden shrink-0 items-center justify-center rounded-lg p-1.5 transition-colors tablet:!inline-flex sidebar-compact:!hidden',
          listOpen
            ? 'bg-primary-50 text-primary-700 hover:bg-primary-100'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        )}
      >
        <PanelLeftOpen className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>
    );
  }, [onToggleList, listOpen]);

  useEffect(() => {
    setLeading?.(listButton);
  }, [setLeading, listButton]);
  useEffect(() => () => setLeading?.(null), [setLeading]);

  return null;
}
