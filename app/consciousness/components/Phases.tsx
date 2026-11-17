import { cn } from '@/utils/styles';
import { ORCH_OR_RFP, formatDate, formatUsd, poolPercent, type OrchOrRfp } from '../data/mockRfp';
import { PoolBar, daysLeft } from './PoolPanel';
import { Wrap } from './Story';

/** A fact a donor would check: a short label and its answer. */
function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-3 py-3 text-[14.5px] leading-[1.5] tablet:grid-cols-[10rem_minmax(0,1fr)]">
      <dt className="text-[var(--o-mute)]">{label}</dt>
      <dd className="text-[var(--o-text)]">{children}</dd>
    </div>
  );
}

/** Marks an answer the team still has to give. */
function Placeholder({ children }: { children: React.ReactNode }) {
  return <span className="text-[var(--o-mute)]">[Placeholder] {children}</span>;
}

function PhaseCard({
  n,
  status,
  title,
  children,
}: {
  n: number;
  status: 'now' | 'next';
  title: string;
  children: React.ReactNode;
}) {
  const now = status === 'now';
  return (
    <article
      aria-labelledby={`phase-${n}-title`}
      className={cn(
        'o-reveal relative flex flex-col rounded-[20px] p-6 tablet:p-8',
        now
          ? 'bg-[var(--o-ink2)] ring-1 ring-[color:rgb(var(--o-gold-rgb)/0.35)]'
          : 'ring-1 ring-[color:var(--o-line-2)]'
      )}
    >
      <p className="flex items-center gap-3 text-[13px]">
        <span className="font-semibold uppercase tracking-[0.12em] text-[var(--o-text)]">
          Phase {n}
        </span>
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-[12px] font-semibold',
            now
              ? 'bg-[var(--o-gold)] text-[var(--o-onGold)]'
              : 'text-[var(--o-mute)] ring-1 ring-inset ring-[color:var(--o-line-2)]'
          )}
        >
          {now ? 'Now' : 'Next'}
        </span>
      </p>
      <h3
        id={`phase-${n}-title`}
        className="o-serif mt-4 max-w-[16em] text-[26px] leading-[1.15] tablet:text-[30px]"
      >
        {title}
      </h3>
      {children}
    </article>
  );
}

function PhaseOne({ rfp }: { rfp: OrchOrRfp }) {
  const { pool } = rfp;
  const left = daysLeft(pool.goalBy);
  return (
    <PhaseCard
      n={1}
      status="now"
      title={`Raise ${formatUsd(pool.goalUsd)} by ${formatDate(pool.goalBy)}`}
    >
      <div className="mt-6">
        <p className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span>
            <span className="o-serif text-[28px] leading-none tabular-nums">
              {formatUsd(pool.raisedUsd)}
            </span>{' '}
            <span className="text-[14px] text-[var(--o-mute)]">raised</span>
          </span>
          <span className="text-[14px] tabular-nums text-[var(--o-soft)]">
            {Math.round(poolPercent(rfp))}% · {pool.backerCount} backers · {left}{' '}
            {left === 1 ? 'day' : 'days'} left
          </span>
        </p>
        <PoolBar className="mt-3 h-2" />
      </div>
      <dl className="o-rule mt-6 divide-y divide-[color:var(--o-line)] border-t">
        <Fact label="Where it goes">Only to research funded under this call.</Fact>
        <Fact label="If it falls short">
          <Placeholder>What happens if the target is not met is to be confirmed.</Placeholder>
        </Fact>
        <Fact label="Tax receipts">
          <Placeholder>Whether gifts are tax-deductible is to be confirmed.</Placeholder>
        </Fact>
      </dl>
    </PhaseCard>
  );
}

function PhaseTwo({ rfp }: { rfp: OrchOrRfp }) {
  return (
    <PhaseCard n={2} status="next" title="Fund and run the experiments">
      <p className="mt-6 text-[15px] leading-[1.6] text-[var(--o-soft)]">
        Scientists propose experiments on the six open questions. The pool pays for the strongest,
        and every result is published, whichever way it points.
      </p>
      <dl className="o-rule mt-6 divide-y divide-[color:var(--o-line)] border-t">
        <Fact label="Proposals">
          Open {formatDate(rfp.opensOn)} to {rfp.deadline ? formatDate(rfp.deadline) : 'rolling'}
        </Fact>
        <Fact label="Review">In the open on ResearchHub, by peer reviewers</Fact>
        <Fact label="Who decides">
          <Placeholder>Who chooses which proposals are funded is to be confirmed.</Placeholder>
        </Fact>
        <Fact label="Awards">{rfp.awardRangeLabel} each</Fact>
        <Fact label="Decisions by">{formatDate(rfp.decisionsBy)}</Fact>
      </dl>
    </PhaseCard>
  );
}

/**
 * Where the programme stands, in full, near the end of the page (the hero
 * carries the short version and links here): Phase 1 raises the pool
 * (target, date, progress and the facts a donor checks), Phase 2 funds and
 * runs the experiments (the proposal window, review, who decides, award
 * size, decision date). The programme's timeline, not the reader's steps;
 * those are in How it works. Unknown answers are marked as placeholders.
 */
export function Phases() {
  const rfp = ORCH_OR_RFP;
  return (
    <section
      id="phases"
      aria-labelledby="phases-title"
      className="o-rule scroll-mt-10 border-t py-24 tablet:py-32"
    >
      <Wrap>
        <h2
          id="phases-title"
          className="o-reveal o-serif max-w-[20em] text-[clamp(28px,3vw,40px)] leading-[1.1]"
        >
          Two phases. First the money, then the experiments.
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-5 tablet:grid-cols-2 tablet:gap-6">
          <PhaseOne rfp={rfp} />
          <PhaseTwo rfp={rfp} />
        </div>
      </Wrap>
    </section>
  );
}
