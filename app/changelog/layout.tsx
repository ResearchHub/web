'use client';

import { useState, useEffect } from 'react';
import { LeftSidebar as MainLeftSidebar } from '../layouts/LeftSidebar';
import { TopBar } from '../layouts/TopBar';

export default function ChangelogLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);

  useEffect(() => {
    if (isLeftSidebarOpen) {
      setShowOverlay(true);
      setTimeout(() => setOverlayVisible(true), 0);
    } else {
      setOverlayVisible(false);
      const timeout = setTimeout(() => setShowOverlay(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isLeftSidebarOpen]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* TopBar */}
      <div className="fixed top-0 right-0 left-0 tablet:!left-[70px] z-[60] tablet:!z-50 bg-white border-b border-gray-200">
        <TopBar onMenuClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} />
      </div>

      {/* Mobile overlay */}
      {showOverlay && (
        <button
          type="button"
          className={`fixed inset-0 bg-black ${
            overlayVisible ? 'opacity-50' : 'opacity-0'
          } z-40 tablet:!hidden transition-opacity duration-300 ease-in-out cursor-default`}
          onClick={() => setIsLeftSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`
          fixed top-[64px] w-[280px] h-[calc(100vh-64px)] bg-white border-r border-gray-200
          z-50 tablet:!hidden
          transition-all duration-300 ease-in-out
          ${isLeftSidebarOpen ? '!translate-x-0' : '!-translate-x-full'}
        `}
      >
        <MainLeftSidebar forceMinimize={false} />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden tablet:!block fixed top-0 left-0 w-[70px] h-screen border-r border-gray-200 bg-white z-30">
        <MainLeftSidebar forceMinimize={true} />
      </div>

      {/* Main Content Area */}
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden tablet:!ml-[70px]"
        style={{ marginTop: '64px' }}
      >
        {children}
      </main>
    </div>
  );
}
