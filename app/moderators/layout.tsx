'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import { LeftSidebar as MainLeftSidebar } from '../layouts/LeftSidebar';
import { ModerationSidebar } from '@/components/Moderators/ModerationSidebar';
import { TopBar } from '../layouts/TopBar';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useUser } from '@/contexts/UserContext';
import { LoadingSkeleton } from '../layouts/components/LoadingSkeleton';

interface ModerationLayoutProps {
  readonly children: ReactNode;
}

/**
 * Combined sidebar component for mobile that shows both main navigation and moderation navigation
 */
const CombinedMobileSidebar = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Moderation Section */}
      <div className="flex-shrink-0">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="flex items-center space-x-2 text-sm font-semibold text-gray-900 uppercase tracking-wide">
            <Shield className="h-4 w-4 text-gray-600" />
            <span>Moderation</span>
          </h3>
        </div>
        <div className="bg-gray-50">
          <ModerationSidebar />
        </div>
      </div>

      {/* Main Navigation Section */}
      <div className="flex-1 border-b border-gray-200">
        <MainLeftSidebar forceMinimize={false} />
      </div>
    </div>
  );
};

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
        // Mobile layout - single column with TopBar and combined sidebar
        <div className="flex flex-col min-h-screen">
          {/* TopBar */}
          <TopBar onMenuClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} />

          {/* Mobile overlay */}
          {isLeftSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40"
              role="button"
              tabIndex={0}
              aria-label="Close sidebar"
              onClick={() => setIsLeftSidebarOpen(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsLeftSidebarOpen(false);
                }
              }}
            />
          )}

          {/* Mobile combined sidebar - shows both main nav and moderation nav */}
          <div
            className={`fixed top-[64px] left-0 h-[calc(100vh-64px)] w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${
              isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <CombinedMobileSidebar />
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-auto pt-4">{children}</div>
        </div>
      )}
    </div>
  );
}
