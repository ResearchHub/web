'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { X } from 'lucide-react';
import AnimatedProposal from '@/components/Proposal/AnimatedProposal';
import { buttonVariants } from '@/components/ui/Button';
import { useDismissableFeature } from '@/hooks/useDismissableFeature';
import { cn } from '@/utils/styles';

const FEATURE_NAME = 'fund_sidebar_intro';

/**
 * AnimatedProposal shrinks via a CSS transform, so its full natural box stays
 * reserved in layout at any scale. In `loop` mode the composition is 320x336
 * (the "Funded" badge only renders in the play-once variant), so at this scale
 * the visual size is the 147x155 the well below is pinned to.
 */
const PROPOSAL_SCALE = 0.46;

/**
 * The mechanism, in order. Review sitting before funding is the part that
 * distinguishes this from general crowdfunding, so it earns its own line.
 */
const STEPS = [
  'Scientists post a funding proposal',
  'Peers review it in the open',
  'Anyone can fund the work',
];

/**
 * Explains what ResearchHub is to first-time visitors, who otherwise land on a
 * feed of activity with no framing. Takes over the sidebar slot that Recently
 * Visited leaves empty before you've opened anything, so it costs no space that
 * was carrying information.
 */
export function FundSidebarIntro() {
  const { status } = useSession();
  const { isDismissed, dismissFeature, dismissStatus } = useDismissableFeature(FEATURE_NAME);

  // `dismissStatus` stays unchecked while auth resolves, so a signed-in user
  // never sees the card flash before it's filtered out.
  if (status === 'authenticated' || dismissStatus !== 'checked' || isDismissed) {
    return null;
  }

  return (
    <aside className="w-full">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          New to ResearchHub
        </p>
        <button
          type="button"
          onClick={dismissFeature}
          aria-label="Dismiss introduction"
          className="-mr-1 shrink-0 rounded p-0.5 text-gray-400 transition-colors hover:text-gray-700"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-2 flex h-[155px] items-center justify-center overflow-hidden rounded-lg border border-primary-100/70 bg-gradient-to-b from-primary-50/70 to-white">
        <AnimatedProposal scale={PROPOSAL_SCALE} loop className="shrink-0" />
      </div>

      <h2 className="mt-3 text-[15px] font-semibold leading-snug tracking-[-0.01em] text-gray-900">
        Fund the research you want to see happen
      </h2>

      <ol className="mt-2.5 space-y-1.5">
        {STEPS.map((step, index) => (
          <li key={step} className="flex items-start gap-2">
            <span
              aria-hidden
              className="mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold text-primary-700"
            >
              {index + 1}
            </span>
            <span className="text-[13px] leading-snug text-gray-600">{step}</span>
          </li>
        ))}
      </ol>

      <Link
        href="/feed-v2/fund/proposals"
        className={cn(buttonVariants({ size: 'md' }), 'mt-3.5 w-full')}
      >
        Browse proposals
      </Link>

      <Link
        href="/about"
        className="mt-2 block text-center text-[12px] font-medium text-gray-500 transition-colors hover:text-gray-800"
      >
        How ResearchHub works
      </Link>
    </aside>
  );
}
