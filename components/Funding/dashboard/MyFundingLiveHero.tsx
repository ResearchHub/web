'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Bell, CircleCheck, Coins, DollarSign, Inbox, Star } from 'lucide-react';
import { DISPLAY_FONT, HeadlineAmount } from '@/components/Funding/dashboard/MyFundingHero';
import { cn } from '@/utils/styles';

type Tone = 'blue' | 'green' | 'amber';

interface SampleEvent {
  readonly icon: LucideIcon;
  readonly tone: Tone;
  readonly title: string;
  readonly detail: string;
  readonly when: string;
}

/** Made-up events of each kind the page collects, since nothing is known about the visitor. */
const SAMPLE_EVENTS: readonly SampleEvent[] = [
  {
    icon: Bell,
    tone: 'blue',
    title: 'Week 6: first results are in',
    detail: 'Update from a lab you back',
    when: 'now',
  },
  {
    icon: DollarSign,
    tone: 'green',
    title: '+$500 for your proposal',
    detail: 'A new funder backed you',
    when: '4m',
  },
  {
    icon: Inbox,
    tone: 'blue',
    title: 'A proposal came in for your RFP',
    detail: 'Read it and fund it from here',
    when: '12m',
  },
  {
    icon: Star,
    tone: 'amber',
    title: 'Peer review: rated 4.5',
    detail: 'On a study you fund',
    when: '1h',
  },
  {
    icon: Coins,
    tone: 'green',
    title: 'You earned a $150 review bounty',
    detail: 'Paid for your peer review',
    when: '3h',
  },
  {
    icon: CircleCheck,
    tone: 'green',
    title: 'Fully funded',
    detail: 'A proposal you backed hit its goal',
    when: '1d',
  },
];

const TONE: Record<Tone, string> = {
  blue: 'bg-primary-50 text-primary-500',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
};

/** Faded at both ends, so cards drift in and out rather than being cut off. */
const FEED_MASK = 'linear-gradient(to bottom, transparent 0, #000 18%, #000 78%, transparent 100%)';

interface MyFundingLiveHeroProps {
  readonly actions: ReactNode;
}

/**
 * The hero for someone who has not signed in. With nothing known about them,
 * it shows what the page is for: a feed of the kinds of things that land here
 * once they take part, scrolling past on its own. Under the text on a phone,
 * beside it on a wide screen.
 */
export function MyFundingLiveHero({ actions }: MyFundingLiveHeroProps) {
  return (
    <section
      aria-label="My Funding"
      className="overflow-hidden border-b border-gray-200 bg-gray-50"
    >
      <div className="mx-auto flex max-w-[1012px] flex-col px-4 tablet:!px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="min-w-0 max-w-[470px] pt-6 lg:py-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-emerald-500 motion-reduce:animate-none" />
            Your funding dashboard
          </span>
          <h1
            className="mt-3 text-[31px] font-bold leading-[1.06] tracking-[-0.03em] text-[#0b1530] sm:text-4xl"
            style={DISPLAY_FONT}
          >
            Your corner of science, <HeadlineAmount>live</HeadlineAmount>.
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-gray-600">
            Results from labs you back, funders who back you, proposals for your RFPs and reviews,
            as they happen.
          </p>
          <div className="mt-5 flex gap-2.5">{actions}</div>
        </div>
        <LiveFeed />
      </div>
    </section>
  );
}

function LiveFeed() {
  return (
    <div
      aria-hidden="true"
      className="group relative mt-3.5 h-[236px] flex-shrink-0 overflow-hidden lg:mt-0 lg:h-[330px] lg:w-[440px]"
      style={{ maskImage: FEED_MASK, WebkitMaskImage: FEED_MASK }}
    >
      {/* Two copies, so moving up by half lands back where it started. */}
      <ul className="animate-feed-scroll pt-3.5 group-hover:[animation-play-state:paused] motion-reduce:animate-none lg:pt-0">
        {[...SAMPLE_EVENTS, ...SAMPLE_EVENTS].map((event, index) => (
          <FeedCard key={index} event={event} />
        ))}
      </ul>
    </div>
  );
}

function FeedCard({ event }: { readonly event: SampleEvent }) {
  const Icon = event.icon;
  return (
    <li className="mb-2.5 flex h-[58px] items-center gap-3 rounded-xl bg-white px-3.5 shadow-[0_6px_18px_rgba(11,21,48,0.07)] ring-1 ring-gray-900/5">
      <span
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
          TONE[event.tone]
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-gray-900">
          {event.title}
        </span>
        <span className="block truncate text-xs text-gray-500">{event.detail}</span>
      </span>
      <span className="text-[11px] text-gray-500">{event.when}</span>
    </li>
  );
}
