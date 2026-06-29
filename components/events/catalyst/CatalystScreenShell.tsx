'use client';

import type { ReactNode } from 'react';

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
        <div className="screen__bg" />
        <div className="screen__grid" />
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
        .screen__bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            108% 86% at 24% 22%,
            #7b43be 0%,
            #5a2db0 24%,
            #3a1f86 46%,
            #20104e 72%,
            #0c0720 100%
          );
        }
        .screen__grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 22px 22px;
          -webkit-mask-image: radial-gradient(120% 100% at 30% 20%, transparent 35%, #000 100%);
          mask-image: radial-gradient(120% 100% at 30% 20%, transparent 35%, #000 100%);
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
