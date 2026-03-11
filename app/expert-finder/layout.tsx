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

interface ExpertFinderLayoutProps {
  readonly children: ReactNode;
}

export default function ExpertFinderLayout({ children }: ExpertFinderLayoutProps) {
  const { user, isLoading } = useUser();
  const router = useRouter();
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
      rightSidebar={<ExpertFinderSidebar />}
      mobileMenu={<ExpertFinderMenu />}
      className={FULL_WIDTH_CLASS}
    >
      {children}
    </LayoutWithRightSidebar>
  );
}
