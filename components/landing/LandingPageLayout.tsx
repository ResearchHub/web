'use client';

import { ReactNode, useState } from 'react';
import { LeftSidebar } from '../../app/layouts/LeftSidebar';

interface LandingPageLayoutProps {
  children: ReactNode;
}

export function LandingPageLayout({ children }: LandingPageLayoutProps) {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {isLeftSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 tablet:!hidden"
          onClick={() => setIsLeftSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar - Minimized with icons only */}
      <div
        className={`
          tablet:!sticky tablet:!top-0 h-screen bg-white border-r border-gray-200
          z-50 tablet:z-30
          transition-all duration-200 ease-in-out
          flex-shrink-0

          tablet:!translate-x-0
          tablet:!w-[70px]

          ${isLeftSidebarOpen ? 'fixed top-0 !translate-x-0 w-[280px] block' : 'fixed top-0 !-translate-x-full w-[280px] hidden'}

          tablet:!block
        `}
      >
        <LeftSidebar forceMinimize={true} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Page Content - No top bar for landing page */}
        <main className="flex-1 overflow-auto">
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
    </div>
  );
}
