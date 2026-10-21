'use client';

import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

interface FundPanelContextValue {
  isFundPanelOpen: boolean;
  openFundPanel: () => void;
  closeFundPanel: () => void;
}

const FundPanelContext = createContext<FundPanelContextValue | null>(null);

/**
 * Whether the page's fund panel is open. On an RFP or a proposal page the
 * sidebar card, the phone's action bar and the panel itself sit in different
 * parts of the layout; this is what they share.
 */
export function FundPanelProvider({ children }: { children: ReactNode }) {
  const [isFundPanelOpen, setIsFundPanelOpen] = useState(false);
  const value = useMemo(
    () => ({
      isFundPanelOpen,
      openFundPanel: () => setIsFundPanelOpen(true),
      closeFundPanel: () => setIsFundPanelOpen(false),
    }),
    [isFundPanelOpen]
  );
  return <FundPanelContext.Provider value={value}>{children}</FundPanelContext.Provider>;
}

export function useFundPanel(): FundPanelContextValue {
  const context = useContext(FundPanelContext);
  if (!context) throw new Error('useFundPanel must be used within FundPanelProvider');
  return context;
}
