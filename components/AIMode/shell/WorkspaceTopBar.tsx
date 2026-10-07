'use client';

import { useEffect } from 'react';
import { useTopBarSlot } from '@/contexts/TopBarSlotContext';

interface WorkspaceTopBarProps {
  /** What is open: the document, or "New RFP" or "New proposal" on the start screen. */
  readonly title: string;
}

/**
 * Puts the workspace's open title in the app's top bar, beside the back
 * arrow, where the page's own name would be. Renders nothing itself: the top
 * bar's slots live inside `PageLayout`, so this sits among the page's
 * children and hands the title up from there.
 */
export function WorkspaceTopBar({ title }: WorkspaceTopBarProps) {
  const slot = useTopBarSlot();
  const setTitle = slot?.setTitle;

  useEffect(() => {
    setTitle?.(title);
  }, [setTitle, title]);
  useEffect(() => () => setTitle?.(null), [setTitle]);

  return null;
}
