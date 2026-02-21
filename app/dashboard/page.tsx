import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { DashboardGrants } from './DashboardGrants';
import { DashboardPageClient } from './DashboardPageClient';
import { GrantCarouselSkeleton } from '@/components/skeletons/GrantCarouselSkeleton';

interface DashboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);

  const userIdParam = typeof params.user_id === 'string' ? params.user_id : undefined;
  const userId = userIdParam || (session as any)?.userId;

  if (!userId) {
    return (
      <DashboardPageClient>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-gray-500">Please log in to view your dashboard.</p>
        </div>
      </DashboardPageClient>
    );
  }

  return (
    <DashboardPageClient>
      <Suspense fallback={<GrantCarouselSkeleton />}>
        <DashboardGrants userId={userId} />
      </Suspense>
    </DashboardPageClient>
  );
}
