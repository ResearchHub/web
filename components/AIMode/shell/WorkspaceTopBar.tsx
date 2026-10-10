'use client';

import { useEffect, type ReactNode } from 'react';
import { useTopBarSlot } from '@/contexts/TopBarSlotContext';

interface WorkspaceTopBarProps {
  /**
   * What is open: the document, or "New RFP" or "New proposal" on the start
   * screen; '' while it is loading (see TopBarSlotContext).
   */
  readonly title: string;
  /** Beside the title: the open draft's ⋯ menu. */
  readonly actions?: ReactNode;
}

/**
 * Puts the workspace's open title in the app's top bar, beside the back
 * arrow, where the page's own name would be, with its actions after it. Renders nothing itself: the top
 * bar's slots live inside `PageLayout`, so this sits among the page's
 * children and hands the title up from there.
 */
export function WorkspaceTopBar({ title, actions = null }: WorkspaceTopBarProps) {
  const slot = useTopBarSlot();
  const setTitle = slot?.setTitle;
  const setTitleActions = slot?.setTitleActions;

  useEffect(() => {
    setTitle?.(title);
  }, [setTitle, title]);
  useEffect(() => () => setTitle?.(null), [setTitle]);

  useEffect(() => {
    setTitleActions?.(actions);
  }, [setTitleActions, actions]);
  useEffect(() => () => setTitleActions?.(null), [setTitleActions]);

  return null;
}
