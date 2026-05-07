'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutWithRightSidebar } from '../layouts/LayoutWithRightSidebar';
import {
  ExpertFinderSidebar,
  ExpertFinderMenu,
} from '@/components/ExpertFinder/ExpertFinderSidebar';
import { useUser } from '@/contexts/UserContext';
import { LoadingSkeleton } from '../layouts/components/LoadingSkeleton';

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
      <div className="min-h-screen bg-white">
        <LoadingSkeleton />
      </div>
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
