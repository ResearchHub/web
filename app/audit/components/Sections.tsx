import { ArrowRight, CalendarDays, Plus } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Sequence } from '@/app/consciousness/components/Motion';
import { TRACK_RECORD } from '@/app/giving/lib/trackRecord';
import { AUDIT_STEPS, BENEFITS, FAQ, PROBLEMS, SOURCES } from '../data/content';
import { TALK_TO_TEAM, formatUsdShort } from '../data/rfp';
import { BenefitIcon } from './BenefitIcons';
import { Tower } from './Figures';
import { Ref, Section, SectionHead } from './Parts';
import { StepIcon } from './StepIcons';

/* 1. The problem ----------------------------------------------------------- */

/**
 * Why the call exists, readable at a glance: three short statements (each
 * with a bar where there is a share to show, and its figure in small print)
 * beside one picture of why it matters: later work stands on earlier papers.
 */
export function Problem() {
  return (
    <Section labelledBy="problem-title" n={1} label="The problem">
      <SectionHead id="problem-title">
        Much of biomedical research does not hold <em>up.</em>
      </SectionHead>

      <div className="mt-12 grid grid-cols-1 gap-14 content-md:grid-cols-12 content-md:items-center content-md:gap-16">
        <ul className="border-t border-[color:var(--a-ink)] content-md:col-span-7">
          {PROBLEMS.map((p) => (
            <li key={p.title} className="a-reveal border-b border-[color:var(--a-line-2)] py-7">
              <h3 className="a-serif max-w-[16em] text-[26px] leading-[1.12] tablet:text-[32px]">
                {p.title}
              </h3>
              {p.split && (
                <div
                  role="img"
                  aria-label={`${Math.round(p.split.share * 100)}% ${p.split.good.toLowerCase()}; the rest ${p.split.bad.toLowerCase()}`}
                  className="mt-4 max-w-[30rem]"
                >
                  <div className="flex h-3.5 gap-[3px]">
                    <span
                      className="bg-[var(--a-ink)]"
                      style={{ width: `${p.split.share * 100}%` }}
                    />
                    <span className="flex-1 bg-[var(--a-red)]" />
                  </div>
                  <div className="a-mono mt-2 flex justify-between !text-[11px]">
                    <span>{p.split.good}</span>
                    <span className="text-[var(--a-red-deep)]">{p.split.bad}</span>
                  </div>
                </div>
              )}
              <p className="mt-3 text-[13.5px] leading-[1.5] text-[var(--a-mute)]">
                {p.note}
                <Ref to={p.source} />
              </p>
            </li>
          ))}
        </ul>
        <div className="content-md:col-span-5">
          <Tower />
        </div>
      </div>
    </Section>
  );
}

/* 2. The proposal ---------------------------------------------------------- */

