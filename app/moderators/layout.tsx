'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LeftSidebar as MainLeftSidebar } from '../layouts/LeftSidebar';
import { ModerationSidebar } from '@/components/Moderators/ModerationSidebar';
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
        // Desktop layout - 3 column grid
        <div
          className="grid min-h-screen w-full"
          style={{
            gridTemplateColumns: '70px 280px minmax(0, 1fr)',
          }}
        >
          {/* Main Left Sidebar - 70px fixed width (minimized) */}
          <div className="border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
            <MainLeftSidebar forceMinimize={true} />
          </div>

          {/* Moderation Left Sidebar - 280px fixed width */}
          <div className="border-r border-gray-200 h-screen sticky top-0 overflow-y-auto bg-gray-50">
            <ModerationSidebar />
          </div>

          {/* Main content area - flexible width */}
          <div className="flex flex-col">
            {/* Main content */}
            <div className="flex-1 overflow-auto">{children}</div>
          </div>
        </div>
      ) : (
        // Mobile layout - single column (simplified for now)
        <div className="flex flex-col min-h-screen">
          {/* Mobile header with navigation */}
          <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="px-4 py-3">
              <h1 className="text-lg font-semibold text-gray-900">Moderation Dashboard</h1>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      )}
    </div>
  );
}
