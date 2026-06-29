'use client';

import type { ReactNode } from 'react';
import { CatalystVioletBackdrop } from './CatalystVioletBackdrop';

interface CatalystScreenShellProps {
  children: ReactNode;
  /** space-between layout for arrival; default stacks top-to-bottom */
  contentLayout?: 'spread' | 'stack';
}

export function CatalystScreenShell({
  children,
  contentLayout = 'stack',
}: CatalystScreenShellProps) {
  return (
    <div className="catalyst-shell">
      <main className="screen">
        <CatalystVioletBackdrop />
        <div className={`content ${contentLayout === 'spread' ? 'content--spread' : ''}`}>
          {children}
        </div>
      </main>

      <style jsx>{`
        .catalyst-shell {
          font-family:
            var(--font-geist-sans),
            -apple-system,
            system-ui,
            sans-serif;
          background: #11121a;
          display: flex;
          justify-content: center;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
          min-height: 100dvh;
        }
        .screen {
          position: relative;
          width: 100%;
          max-width: none;
          min-height: 100vh;
          min-height: 100dvh;
          background: #0c0720;
          overflow: hidden;
          color: #fff;
        }
        .content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          min-height: 100dvh;
          padding: max(56px, env(safe-area-inset-top)) max(30px, env(safe-area-inset-right))
            max(40px, env(safe-area-inset-bottom)) max(30px, env(safe-area-inset-left));
        }
        .content--spread {
          justify-content: space-between;
        }
      `}</style>
    </div>
  );
}
