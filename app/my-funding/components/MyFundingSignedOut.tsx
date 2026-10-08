'use client';

import Link from 'next/link';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingPowerCard } from '@/components/Funding/FundingPowerCard';
import { MyFundingEmptyState } from '@/components/Funding/dashboard/MyFundingEmptyState';
import { MyFundingLiveHero } from '@/components/Funding/dashboard/MyFundingLiveHero';
import { MyFundingRail } from '@/components/Funding/dashboard/MyFundingRail';
import { useAuthModalContext } from '@/contexts/AuthModalContext';

/**
 * My Funding for someone who has not signed in: a feed of the kinds of things
 * that land here once they take part, a way to sign in, drafting an RFP or a proposal, and the
 * proposals and RFPs open right now so the preview is real rather than a
 * promise. Its width and rail are the signed-in page's.
 */
export function MyFundingSignedOut() {
  const { showAuthModal } = useAuthModalContext();

  return (
    <PageLayout
      contentWidth="narrow"
      rightSidebar={<MyFundingRail />}
      rightSidebarAbove={<FundingPowerCard className="w-full" />}
      rightSidebarTopOffset="aligned"
      topBanner={
        <MyFundingLiveHero
          actions={
            <>
              <button
                type="button"
                onClick={() => showAuthModal()}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-primary-500 px-5 sm:flex-none text-[15px] font-semibold text-white hover:bg-primary-600"
              >
                Sign in
              </button>
              <Link
                href="/fund/proposals"
                className="inline-flex h-11 flex-[1.4] items-center justify-center rounded-lg border border-gray-300 sm:flex-none bg-white px-5 text-[15px] font-semibold text-gray-700 hover:bg-gray-50"
              >
                Browse proposals
              </Link>
            </>
          }
        />
      }
    >
      <MyFundingEmptyState />
    </PageLayout>
  );
}
