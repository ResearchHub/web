'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { PageLayout } from '@/app/layouts/PageLayout';
import { PortfolioRightSidebar } from '@/components/Portfolio/PortfolioRightSidebar';
import { PortfolioBalanceCard } from '@/components/Portfolio/PortfolioBalanceCard';
import { PortfolioTabs, PortfolioTab } from '@/components/Portfolio/PortfolioTabs';
import { usePortfolioOverview } from '@/components/Portfolio/lib/hooks/usePortfolioOverview';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isUserLoading } = useUser();
  const [activeTab, setActiveTab] = useState<PortfolioTab>('my-rfps');

  // Temporary: allow viewing any user's dashboard via ?user_id=X
  const userIdParam = searchParams.get('user_id');
  const overrideUserId = userIdParam ? Number(userIdParam) || undefined : undefined;
  const effectiveUserId = overrideUserId ?? user?.id;

  const { overview, isLoading: isOverviewLoading } = usePortfolioOverview(effectiveUserId);

  useEffect(() => {
    if (!isUserLoading && !user && !overrideUserId) {
      router.push(`/auth/signin?redirect=${encodeURIComponent('/fund/dashboard')}`);
    }
  }, [user, isUserLoading, router, overrideUserId]);

  if (isUserLoading && !overrideUserId) {
    return (
      <PageLayout rightSidebar={false}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </PageLayout>
    );
  }

  if (!user && !overrideUserId) {
    return null;
  }

  const firstName = overrideUserId
    ? `User ${overrideUserId}`
    : user?.fullName?.split(' ')[0] || 'Funder';

  return (
    <PageLayout
      rightSidebar={<PortfolioRightSidebar overview={overview} isLoading={isOverviewLoading} />}
    >
      <div className="space-y-6">
        <div className="pl-1 tablet:!pl-0">
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}</h2>
          <p className="text-gray-600 mt-1">Today&apos;s a good day to fund some science.</p>
        </div>

        <PortfolioBalanceCard />
        <PortfolioTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          overview={overview}
          userId={effectiveUserId}
        />
      </div>
    </PageLayout>
  );
}
