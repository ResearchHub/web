'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutWithRightSidebar } from '../layouts/LayoutWithRightSidebar';
import { ModerationSidebar, ModerationMenu } from '@/components/Moderators/ModerationSidebar';
import { useUser } from '@/contexts/UserContext';
import { LoadingSkeleton } from '../layouts/components/LoadingSkeleton';

interface ModerationClientLayoutProps {
  readonly children: ReactNode;
}

const FULL_WIDTH_CLASS =
  'tablet:!max-w-full content-md:!max-w-full content-lg:!max-w-full content-xl:!max-w-full';

export default function ModerationClientLayout({ children }: ModerationClientLayoutProps) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  const pathname = usePathname();
  const isFullWidthTablePage =
    pathname === '/moderators/referral' || pathname === '/moderators/editors';

  const isModerator = !!user?.isModerator;

  useEffect(() => {
    if (!isLoading && !isModerator) {
      router.push('/popular');
    }
  }, [isLoading, isModerator, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!isModerator) {
    return null;
  }

  return (
    <LayoutWithRightSidebar
      rightSidebar={<ModerationSidebar />}
      mobileMenu={<ModerationMenu />}
      className={isFullWidthTablePage ? FULL_WIDTH_CLASS : undefined}
    >
      {children}
    </LayoutWithRightSidebar>
  );
}
