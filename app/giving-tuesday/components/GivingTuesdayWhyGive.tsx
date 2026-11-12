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

const STATS = [
  { label: 'Contributed since 2024', value: formatMoney(TRACK_RECORD.contributedUsd, true) },
  { label: 'Proposals fully funded', value: TRACK_RECORD.proposalsFunded.toLocaleString() },
  { label: 'Peer reviewers', value: TRACK_RECORD.peerReviewers.toLocaleString() },
  { label: 'Peer reviews', value: TRACK_RECORD.peerReviews.toLocaleString() },
];

export function GivingTuesdayWhyGive() {
  return (
    <section className="px-6 pb-24 md:pb-32">
      <div className="mx-auto grid max-w-[1240px] gap-14 lg:grid-cols-2">
        <div>
          <h2
            className="text-[36px] font-bold leading-[1.08] tracking-[-0.03em] text-white md:text-[52px]"
            style={DISPLAY_FONT}
          >
            Science in the open,{' '}
            <span className="text-[#6b7690]">funded in weeks instead of years.</span>
          </h2>
          <p className="mt-6 max-w-[520px] text-lg leading-relaxed text-[#98a4ba]">
            We’re advocates for open science. Every project shares its plan before the work starts
            and publishes what it finds, and experts are paid to review it in public.
          </p>
        </div>
        <div className="space-y-4">
          {COMPARISONS.map((row) => (
            <div key={row.label} className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
              <p className="flex items-center gap-2.5 font-semibold text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3971ff]/15 text-[#7fb0ff]">
                  <Clock className="h-4 w-4" />
                </span>
                {row.label}
              </p>
              <div className="mt-6 flex items-end gap-5">
                <div className="flex-1">
                  <p className="text-sm text-[#6b7690]">Traditional</p>
                  <p
                    className="mt-1 text-[24px] font-bold leading-none text-[#6b7690] md:text-[28px]"
                    style={DISPLAY_FONT}
                  >
                    {row.traditional}
                  </p>
                </div>
                <ArrowRight className="mb-1 h-5 w-5 shrink-0 text-[#6b7690]" />
                <div className="flex-1">
                  <p className="text-sm text-[#7fb0ff]">ResearchHub</p>
                  <p
                    className={cn(
                      'mt-1 text-[32px] font-bold leading-none md:text-[40px]',
                      BLUE_TEXT
                    )}
                    style={DISPLAY_FONT}
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
            <div key={stat.label} className="flex flex-col-reverse justify-end">
              <dt className="mt-2 text-[13px] text-[#98a4ba] sm:text-sm">{stat.label}</dt>
              <dd
                className="text-[26px] font-bold leading-none tracking-[-0.03em] text-white sm:text-[36px] md:text-[44px]"
                style={DISPLAY_FONT}
              >
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-xs text-[#6b7690]">As of {TRACK_RECORD.asOf}</p>
      </div>
    </section>
  );
}
