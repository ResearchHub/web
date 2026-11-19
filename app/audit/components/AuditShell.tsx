'use client';

import type { ReactNode } from 'react';
import { OrchActionsProvider } from '@/app/consciousness/components/OrchActions';

/**
 * A full-screen page of its own, without the app's sidebar or top bar, as
 * /consciousness is. Until the RFP is loaded its two buttons only say that
 * the call opens soon (`OrchActionsProvider`); `AuditRfpActions` then wires
 * them to the live RFP.
 */
export function AuditShell({
  children,
  fontClassName,
}: {
  children: ReactNode;
  fontClassName: string;
}) {
  return (
    <main className={`audit relative min-h-screen min-w-0 ${fontClassName}`}>
      <OrchActionsProvider>{children}</OrchActionsProvider>
    </main>
  );
}
