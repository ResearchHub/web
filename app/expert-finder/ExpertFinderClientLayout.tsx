'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutWithRightSidebar } from '../layouts/LayoutWithRightSidebar';
import {
  ExpertFinderSidebar,
  ExpertFinderMenu,
} from '@/components/ExpertFinder/ExpertFinderSidebar';
import {
  ExpertFinderSidebarSkeleton,
  ExpertFinderMenuSkeleton,
} from '@/components/ExpertFinder/ExpertFinderSidebarSkeleton';
import { useUser } from '@/contexts/UserContext';

const FULL_WIDTH_CLASS =
  'tablet:!max-w-full content-md:!max-w-full content-lg:!max-w-full content-xl:!max-w-full';

interface ExpertFinderClientLayoutProps {
  readonly children: ReactNode;
}

export default function ExpertFinderClientLayout({ children }: ExpertFinderClientLayoutProps) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const isModerator = !!user?.isModerator;
  const isHubEditor = !!user?.authorProfile?.isHubEditor;
  const canAccessExpertFinder = isModerator || isHubEditor;

  useEffect(() => {
    if (!isLoading && !canAccessExpertFinder) {
      router.push('/popular');
    }
  }, [isLoading, canAccessExpertFinder, router]);

  if (isLoading) {
    return (
      <LayoutWithRightSidebar
        rightSidebar={<ExpertFinderSidebarSkeleton />}
        mobileMenu={<ExpertFinderMenuSkeleton />}
        className={FULL_WIDTH_CLASS}
      >
        <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-pulse">
          <div className="h-8 w-1/3 bg-gray-200 rounded mb-4" />
          <div className="h-4 w-2/3 bg-gray-200 rounded mb-8" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </LayoutWithRightSidebar>
    );
  }

  if (!canAccessExpertFinder) {
    return null;
  }

  return (
    <LayoutWithRightSidebar
      rightSidebar={<ExpertFinderSidebar />}
      mobileMenu={<ExpertFinderMenu />}
      className={FULL_WIDTH_CLASS}
    >
      {children}
    </LayoutWithRightSidebar>
  );
}
