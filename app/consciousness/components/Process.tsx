import { ArrowRight, CalendarDays, Plus } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { TRACK_RECORD } from '@/app/giving-tuesday/lib/trackRecord';
import { FAQ, QUESTIONS, SOURCES } from '../data/content';
import { TALK_TO_TEAM, formatUsdShort, type RfpView } from '../data/rfp';
import { LiveProposals } from './LiveProposals';
import { PoolPanel } from './PoolPanel';
import { AddToPoolButton, SubmitProposalButton } from './OrchActions';
import { Rich } from './Rich';
import { PhotoCredits, Wrap } from './Story';

const H2 = 'o-reveal o-serif text-[clamp(32px,4vw,56px)] leading-[1.06]';

/** The launch-day slots: one dashed row per open question. */
function OpenSlots() {
  return (
    <ul aria-label="Open slots" className="mt-10 space-y-3">
      {QUESTIONS.slice(0, 3).map((q, i) => (
        <li
          key={q.id}
          style={{ opacity: 1 - i * 0.3 }}
          className="flex items-center justify-between gap-4 rounded-[10px] border border-dashed border-[color:var(--o-line-2)] px-5 py-4"
        >
          <p className="min-w-0 truncate text-[16px] text-[var(--o-soft)]">
            Your proposal on {q.name.toLowerCase()}
          </p>
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--o-line-2)] text-[var(--o-mute)]"
          >
            <Plus className="h-4 w-4" />
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Proposals and backers: the RFP's proposals and activity from ResearchHub,
 * or the launch-day slots while it has none (or none is configured), beside
 * the funding pool.
 */
export function Proposals({ rfp }: { rfp: RfpView }) {
  const { grantId, rfpHref } = rfp;
  return (
    <section aria-labelledby="proposals-title" className="o-rule border-t py-24 tablet:py-32">
      <Wrap>
        <div className="grid grid-cols-1 gap-14 content-md:grid-cols-12 content-md:gap-16">
          <div className="content-md:col-span-7">
            {grantId != null && rfpHref ? (
              <LiveProposals grantId={grantId} rfpHref={rfpHref} empty={<OpenSlots />} />
            ) : (
              <>
                <h2 id="proposals-title" className={`${H2} max-w-[12em]`}>
                  No proposals yet. <em>The first one sets the bar.</em>
                </h2>
                <OpenSlots />
              </>
            )}
            <div className="mt-8">
              <SubmitProposalButton />
            </div>
          </div>

          <PoolPanel rfp={rfp} />
        </div>
      </Wrap>
    </section>
  );
}

/**
 * Who hosts the call, in the slot the funder section used to fill. The
 * description and mission are ResearchHub's own words (researchhub.com
 * and /about); the figures are the dated track record the Giving Tuesday
 * page shows (`app/giving-tuesday/lib/trackRecord.ts`).
 */
export function AboutResearchHub() {
  const stats = [
    { value: formatUsdShort(TRACK_RECORD.contributedUsd), label: 'Contributed since 2024' },
    {
      value: TRACK_RECORD.proposalsFunded.toLocaleString('en-US'),
      label: 'Proposals fully funded',
    },
    { value: TRACK_RECORD.peerReviewers.toLocaleString('en-US'), label: 'Peer reviewers' },
    { value: TRACK_RECORD.peerReviews.toLocaleString('en-US'), label: 'Peer reviews' },
  ];
  return (
    <section aria-labelledby="about-title" className="o-rule border-t py-20 tablet:py-28">
      <Wrap>
        <div className="grid grid-cols-1 gap-8 content-md:grid-cols-12 content-md:gap-16">
          <div className="content-md:col-span-5">
            <Logo size={34} />
            <h2 id="about-title" className="o-serif mt-6 text-[clamp(28px,3vw,40px)] leading-tight">
              About ResearchHub
            </h2>
            <p className="mt-1 text-[14px] text-[var(--o-mute)]">Where this call is hosted</p>
          </div>
          <div className="content-md:col-span-7">
            <p className="o-prose">
              ResearchHub is an open science platform where researchers publish, peer review, fund
              and discuss scientific research. Its mission is to accelerate the pace of scientific
              research.
            </p>
            <p className="o-prose mt-4">
              It is built for reproducible science: researchers publicly register their study design
              before they start, locking in their methods, and publish openly, with no paywalls.
            </p>
            <dl className="o-rule mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t pt-6 tablet:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="o-serif text-[28px] leading-none tabular-nums">{s.value}</dd>
                  <dd aria-hidden className="mt-2 text-[13px] text-[var(--o-mute)]">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[12.5px] text-[var(--o-mute)]">As of {TRACK_RECORD.asOf}</p>
            <a
              href="/about"
              className="group mt-6 inline-flex items-center gap-2 text-[15px] font-medium text-[var(--o-gold)] hover:text-[var(--o-text)]"
            >
              Read more about ResearchHub
              <ArrowRight
                aria-hidden
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </div>
      </Wrap>
    </section>
  );
}

/**
 * A way to reach the team: for larger gifts, questions about how the money
 * is used, or a lab that could run one of the experiments. A 15-minute call
 * (Tyler's booking link, as on /give).
 */
export function TalkToUs() {
  return (
    <section
      id="talk-to-us"
      aria-labelledby="talk-title"
      className="o-rule scroll-mt-10 border-t py-20 tablet:py-28"
    >
      <Wrap>
        <div className="grid grid-cols-1 gap-8 rounded-[24px] bg-[var(--o-ink2)] p-7 ring-1 ring-[color:var(--o-line)] content-md:grid-cols-12 content-md:items-center content-md:gap-12 tablet:p-12">
          <div className="content-md:col-span-7">
            <h2 id="talk-title" className={`${H2} max-w-[12em]`}>
              Talk to us
            </h2>
            <p className="o-prose mt-5 max-w-[34em]">
              Thinking about a larger gift, want to know exactly how the money will be used, or run
              a lab that could take on one of these experiments? We would like to hear from you.
            </p>
          </div>
          <div className="flex flex-col gap-3 content-md:col-span-5 content-md:items-end">
            <a
              href={TALK_TO_TEAM.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="o-btn o-btn-gold h-12 w-full px-6 text-[15px] content-md:w-auto"
            >
              <CalendarDays aria-hidden className="h-4 w-4" strokeWidth={2.2} />
              Book a call
            </a>
          </div>
        </div>
      </Wrap>
    </section>
  );
}

export function Faq() {
  return (
    <section aria-labelledby="faq-title" className="o-rule border-t py-20 tablet:py-28">
      <Wrap>
        <div className="grid grid-cols-1 gap-8 content-md:grid-cols-12 content-md:gap-16">
          <h2 id="faq-title" className={`${H2} content-md:col-span-4`}>
            FAQs
          </h2>
          <div className="content-md:col-span-8">
            {FAQ.map((f) => (
              <details key={f.q} className="o-rule group border-b first:border-t">
                <summary className="flex cursor-pointer items-center justify-between gap-6 py-5 text-[18px] leading-snug hover:text-[var(--o-gold)]">
                  {f.q}
                  <Plus
                    aria-hidden
                    className="o-plus h-5 w-5 shrink-0 text-[var(--o-mute)] transition-transform"
                  />
                </summary>
                <p className="pb-6 pr-10 text-[15px] leading-[1.65] text-[var(--o-soft)]">
                  <Rich>{f.a}</Rich>
                </p>
              </details>
            ))}
          </div>
        </div>
      </Wrap>
    </section>
  );
}

export function Sources() {
  return (
    <section aria-labelledby="sources-title" className="o-rule border-t py-16 tablet:py-20">
      <Wrap>
        <h2 id="sources-title" className="o-serif text-[24px]">
          Sources
        </h2>
        <ol className="mt-6 grid grid-cols-1 gap-x-12 gap-y-2.5 text-[13px] leading-[1.55] text-[var(--o-mute)] content-md:grid-cols-2">
          {SOURCES.map((s) => (
            <li key={s.id} id={`source-${s.id}`} className="flex scroll-mt-24 gap-3">
              <span className="w-5 shrink-0 tabular-nums opacity-60">{s.id}</span>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--o-text)]"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ol>
        <PhotoCredits />
      </Wrap>
    </section>
  );
}

export function OrchFooter() {
  return (
    <footer className="o-rule border-t px-5 py-8 text-[12.5px] text-[var(--o-mute)] tablet:px-10">
      A request for proposals, hosted on ResearchHub.
    </footer>
  );
}
