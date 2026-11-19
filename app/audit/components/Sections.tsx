import { ArrowRight, ArrowUpRight, CalendarDays, Plus } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { TRACK_RECORD } from '@/app/giving/lib/trackRecord';
import { cn } from '@/utils/styles';
import {
  COST_FACTS,
  FAQ,
  LIMITS,
  MODEL_COSTS,
  OUTCOMES,
  QUOTE,
  RULES,
  SCALE_FACTS,
  SOURCES,
  TRACKS,
  US_RND_USD_BILLION,
  type Fact as FactItem,
} from '../data/content';
import {
  CAMPAIGN,
  TALK_TO_TEAM,
  daysLeft,
  deadlineLabel,
  formatDate,
  formatUsd,
  formatUsdShort,
  poolPercent,
  type RfpView,
} from '../data/rfp';
import { AddToPoolButton, ProposeLink, SubmitProposalButton } from './Actions';
import { Funnel, Spread } from './Figures';
import { OutcomeIcon } from './OutcomeIcons';
import { BackerFaces, PoolBar } from './Pool';
import { Ref, Section, SectionHead, Wrap } from './Parts';

/* 1. Where this started ----------------------------------------------------- */

/**
 * What prompted the call: a post, quoted, then the audit it describes as a
 * funnel (what went in, what came out, how little of it anyone had
 * noticed).
 */
export function Finding() {
  return (
    <Section labelledBy="finding-title" n={1} label="Where this started">
      <SectionHead id="finding-title">
        An AI audit of astrophysics reported <em>872 errors.</em>
      </SectionHead>
      <div className="mt-10 grid grid-cols-1 gap-12 content-md:grid-cols-12 content-md:gap-16">
        <div className="content-md:col-span-5">
          <div className="content-md:sticky content-md:top-16">
            <p className="a-prose">
              This call was prompted by a post. On 17 November 2026 the physicist Casey Handmer
              wrote on X that he had directed Claude Opus 5.5 to audit his old field, theoretical
              astrophysics, and published the results.
              <Ref n={4} />
            </p>

            <figure className="a-reveal mt-8 border-l-2 border-[color:var(--a-red)] bg-[var(--a-sheet)] px-6 py-6 tablet:px-7">
              <blockquote className="a-serif text-[25px] leading-[1.18] tablet:text-[29px]">
                “{QUOTE.text}”
              </blockquote>
              <figcaption className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-[14px]">
                <span>
                  <span className="font-semibold">{QUOTE.author}</span>{' '}
                  <span className="text-[var(--a-mute)]">{QUOTE.where}</span>
                </span>
                <a href={QUOTE.url} target="_blank" rel="noopener noreferrer" className="a-link">
                  Read the post
                  <ArrowUpRight aria-hidden className="h-4 w-4" />
                </a>
              </figcaption>
            </figure>

            <p className="a-prose mt-8">
              The post rounds up. The audit’s published pages count 872 errors, 92 of them graded
              major, and this page uses those figures.
              <Ref n={1} />
              <Ref n={3} /> Models mapped the literature around one research group, read every paper
              they could, and re-derived the equations in the most cited ones.
              <Ref n={2} />
            </p>
          </div>
        </div>

        <div className="content-md:col-span-7">
          <Funnel />
        </div>
      </div>
    </Section>
  );
}

/* 2. Why errors survive --------------------------------------------------- */

/**
 * What happened to the audit's errors after publication: how many later
 * papers repeated one against how many objected, as one large ratio.
 */
export function Evidence() {
  return (
    <Section labelledBy="evidence-title" n={2} label="Why it persists">
      <SectionHead id="evidence-title">
        Errors outlive their <em>corrections.</em>
      </SectionHead>
      <p className="a-prose mt-8 max-w-[34em]">
        In the audit, peer review removed about one error in five before publication. Of the errors
        that later papers picked up, over half were still being copied seven years on.
        <Ref n={1} />
      </p>
      <Spread />
    </Section>
  );
}

