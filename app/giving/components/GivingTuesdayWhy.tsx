import type { ReactNode } from 'react';
import { cn } from '@/utils/styles';
import { TRACK_RECORD } from '@/app/giving/lib/trackRecord';
import { DISPLAY_FONT } from '@/app/giving/components/displayFont';
import { BLUE_TEXT } from '@/app/giving/components/accents';
import { FastArt, NetworkArt, RacingBars, TogetherArt } from '@/app/giving/components/WhyArt';

export function GivingTuesdayWhy() {
  return (
    <section
      id="why"
      className="scroll-mt-4 bg-gradient-to-b from-white to-[#f3f6ff] px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1240px]">
        <div className="text-center">
          <h2
            className="text-[40px] font-bold leading-[1.04] tracking-[-0.03em] text-[#0b1530] md:text-[60px]"
            style={DISPLAY_FONT}
          >
            Why <span className={BLUE_TEXT}>ResearchHub</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[600px] text-lg leading-relaxed text-[#4b5563]">
            We move fast, we work with the best people in science, and we use AI so they can spend
            their time on what matters.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <WhyCard
            art={<FastArt />}
            artBackground="#E4E8FF"
            kicker="Fast"
            kickerClassName="text-[#4C5BD4]"
            big="Weeks"
            bigClassName={BLUE_TEXT}
            title="to get funded, and about 2 weeks to peer review"
          >
            <div className="mt-auto pt-2">
              <RacingBars />
            </div>
          </WhyCard>

          <WhyCard
            art={<NetworkArt />}
            artBackground="#DDF6F0"
            kicker="The best network"
            kickerClassName="text-[#1f8a6f]"
            big={TRACK_RECORD.peerReviews.toLocaleString('en-US')}
            title="peer reviews from qualified scientists"
          >
            <p className="text-[15px] leading-relaxed text-[#4b5563]">
              Each proposal is reviewed by scientists who know the field, from leading universities
              and labs.
            </p>
            <p className="mt-auto text-xs text-[#6b7280]">As of {TRACK_RECORD.asOf}</p>
          </WhyCard>

          <WhyCard
            art={<TogetherArt />}
            artBackground="#F1E6FF"
            kicker="AI and experts"
            kickerClassName="text-[#7a45d6]"
            big="Together"
            title="AI flags what to look at. Experts make the call."
          >
            <p className="text-[15px] leading-relaxed text-[#4b5563]">
              They work on the same proposal side by side, so reviewers spend their time on the
              science and good research is funded sooner.
            </p>
          </WhyCard>
        </div>
      </div>
    </section>
  );
}

function WhyCard({
  art,
  artBackground,
  kicker,
  kickerClassName,
  big,
  bigClassName = 'text-[#0b1530]',
  title,
  children,
}: {
  art: ReactNode;
  artBackground: string;
  kicker: string;
  kickerClassName: string;
  big: string;
  bigClassName?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[28px] border border-[#e6ebf5] bg-white shadow-[0_24px_50px_-30px_rgba(13,30,80,0.3)]">
      <div className="h-[260px] flex-none lg:h-[290px]" style={{ background: artBackground }}>
        {art}
      </div>
      <div className="flex flex-1 flex-col gap-3 px-7 pb-7 pt-7">
        <span className={cn('text-xs font-bold uppercase tracking-[0.1em]', kickerClassName)}>
          {kicker}
        </span>
        <span
          className={cn('text-[52px] leading-none tracking-[-0.02em]', bigClassName)}
          style={DISPLAY_FONT}
        >
          {big}
        </span>
        <h3 className="text-xl font-bold text-[#0b1530]">{title}</h3>
        {children}
      </div>
    </article>
  );
}
