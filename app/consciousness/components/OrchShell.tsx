'use client';

import type { ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { themeVars, parseSet } from '../theme';
import { OrchActionsProvider } from './OrchActions';

/**
 * A full-screen page of its own, without the app's sidebar or top bar: the
 * ResearchHub logo at the hero's top left is the way home.
 */
export function OrchShell({
  children,
  fontClassName,
}: {
  children: ReactNode;
  fontClassName: string;
}) {
  // The palette follows the graphic set, as the page's figures do; like the
  // page, it only reads `?set=` with `?design=1`.
  const params = useSearchParams();
  const set = parseSet(params.get('design') === '1' ? params.get('set') : null);

  return (
    <main className={`orch relative min-h-screen min-w-0 ${fontClassName}`} style={themeVars(set)}>
      <OrchActionsProvider>{children}</OrchActionsProvider>
    </main>
  );
}
