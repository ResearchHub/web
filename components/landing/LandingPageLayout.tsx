'use client';

import { ReactNode } from 'react';
import { LandingTopBar } from './LandingTopBar';

interface LandingPageLayoutProps {
  children: ReactNode;
}

export function LandingPageLayout({ children }: LandingPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <LandingTopBar />

      {/* Main Content Area */}
      <main className="relative">
        <style jsx global>{`
          @keyframes pulse-slow {
            0%,
            100% {
              opacity: 0.3;
              transform: scale(1);
            }
            50% {
              opacity: 0.6;
              transform: scale(1.05);
            }
          }
          .animate-pulse-slow {
            animation: pulse-slow 4s infinite;
          }
        `}</style>
        {children}
      </main>
    </div>
  );
}
