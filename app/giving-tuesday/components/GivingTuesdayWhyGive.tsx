import type { CSSProperties } from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { formatMoney } from '@/components/Funding/lib/fundingAmounts';
import { cn } from '@/utils/styles';
import { TRACK_RECORD } from '@/app/giving-tuesday/lib/trackRecord';
import { DISPLAY_FONT } from '@/app/giving-tuesday/components/displayFont';
import { BLUE_TEXT } from '@/app/giving-tuesday/components/accents';

const COMPARISONS = [
  { label: 'Time to get funded', traditional: '9+ months', researchHub: 'Weeks' },
  { label: 'Time to peer review', traditional: '3+ months', researchHub: '~2 weeks' },
];

/** The display face, kept to one line so a time like "9+ months" never splits. */
const ONE_LINE: CSSProperties = { ...DISPLAY_FONT, textWrap: 'nowrap' };

const STATS = [
  { label: 'Contributed since 2024', value: formatMoney(TRACK_RECORD.contributedUsd, true) },
  { label: 'Proposals fully funded', value: TRACK_RECORD.proposalsFunded.toLocaleString() },
  { label: 'Peer reviewers', value: TRACK_RECORD.peerReviewers.toLocaleString() },
  { label: 'Peer reviews', value: TRACK_RECORD.peerReviews.toLocaleString() },
];

export function GivingTuesdayWhyGive() {
  return (
    <section className="bg-white px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-[1240px] gap-14 lg:grid-cols-2">
        <div>
          <h2
            className="text-[36px] font-bold leading-[1.08] tracking-[-0.03em] text-[#0b1530] md:text-[52px]"
            style={DISPLAY_FONT}
          >
            Science in the open,{' '}
            <span className={BLUE_TEXT}>funded in weeks instead of years.</span>
          </h2>
          <p className="mt-6 max-w-[520px] text-lg leading-relaxed text-[#4b5563]">
            We’re advocates for open science. Every project shares its plan before the work starts
            and publishes what it finds, and experts are paid to review it in public.
          </p>
        </div>
        <div className="space-y-4">
          {COMPARISONS.map((row) => (
            <div
              key={row.label}
              className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-[0_18px_40px_-20px_rgba(13,30,80,0.15)] sm:p-7"
            >
              <p className="flex items-center gap-2.5 font-semibold text-[#0b1530]">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff4ff] text-[#3971ff]">
                  <Clock className="h-4 w-4" />
                </span>
                {row.label}
              </p>
              <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
                <div className="rounded-2xl bg-[#f8fafc] px-3.5 py-4 ring-1 ring-[#e5e7eb] sm:px-5">
                  <p className="text-[13px] text-[#6b7280]">Traditional</p>
                  <p
                    className="mt-1.5 text-[20px] font-bold leading-none text-[#9ca3af] sm:text-[24px] md:text-[30px]"
                    style={ONE_LINE}
                  >
                    {row.traditional}
                  </p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eff4ff] text-[#3971ff]">
                  <ArrowRight className="h-4 w-4" />
                </span>
                <div className="rounded-2xl bg-[#eff4ff] px-3.5 py-4 ring-1 ring-[#bfdbfe] sm:px-5">
                  <p className="text-[13px] text-[#3971ff]">ResearchHub</p>
                  <p
                    className={cn(
                      'mt-1.5 text-[20px] font-bold leading-none sm:text-[24px] md:text-[30px]',
                      BLUE_TEXT
                    )}
                    style={ONE_LINE}
                  >
                    {row.researchHub}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-16 max-w-[1240px]">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col-reverse items-center justify-end text-center"
            >
              <dt className="mt-2 text-[13px] text-[#4b5563] sm:text-sm">{stat.label}</dt>
              <dd
                className="text-[26px] font-bold leading-none tracking-[-0.03em] text-[#0b1530] sm:text-[36px] md:text-[44px]"
                style={DISPLAY_FONT}
              >
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-center text-xs text-[#9ca3af]">As of {TRACK_RECORD.asOf}</p>
      </div>
    </section>
  );
}
