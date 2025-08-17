'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PageLayout } from '../layouts/PageLayout';
import { ModerationSidebar } from '@/components/Moderators/ModerationSidebar';
import { useUser } from '@/contexts/UserContext';
import { LoadingSkeleton } from '../layouts/components/LoadingSkeleton';
import { ModerationMenu } from '@/components/Moderators/ModerationSidebar';

interface ModerationLayoutProps {
  readonly children: ReactNode;
}

export default function ModerationLayout({ children }: ModerationLayoutProps) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const isFUllWidthTablePage =
    pathname === '/moderators/referral' || pathname === '/moderators/editors';

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

  return (
    <PageLayout
      rightSidebar={<ModerationSidebar />}
      className={
        isFUllWidthTablePage
          ? 'tablet:!max-w-full content-md:!max-w-full content-lg:!max-w-full content-xl:!max-w-full'
          : undefined
      }
    >
      {/* Moderation Menu - Visible on mobile, hidden on desktop */}
      <div className="lg:!hidden">
        <ModerationMenu />
      </div>
      <div className="w-full">{children}</div>
    </PageLayout>
  );
}