/** What the call proposes: the four steps of an audit, in order. */
export function Proposal() {
  return (
    <Section id="proposal" labelledBy="proposal-title" n={2} label="The proposal">
      <SectionHead id="proposal-title">
        Audit the open biomedical literature with <em>AI.</em>
      </SectionHead>

      <ol className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 tablet:grid-cols-4 tablet:gap-x-9">
        {AUDIT_STEPS.map((step, i) => (
          <li key={step.title} className="a-reveal">
            <StepIcon index={i} />
            <div className="relative mt-5 border-t border-[color:var(--a-ink)] pt-4">
              {i < AUDIT_STEPS.length - 1 && (
                <ArrowRight
                  aria-hidden
                  className="absolute -right-6 -top-[9px] hidden h-4 w-4 bg-[var(--a-paper)] text-[var(--a-ink)] tablet:block"
                />
              )}
              <p className="font-[family-name:var(--a-mono)] text-[13px] tabular-nums text-[var(--a-red-deep)]">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="a-serif mt-2 text-[22px] leading-[1.12] tablet:text-[24px]">
                {step.title}
              </h3>
              <p className="mt-2 text-[14.5px] leading-[1.45] text-[var(--a-soft)]">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* 3. The benefits ---------------------------------------------------------- */

/**
 * What the audit is for: four things it makes possible, on the blue of a
 * check. As the section scrolls in, the four arrive one after another and
 * each icon assembles itself (audit.css, `a-bn-*`); without script or with
 * reduced motion they are simply there.
 */
export function Benefits() {
  return (
    <Section labelledBy="benefits-title" n={3} label="The benefits" tone="blue">
      <SectionHead id="benefits-title">
        A new era of rigor in <em>science.</em>
      </SectionHead>
      <Sequence className="mt-14">
        <ul className="grid grid-cols-1 gap-x-10 gap-y-12 mobile:grid-cols-2 content-md:grid-cols-4">
          {BENEFITS.map((b, i) => (
            <li key={b.title} style={{ '--i': i } as React.CSSProperties}>
              <BenefitIcon index={i} />
              <div className="a-bn-text">
                <h3 className="a-serif mt-6 text-[26px] leading-[1.1] tablet:text-[30px]">
                  {b.title}
                </h3>
                <p className="mt-3 max-w-[19em] text-[15.5px] leading-[1.5] text-[rgb(255_255_255/0.84)]">
                  {b.text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Sequence>
    </Section>
  );
}

/* About, talk, FAQ, sources ------------------------------------------------ */

/**
 * Who hosts the call. The description is ResearchHub's own (researchhub.com
 * and /about); the figures are the dated track record the Giving page shows.
 */
export function AboutResearchHub() {
  const stats = [
    { value: formatUsdShort(TRACK_RECORD.contributedUsd), label: 'Contributed since 2024' },
    {
      value: TRACK_RECORD.proposalsFunded.toLocaleString('en-US'),
      label: 'Proposals fully funded',
    },
    { value: TRACK_RECORD.peerReviews.toLocaleString('en-US'), label: 'Peer reviews' },
  ];
  return (
    <Section labelledBy="about-title" className="tablet:py-24">
      <div className="grid grid-cols-1 gap-8 content-md:grid-cols-12 content-md:gap-16">
        <div className="content-md:col-span-5">
          <Logo size={34} />
          <h2 id="about-title" className="a-serif mt-6 text-[clamp(28px,3vw,40px)] leading-tight">
            About ResearchHub
          </h2>
          <p className="mt-1 text-[14px] text-[var(--a-mute)]">Where this call is hosted</p>
        </div>
        <div className="content-md:col-span-7">
          <p className="a-prose">
            ResearchHub is an open science platform where researchers publish, peer review, fund and
            discuss scientific research. Its mission is to accelerate the pace of scientific
            research.
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-x-6 border-t border-[color:var(--a-line-2)] pt-6">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="a-serif text-[30px] leading-none tabular-nums">{s.value}</dd>
                <dd aria-hidden className="mt-2 text-[13px] text-[var(--a-mute)]">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[12.5px] text-[var(--a-mute)]">As of {TRACK_RECORD.asOf}</p>
          <a href="/about" className="a-link group mt-6">
            Read more about ResearchHub
            <ArrowRight
              aria-hidden
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            />
          </a>
        </div>
      </div>
    </Section>
  );
}

/** A way to reach the team: a 15-minute call (Tyler's booking link, as on /give). */
export function TalkToUs() {
  return (
    <Section id="talk-to-us" labelledBy="talk-title" className="tablet:py-24">
      <div className="grid grid-cols-1 gap-8 border border-[color:var(--a-ink)] bg-[var(--a-sheet)] p-7 content-md:grid-cols-12 content-md:items-center content-md:gap-12 tablet:p-12">
        <div className="content-md:col-span-8">
          <h2 id="talk-title" className="a-serif text-[clamp(30px,3.6vw,48px)] leading-[1.06]">
            Talk to us
          </h2>
          <p className="a-prose mt-4 max-w-[33em]">
            Thinking about a larger gift, want to give model credits instead of cash, or have an
            area of biomedicine you think should go first? We would like to hear from you.
          </p>
        </div>
        <div className="flex content-md:col-span-4 content-md:justify-end">
          <a
            href={TALK_TO_TEAM.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="a-btn a-btn-solid h-12 w-full px-6 text-[15px] content-md:w-auto"
          >
            <CalendarDays aria-hidden className="h-4 w-4" strokeWidth={2.2} />
            Book a call
          </a>
        </div>
      </div>
    </Section>
  );
}

export function Faq() {
  return (
    <Section labelledBy="faq-title" className="tablet:py-24">
      <div className="grid grid-cols-1 gap-8 content-md:grid-cols-12 content-md:gap-16">
        <h2
          id="faq-title"
          className="a-serif text-[clamp(32px,4vw,56px)] leading-[1.04] content-md:col-span-4"
        >
          FAQs
        </h2>
        <div className="content-md:col-span-8">
          {FAQ.map((f) => (
            <details
              key={f.q}
              id={f.id}
              className="group scroll-mt-24 border-b border-[color:var(--a-line-2)] first:border-t"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-[family-name:var(--a-serif)] text-[21px] leading-snug hover:text-[var(--a-red-deep)]">
                {f.q}
                <Plus
                  aria-hidden
                  className="a-plus h-5 w-5 shrink-0 text-[var(--a-mute)] transition-transform"
                />
              </summary>
              <p className="max-w-[40em] pb-6 pr-10 text-[15.5px] leading-[1.65] text-[var(--a-soft)]">
                {f.a}
                {f.sources?.map((key) => (
                  <Ref key={key} to={key} />
                ))}
              </p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function Sources() {
  return (
    <Section labelledBy="sources-title" className="!py-16 tablet:!py-20">
      <h2 id="sources-title" className="a-mono text-[var(--a-mute)]">
        Sources
      </h2>
      <ol className="mt-6 grid grid-cols-1 gap-x-12 gap-y-2.5 text-[13px] leading-[1.55] text-[var(--a-mute)] content-md:grid-cols-2">
        {SOURCES.map((s, i) => (
          <li
            key={s.key}
            id={`source-${i + 1}`}
            className="flex scroll-mt-24 gap-3 target:text-[var(--a-ink)]"
          >
            <span className="w-5 shrink-0 font-[family-name:var(--a-mono)] tabular-nums text-[var(--a-red-deep)]">
              {i + 1}
            </span>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--a-ink)]"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ol>
      <p className="mt-8 max-w-[62em] text-[12.5px] leading-[1.6] text-[var(--a-mute)]">
        Figures were checked against these sources on 19 November 2026. The astrophysics audit is
        the work of its author and has not been independently verified; this page reports its claims
        and its stated limits. If we have something wrong, tell us and we will fix it.
      </p>
    </Section>
  );
}

export function AuditFooter() {
  return (
    <footer className="a-rule border-t px-5 py-8 text-[12.5px] text-[var(--a-mute)] tablet:px-10">
      A request for proposals, hosted on ResearchHub.
    </footer>
  );
}