/* 3. The opportunity ------------------------------------------------------ */

/** Facts in a ruled list: the figure, then what it is. */
function FactRows({ facts, className }: { facts: FactItem[]; className?: string }) {
  return (
    <dl className={cn('border-t border-[color:var(--a-line-2)]', className)}>
      {facts.map((f) => (
        <div
          key={f.value}
          className="grid grid-cols-[6.75rem_minmax(0,1fr)] items-baseline gap-x-5 border-b border-[color:var(--a-line)] py-3"
        >
          <dd className="a-serif text-[20px] leading-none tabular-nums">{f.value}</dd>
          <dt className="text-[14px] leading-[1.45] text-[var(--a-soft)]">
            {f.text}
            {f.source != null && <Ref n={f.source} />}
          </dt>
        </div>
      ))}
    </dl>
  );
}

/** Facts side by side: a figure over its line. */
function FactColumns({ facts }: { facts: FactItem[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-10 gap-y-5 tablet:grid-cols-3">
      {facts.map((f) => (
        <div key={f.value} className="border-t border-[color:var(--a-line-2)] pt-3">
          <dd className="a-serif !whitespace-nowrap text-[26px] leading-none tabular-nums">
            {f.value}
          </dd>
          <dt className="mt-2 max-w-[24em] text-[14px] leading-[1.45] text-[var(--a-soft)]">
            {f.text}
            {f.source != null && <Ref n={f.source} />}
          </dt>
        </div>
      ))}
    </dl>
  );
}

function CostChart() {
  const max = Math.max(...MODEL_COSTS.map((m) => m.usdMillion));
  return (
    <figure>
      <figcaption className="a-mono text-[var(--a-mute)]">By model, US$ million</figcaption>
      <ul className="mt-4 space-y-2">
        {MODEL_COSTS.map((m) => (
          <li
            key={m.model}
            className="grid grid-cols-[9rem_minmax(0,1fr)] items-center gap-3 text-[13.5px] tablet:grid-cols-[10rem_minmax(0,1fr)]"
          >
            <span className="truncate text-[var(--a-soft)]">
              {m.model}
              {m.note && <span aria-hidden>*</span>}
            </span>
            <span className="flex items-center gap-2.5">
              <span
                className="a-grow block h-3 bg-[var(--a-ink)]"
                style={{ width: `${(m.usdMillion / max) * 86}%` }}
              />
              <span className="font-[family-name:var(--a-mono)] text-[12.5px] tabular-nums">
                {m.usdMillion.toFixed(1)}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[12.5px] leading-[1.55] text-[var(--a-mute)]">
        Batch pricing, November 2026. *Promotional rate. Model costs only. Redrawn from Rust’s
        estimate.
        <Ref n={6} />
      </p>
    </figure>
  );
}

/** A year of US research spending and the review, on one scale. */
function ToScale() {
  return (
    <figure>
      <p className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[14px] text-[var(--a-soft)]">
        <span>
          US spending on research and development, 2024 (estimate)
          <Ref n={7} />
        </span>
        <span className="a-serif text-[22px] leading-none tabular-nums text-[var(--a-ink)]">
          ${US_RND_USD_BILLION} billion
        </span>
      </p>
      <div className="a-grow mt-2.5 h-6 bg-[var(--a-ink)]" />
      <p className="mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-l border-[color:var(--a-red)] pl-3 text-[14px] text-[var(--a-soft)]">
        <span className="a-serif text-[22px] leading-none tabular-nums text-[var(--a-red-deep)]">
          $6 million
        </span>
        <span>
          The upper estimate, on the same scale. The red line is drawn over a hundred times too
          wide.
        </span>
      </p>
    </figure>
  );
}

/**
 * What finding the errors could change, then what it would cost: the
 * outcomes first (each with the fact it rests on), then one compact block
 * with the estimate by model and the scale it sits against.
 */
export function Arithmetic() {
  return (
    <Section labelledBy="cost-title" n={3} label="The opportunity">
      <SectionHead id="cost-title">
        What science gains when its errors are <em>found.</em>
      </SectionHead>

      <ol className="mt-12 border-t border-[color:var(--a-ink)]">
        {OUTCOMES.map((o, i) => (
          <li
            key={o.title}
            className="a-reveal grid grid-cols-1 gap-x-16 gap-y-4 border-b border-[color:var(--a-line-2)] py-8 content-md:grid-cols-12 tablet:py-10"
          >
            <div className="flex items-start gap-5 content-md:col-span-6 tablet:gap-8">
              <OutcomeIcon index={i} />
              <div>
                <p className="font-[family-name:var(--a-mono)] text-[13px] tabular-nums text-[var(--a-red-deep)]">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="a-serif mt-2 text-[26px] leading-[1.1] tablet:text-[36px]">
                  {o.title}
                </h3>
              </div>
            </div>
            <p className="max-w-[33em] text-[16.5px] leading-[1.6] text-[var(--a-soft)] content-md:col-span-6 content-md:pt-2">
              {o.text}
              {o.sources.map((n) => (
                <Ref key={n} n={n} />
              ))}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-16">
        <p className="a-mono text-[var(--a-red-deep)]">What it costs</p>
        <p className="a-serif mt-4 max-w-[22em] text-[24px] leading-[1.15] tablet:text-[28px]">
          And it costs a rounding error on what science already spends.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-10 content-md:grid-cols-12 content-md:gap-16">
          <div className="content-md:col-span-6">
            <p className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <span className="a-serif !whitespace-nowrap text-[44px] leading-none tabular-nums tablet:text-[52px]">
                $0.6–6M
              </span>
              <span className="max-w-[22em] text-[14.5px] leading-[1.45] text-[var(--a-soft)]">
                Estimated model cost to review 3 million open-access papers with AI. The range is
                the choice of model.
                <Ref n={6} />
              </span>
            </p>
            <FactRows facts={COST_FACTS} className="mt-6" />
          </div>
          <div className="content-md:col-span-6">
            <CostChart />
          </div>
        </div>
        <div className="mt-10">
          <ToScale />
        </div>
        <div className="mt-8">
          <FactColumns facts={SCALE_FACTS} />
        </div>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 border-t border-[color:var(--a-ink)] pt-8 content-md:grid-cols-12 content-md:gap-16">
        <p className="a-serif text-[26px] leading-[1.15] content-md:col-span-5 tablet:text-[32px]">
          What tokens do not buy is the checking.
        </p>
        <p className="max-w-[34em] text-[17px] leading-[1.55] text-[var(--a-soft)] content-md:col-span-7">
          The Black Spatula Project ran AI checks on about 500 papers and has said its main
          constraint is finding experts to verify what was flagged.
          <Ref n={13} /> The pool pays for that: the people, the method, and getting corrections
          into the record.
        </p>
      </div>
    </Section>
  );
}

/* 4. The call ------------------------------------------------------------- */

export function Call({ rfp }: { rfp: RfpView }) {
  return (
    <Section labelledBy="call-title" n={4} label="The call">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
        <SectionHead id="call-title">
          What the pool <em>funds.</em>
        </SectionHead>
        <p className="max-w-[24em] text-[15px] leading-[1.6] text-[var(--a-soft)]">
          Four kinds of work, funded on equal terms. Awards of {rfp.awardRangeLabel}, sized to the
          job.
        </p>
      </div>
      <ol className="mt-14 border-t border-[color:var(--a-ink)]">
        {TRACKS.map((t, i) => (
          <li
            key={t.id}
            className="a-reveal grid grid-cols-1 gap-x-12 gap-y-5 border-b border-[color:var(--a-line-2)] py-9 content-md:grid-cols-12 tablet:py-11"
          >
            <div className="content-md:col-span-4">
              <p className="a-mono text-[var(--a-red-deep)]">Track {i + 1}</p>
              <h3 className="a-serif mt-3 text-[30px] leading-[1.08] tablet:text-[36px]">
                {t.name}
              </h3>
            </div>
            <div className="content-md:col-span-5">
              <p className="a-serif text-[21px] leading-snug">{t.lead}</p>
              <p className="mt-3 text-[15.5px] leading-[1.62] text-[var(--a-soft)]">{t.body}</p>
            </div>
            <div className="content-md:col-span-3">
              <p className="a-mono text-[var(--a-mute)]">We look for</p>
              <ul className="mt-3 space-y-2.5 text-[14px] leading-[1.45] text-[var(--a-soft)]">
                {t.asks.map((a) => (
                  <li key={a} className="flex gap-2.5">
                    <svg
                      aria-hidden
                      viewBox="0 0 16 16"
                      className="mt-[3px] h-3.5 w-3.5 shrink-0"
                      fill="none"
                      stroke="var(--a-red)"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2.5 8.5 6.5 12.5 13.5 3.5" />
                    </svg>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-10">
        <ProposeLink label="Start a proposal" />
      </div>
    </Section>
  );
}

/* 5. Ground rules --------------------------------------------------------- */

export function Rules() {
  return (
    <Section labelledBy="rules-title" n={5} label="Ground rules" tone="dark">
      <div className="mt-2 grid grid-cols-1 gap-14 content-md:grid-cols-12 content-md:gap-16">
        <div className="content-md:col-span-5">
          <h2
            id="rules-title"
            className="a-reveal a-serif text-[clamp(36px,4.6vw,64px)] leading-[1.02]"
          >
            “A flag is not a <em>finding.”</em>
          </h2>
          <p className="mt-4 text-[14px] text-[rgb(253_252_248/0.6)]">
            The astrophysics audit’s own rule
            <Ref n={1} />, and this call’s.
          </p>
        </div>

        <ol className="content-md:col-span-7">
          {RULES.map((r, i) => (
            <li
              key={r.title}
              className="a-reveal grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 border-t border-[rgb(253_252_248/0.2)] py-6 last:border-b"
            >
              <span className="font-[family-name:var(--a-mono)] text-[13px] tabular-nums text-[#ff8a73]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="a-serif text-[23px] leading-tight tablet:text-[26px]">{r.title}</h3>
                <p className="mt-2 max-w-[34em] text-[15px] leading-[1.6] text-[rgb(253_252_248/0.72)]">
                  {r.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-20">
        <p className="a-mono text-[rgb(253_252_248/0.6)]">How good are the machines, so far</p>
        <ul className="mt-6 grid grid-cols-1 gap-x-10 gap-y-8 border-t border-[rgb(253_252_248/0.2)] pt-8 tablet:grid-cols-2 content-md:grid-cols-4">
          {LIMITS.map((l) => (
            <li key={l.value}>
              <p className="a-serif text-[40px] leading-none tabular-nums">{l.value}</p>
              <p className="mt-3 text-[14px] leading-[1.55] text-[rgb(253_252_248/0.72)]">
                {l.text}
                <Ref n={l.source} />
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-[44em] text-[14px] leading-[1.6] text-[rgb(253_252_248/0.6)]">
          These tests differ in models, fields and what counts as an error, so they do not rank one
          another. Together they say the same thing: results vary widely, and nobody has yet
          measured precision for a whole-field audit with human experts. Track 2 pays for that.
        </p>
      </div>
    </Section>
  );
}

/* 6. How the pool works ---------------------------------------------------- */

const STEPS = [
  {
    title: 'You add to the pool',
    text: 'Any amount, pooled with every other backer.',
  },
  {
    title: 'Researchers submit proposals',
    text: 'Teams post their corpus, method and budget, and how they will confirm what they find.',
  },
  {
    title: 'Peers review, the pool pays',
    text: 'Open review on ResearchHub. The strongest get funded.',
  },
  {
    title: 'Results are published',
    text: 'Findings, data and code go public, including what did not hold up.',
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" labelledBy="how-title" n={6} label="Our process">
      <SectionHead id="how-title" className="!text-[clamp(28px,3.2vw,44px)]">
        How the pool works
      </SectionHead>
      <ol className="mt-12 grid grid-cols-1 gap-y-8 tablet:grid-cols-4 tablet:gap-x-8">
        {STEPS.map((s, i) => (
          <li key={s.title} className="a-reveal relative border-t border-[color:var(--a-ink)] pt-5">
            {i < STEPS.length - 1 && (
              <ArrowRight
                aria-hidden
                className="absolute -right-6 -top-[9px] hidden h-4 w-4 bg-[var(--a-paper)] text-[var(--a-ink)] tablet:block"
              />
            )}
            <p className="font-[family-name:var(--a-mono)] text-[13px] tabular-nums text-[var(--a-red-deep)]">
              {String(i + 1).padStart(2, '0')}
            </p>
            <h3 className="a-serif mt-3 text-[24px] leading-[1.12]">{s.title}</h3>
            <p className="mt-2.5 text-[14.5px] leading-[1.55] text-[var(--a-soft)]">{s.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* 7. Where it stands ------------------------------------------------------- */

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-3 py-3 text-[14.5px] leading-[1.5] tablet:grid-cols-[10rem_minmax(0,1fr)]">
      <dt className="text-[var(--a-mute)]">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/**
 * The programme's state: Phase 1 raises the pool (target, date, progress and
 * what a donor checks), Phase 2 funds and runs the audits. The pool's
 * backers and the way to the RFP's own page sit beside them.
 */
export function Standing({ rfp }: { rfp: RfpView }) {
  const left = daysLeft(rfp.goalBy);
  const more = rfp.backerCount - rfp.backers.length;
  return (
    <Section id="phases" labelledBy="phases-title" n={7} label="Where it stands">
      <SectionHead id="phases-title" className="!text-[clamp(28px,3.2vw,44px)]">
        Two phases
      </SectionHead>
      <div className="mt-12 grid grid-cols-1 gap-6 content-md:grid-cols-2">
        <article
          aria-labelledby="phase-1-title"
          className="a-reveal border border-[color:var(--a-ink)] bg-[var(--a-sheet)] p-6 tablet:p-8"
        >
          <p className="flex items-center gap-3">
            <span className="a-mono text-[var(--a-ink)]">Phase 1</span>
            <span className="bg-[var(--a-red)] px-2 py-0.5 text-[12px] font-semibold text-white">
              Now
            </span>
          </p>
          <h3
            id="phase-1-title"
            className="a-serif mt-4 text-[28px] leading-[1.12] tablet:text-[32px]"
          >
            Raise {formatUsd(rfp.goalUsd)} by {formatDate(rfp.goalBy)}
          </h3>
          <p className="mt-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span>
              <span className="a-serif text-[30px] leading-none tabular-nums">
                {formatUsd(rfp.raisedUsd)}
              </span>{' '}
              <span className="text-[14px] text-[var(--a-mute)]">raised</span>
            </span>
            <span className="text-[14px] tabular-nums text-[var(--a-soft)]">
              {Math.round(poolPercent(rfp))}% · {rfp.backerCount}{' '}
              {rfp.backerCount === 1 ? 'backer' : 'backers'} · {left} {left === 1 ? 'day' : 'days'}{' '}
              left
            </span>
          </p>
          <PoolBar rfp={rfp} className="mt-3" />
          <dl className="mt-6 divide-y divide-[color:var(--a-line)] border-t border-[color:var(--a-line)]">
            <Fact label="Where it goes">Only to work funded under this call.</Fact>
            <Fact label="If it falls short">
              Everything raised still funds audits under this call; we fund fewer of them.
            </Fact>
            {CAMPAIGN.taxDeductibleNote && (
              <Fact label="Tax receipts">{CAMPAIGN.taxDeductibleNote}</Fact>
            )}
          </dl>
          <div className="mt-7">
            <AddToPoolButton size="lg" className="w-full" />
          </div>
        </article>

        <article
          aria-labelledby="phase-2-title"
          className="a-reveal border border-[color:var(--a-line-2)] p-6 tablet:p-8"
        >
          <p className="flex items-center gap-3">
            <span className="a-mono text-[var(--a-ink)]">Phase 2</span>
            <span className="px-2 py-0.5 text-[12px] font-semibold text-[var(--a-mute)] ring-1 ring-inset ring-[color:var(--a-line-2)]">
              Next
            </span>
          </p>
          <h3
            id="phase-2-title"
            className="a-serif mt-4 text-[28px] leading-[1.12] tablet:text-[32px]"
          >
            Pick proposals, run the audits
          </h3>
          <p className="mt-6 text-[15px] leading-[1.6] text-[var(--a-soft)]">
            Reviewers score the proposals in the open. The pool funds the strongest, and what they
            find is published.
          </p>
          <dl className="mt-6 divide-y divide-[color:var(--a-line)] border-t border-[color:var(--a-line)]">
            <Fact label="Proposals">
              {deadlineLabel(rfp)}
              {rfp.proposalCount > 0 && ` · ${rfp.proposalCount} so far`}
            </Fact>
            <Fact label="Review">In the open on ResearchHub, by peer reviewers</Fact>
            <Fact label="Awards">{rfp.awardRangeLabel} each</Fact>
          </dl>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
            <SubmitProposalButton size="lg" />
            {rfp.rfpHref && (
              <Link href={rfp.rfpHref} className="a-link">
                View the RFP and its proposals
                <ArrowUpRight aria-hidden className="h-4 w-4" />
              </Link>
            )}
          </div>
        </article>
      </div>

      {rfp.backers.length > 0 && (
        <div className="mt-10 border-t border-[color:var(--a-line-2)] pt-6">
          <p className="a-mono text-[var(--a-mute)]">Top backers</p>
          <ul className="mt-4 grid grid-cols-1 gap-x-10 gap-y-3 tablet:grid-cols-2 content-md:grid-cols-3">
            {rfp.backers.map((b) => (
              <li key={b.id} className="flex items-center gap-3 text-[15px]">
                <Avatar src={b.avatarUrl} alt={b.name} size={30} authorId={b.authorId} />
                <span className="min-w-0 flex-1 truncate">{b.name}</span>
                <span className="tabular-nums text-[var(--a-soft)]">{formatUsd(b.amountUsd)}</span>
              </li>
            ))}
          </ul>
          {more > 0 && (
            <p className="mt-3 text-[13.5px] text-[var(--a-mute)]">
              and {more} more {more === 1 ? 'backer' : 'backers'}
            </p>
          )}
        </div>
      )}
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
          <p className="a-prose mt-4">
            It is built for work that can be checked: study designs are registered in public before
            the work starts, review happens in the open, and results are published with no paywall.
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
            Thinking about a larger gift, want to sponsor model time, or have a field you think
            should go first? We would like to hear from you.
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
              className="group border-b border-[color:var(--a-line-2)] first:border-t"
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
        {SOURCES.map((s) => (
          <li
            key={s.id}
            id={`source-${s.id}`}
            className="flex scroll-mt-24 gap-3 target:text-[var(--a-ink)]"
          >
            <span className="w-5 shrink-0 font-[family-name:var(--a-mono)] tabular-nums text-[var(--a-red-deep)]">
              {s.id}
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
        Figures were checked against these sources on 18 November 2026. The astrophysics audit is
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
