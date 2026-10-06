'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface TopBarSlotContextValue {
  /** Custom node rendered in the TopBar's top-left, replacing the breadcrumb. */
  leftSlot: ReactNode;
  setLeftSlot: (node: ReactNode) => void;
  /**
   * Shown in place of the page's own title, beside the back arrow, which
   * stays: a page that names what is open rather than itself.
   */
  title: string | null;
  setTitle: (title: string | null) => void;
  /** A control seated between the back arrow and the title. */
  leading: ReactNode;
  setLeading: (node: ReactNode) => void;
}

const TopBarSlotContext = createContext<TopBarSlotContextValue | null>(null);

/**
 * Lets a page inject a custom element into the shared TopBar's left area (where
 * the breadcrumb normally renders). Used by the notebook to surface its
 * "Notebook" notes dropdown in the standard top bar, and by the workspace to
 * put the open document's or conversation's title there. Pages that don't set
 * anything fall back to the default breadcrumb.
 */
export function TopBarSlotProvider({ children }: { children: ReactNode }) {
  const [leftSlot, setLeftSlot] = useState<ReactNode>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [leading, setLeading] = useState<ReactNode>(null);
  const value = useMemo(
    () => ({ leftSlot, setLeftSlot, title, setTitle, leading, setLeading }),
    [leftSlot, title, leading]
  );
  return <TopBarSlotContext.Provider value={value}>{children}</TopBarSlotContext.Provider>;
}

/** Returns the slot context, or null when rendered outside a provider. */
export function useTopBarSlot(): TopBarSlotContextValue | null {
  return useContext(TopBarSlotContext);
}
