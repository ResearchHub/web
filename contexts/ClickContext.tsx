'use client';

import { createContext, useContext, useState } from 'react';

export interface ClickEvent {
  type: string;
  payload: any;
}

interface ClickContextType {
  event: ClickEvent | null;
  triggerEvent: (event: ClickEvent) => void;
  clearEvent: () => void;
}

const ClickContext = createContext<ClickContextType>({
  event: null,
  triggerEvent: () => {},
  clearEvent: () => {},
});

export function ClickProvider({ children }: { children: React.ReactNode }) {
  const [event, setEvent] = useState<ClickEvent | null>(null);

  const triggerEvent = (event: ClickEvent) => {
    setEvent(event);
  };

  const clearEvent = () => setEvent(null);

  return (
    <ClickContext.Provider value={{ event, triggerEvent, clearEvent }}>
      {children}
    </ClickContext.Provider>
  );
}

export const useClickContext = () => useContext(ClickContext);
