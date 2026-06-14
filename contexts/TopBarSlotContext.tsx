'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface TopBarSlotContextValue {
  /** Custom node rendered in the TopBar's top-left, replacing the breadcrumb. */
  leftSlot: ReactNode;
  setLeftSlot: (node: ReactNode) => void;
}

const TopBarSlotContext = createContext<TopBarSlotContextValue | null>(null);

/**
 * Lets a page inject a custom element into the shared TopBar's left area (where
 * the breadcrumb normally renders). Used by the notebook to surface its
 * "Notebook" notes dropdown in the standard top bar. Pages that don't set a
 * slot fall back to the default breadcrumb.
 */
export function TopBarSlotProvider({ children }: { children: ReactNode }) {
  const [leftSlot, setLeftSlot] = useState<ReactNode>(null);
  const value = useMemo(() => ({ leftSlot, setLeftSlot }), [leftSlot]);
  return <TopBarSlotContext.Provider value={value}>{children}</TopBarSlotContext.Provider>;
}

/** Returns the slot context, or null when rendered outside a provider. */
export function useTopBarSlot(): TopBarSlotContextValue | null {
  return useContext(TopBarSlotContext);
}
