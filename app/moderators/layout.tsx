'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LeftSidebar as MainLeftSidebar } from '../layouts/LeftSidebar';
import { ModerationSidebar } from '@/components/Moderators/ModerationSidebar';
import { TopBar } from '../layouts/TopBar';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useUser } from '@/contexts/UserContext';
import { LoadingSkeleton } from '../layouts/components/LoadingSkeleton';

interface ModerationLayoutProps {
  readonly children: ReactNode;
}

export default function ModerationLayout({ children }: ModerationLayoutProps) {
  const { lgAndUp } = useScreenSize();
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const isDesktop = lgAndUp;

  // Check if user is a moderator
  const isModerator = !!user?.isModerator;

  // Redirect non-moderators to trending page
  useEffect(() => {
    if (!isLoading && !isModerator) {
      router.push('/trending');
    }
  }, [isLoading, isModerator, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <LoadingSkeleton />
      </div>
    );
  }

  // Don't render anything if user is not a moderator (will redirect)
  if (!isModerator) {
    return null;
  }

  if (isDesktop === null) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {isDesktop ? (
        // Desktop layout - sidebars + TopBar positioned correctly
        <div className="flex min-h-screen">
          {/* Main Left Sidebar - 70px fixed width (minimized) */}
          <div className="w-[70px] border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
            <MainLeftSidebar forceMinimize={true} />
          </div>

          {/* Right content area - TopBar + Moderation sidebar + Main content */}
          <div className="flex flex-col flex-1">
            {/* TopBar - spans from main sidebar edge to right edge */}
            <TopBar onMenuClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} />

            {/* Content area below TopBar */}
            <div className="flex flex-1">
              {/* Moderation Left Sidebar - 280px fixed width */}
              <div className="w-[280px] border-r border-gray-200 h-full sticky top-[64px] overflow-y-auto bg-gray-50">
                <ModerationSidebar />
              </div>

              {/* Main content area - flexible width */}
              <div className="flex-1 min-w-0">
                <div className="h-full overflow-auto">{children}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Mobile layout - single column with TopBar
        <div className="flex flex-col min-h-screen">
          {/* TopBar */}
          <TopBar onMenuClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} />

          {/* Mobile overlay */}
          {isLeftSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsLeftSidebarOpen(false)}
            />
          )}

          {/* Mobile sidebar */}
          <div
            className={`fixed top-[64px] left-0 h-[calc(100vh-64px)] w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-50 ${
              isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <ModerationSidebar />
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-auto pt-4">{children}</div>
        </div>
      )}
    </div>
  );
}
