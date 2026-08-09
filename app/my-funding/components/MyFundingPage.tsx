'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FunderDashboardPage } from '@/components/Funding/dashboard/FunderDashboardPage';
import { Icon } from '@/components/ui/icons/Icon';
import { Tabs } from '@/components/ui/Tabs';
import { useUser } from '@/contexts/UserContext';
import { FundsReceivedTab } from './FundsReceivedTab';

type MyFundingTab = 'given' | 'received';

const MY_FUNDING_TABS = [
  { id: 'given', label: 'Funds given', href: '/my-funding?tab=given' },
  { id: 'received', label: 'Funds received', href: '/my-funding?tab=received' },
];

function resolveMyFundingTab(tab: string | null): MyFundingTab {
  return tab === 'received' ? 'received' : 'given';
}

function FundingDirectionCards() {
  return (
    <div aria-hidden="true" className="relative h-60 w-[19rem] max-w-full sm:w-[22rem]">
      <div className="absolute inset-8 rounded-full bg-primary-400/25 blur-3xl" />

      <div className="absolute left-1 top-3 w-48 -rotate-[6deg] rounded-2xl border border-gray-200 bg-white p-5 shadow-xl shadow-gray-900/10 sm:w-56">
        <div className="flex items-center justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
            <Icon name="fund" size={23} color="#3971ff" />
          </span>
          <ArrowUpRight className="h-5 w-5 text-primary-500" />
        </div>
        <p className="mt-5 text-lg font-bold tracking-tight text-gray-900">Funds given</p>
        <p className="mt-0.5 text-xs font-medium text-gray-500">Impact &amp; activity</p>
        <div className="mt-5 space-y-2">
          <div className="h-2 rounded-full bg-primary-100" />
          <div className="h-2 w-2/3 rounded-full bg-gray-100" />
        </div>
      </div>

      <div className="absolute bottom-2 right-0 w-48 rotate-[5deg] overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 p-5 text-white shadow-2xl shadow-primary-900/30 ring-1 ring-primary-700/30 sm:w-56">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative flex items-center justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Icon name="earn3" size={23} color="white" />
          </span>
          <ArrowDownLeft className="h-5 w-5 text-white/80" />
        </div>
        <p className="relative mt-5 text-lg font-bold tracking-tight">Funds received</p>
        <p className="relative mt-0.5 text-xs font-medium text-white/65">Earnings &amp; reviews</p>
        <div className="relative mt-5 flex gap-2">
          <span className="h-8 flex-1 rounded-lg bg-white/15" />
          <span className="h-8 flex-1 rounded-lg bg-white/10" />
          <span className="h-8 flex-1 rounded-lg bg-white/15" />
        </div>
      </div>
    </div>
  );
}

function MyFundingHero({ tabBar }: Readonly<{ tabBar: ReactNode }>) {
  return (
    <div className="relative overflow-hidden border-b border-gray-200 bg-gray-50">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #3971ff 1px, transparent 1px), linear-gradient(to bottom, #3971ff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-primary-200/50 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-[1180px] px-4 pb-10 pt-12 tablet:!px-8 sm:pb-12 sm:pt-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
              My Funding
            </p>
            <h1
              className="text-4xl font-bold leading-[1.05] tracking-[-0.032em] text-[#0b1530] sm:text-5xl"
              style={{
                fontFamily: "'Cal Sans', var(--font-geist-sans), system-ui, sans-serif",
                textWrap: 'balance',
              }}
            >
              The science you fund. <span className="text-[#3971ff]">The work that funds you.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
              Follow the funding you give and the earnings you receive, all in one place.
            </p>
          </div>

          <div className="flex justify-center lg:justify-end lg:pr-6">
            <FundingDirectionCards />
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1180px] px-4 tablet:!px-8">{tabBar}</div>
    </div>
  );
}

export function MyFundingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isLoadingUser } = useUser();
  const activeTab = resolveMyFundingTab(searchParams.get('tab'));
  const shouldStripFunderId =
    activeTab === 'received' && user?.isModerator === true && searchParams.has('funder_id');

  useEffect(() => {
    if (isLoadingUser) return;

    if (!user) {
      router.replace('/');
      return;
    }

    if (!shouldStripFunderId) return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete('funder_id');
    router.replace(`/my-funding?${params.toString()}`, { scroll: false });
  }, [isLoadingUser, router, searchParams, shouldStripFunderId, user]);

  if (isLoadingUser || !user || shouldStripFunderId) return null;

  const tabBar = (
    <Tabs
      tabs={MY_FUNDING_TABS}
      activeTab={activeTab}
      onTabChange={() => {}}
      className="border-b-0"
    />
  );

  return (
    <PageLayout rightSidebar={false} wideContent topBanner={<MyFundingHero tabBar={tabBar} />}>
      {activeTab === 'given' ? <FunderDashboardPage embedded /> : <FundsReceivedTab />}
    </PageLayout>
  );
}
