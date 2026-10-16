'use client';

import { useLayoutEffect, type ReactNode } from 'react';
import { useTopBarSlot } from '@/contexts/TopBarSlotContext';

interface WorkspaceTopBarProps {
  /**
   * What is open: the document, or "New RFP" or "New proposal" on the start
   * screen; '' while it is loading (see TopBarSlotContext).
   */
  readonly title: string;
  /** At the bar's right end, before the user's own controls: the view switch. */
  readonly end?: ReactNode;
  /**
   * Stands in for the back arrow, the title and its actions: the view switch
   * on a phone, where the bar has no room for both.
   */
  readonly inPlaceOfTitle?: ReactNode;
}

/**
 * Puts the workspace's open title in the app's top bar, beside the back
 * arrow, where the page's own name would be, and its controls at the bar's
 * right end (the top bar itself leaves only the account menu beside them on
 * this page). Renders nothing itself: the top
 * bar's slots live inside `PageLayout`, so this sits among the page's
 * children and hands the title up from there. Before paint, so the bar never
 * shows a frame of the previous document's title, or of no controls, over
 * the panes of the next.
 */
export function WorkspaceTopBar({
  title,
  end = null,
  inPlaceOfTitle = null,
}: WorkspaceTopBarProps) {
  const slot = useTopBarSlot();
  const setTitle = slot?.setTitle;
  const setTrailing = slot?.setTrailing;
  const setLeftSlot = slot?.setLeftSlot;

  useLayoutEffect(() => {
    setTitle?.(title);
  }, [setTitle, title]);
  useLayoutEffect(() => () => setTitle?.(null), [setTitle]);

  useLayoutEffect(() => {
    setTrailing?.(end);
  }, [setTrailing, end]);
  useLayoutEffect(() => () => setTrailing?.(null), [setTrailing]);

  useLayoutEffect(() => {
    setLeftSlot?.(inPlaceOfTitle);
  }, [setLeftSlot, inPlaceOfTitle]);
  useLayoutEffect(() => () => setLeftSlot?.(null), [setLeftSlot]);

  return null;
}
