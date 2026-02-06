'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { PageLayout } from '@/app/layouts/PageLayout';
import { PortfolioRightSidebar } from '@/components/Portfolio/PortfolioRightSidebar';
import { PortfolioBalanceCard } from '@/components/Portfolio/PortfolioBalanceCard';
import { PortfolioTabs, PortfolioTab } from '@/components/Portfolio/PortfolioTabs';
import { usePortfolioOverview } from '@/components/Portfolio/lib/hooks/usePortfolioOverview';
import { Icon } from '@/components/ui/icons/Icon';
import { Loader2 } from 'lucide-react';

export default function PortfolioPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const [activeTab, setActiveTab] = useState<PortfolioTab>('my-rfps');
  const { overview, isLoading: isOverviewLoading } = usePortfolioOverview();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push(`/auth/signin?redirect=${encodeURIComponent('/fund/portfolio')}`);
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return (
      <PageLayout rightSidebar={false}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return null;
  }

  const firstName = user.fullName?.split(' ')[0] || 'Funder';

  return (
    <PageLayout
      rightSidebar={<PortfolioRightSidebar overview={overview} isLoading={isOverviewLoading} />}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3 tablet:!hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-50">
            <Icon name="fund" size={20} color="#3971ff" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Portfolio Dashboard</h1>
            <p className="text-sm text-gray-500">
              A feel-good view of what you&apos;ve funded and the momentum you&apos;re building
            </p>
          </div>
        </div>

        <div className="pl-1 tablet:!pl-0">
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}</h2>
          <p className="text-gray-600 mt-1">Today&apos;s a good day to fund some science.</p>
        </div>

        <PortfolioBalanceCard />
        <PortfolioTabs activeTab={activeTab} onTabChange={setActiveTab} overview={overview} />
      </div>
    </PageLayout>
  );
}
