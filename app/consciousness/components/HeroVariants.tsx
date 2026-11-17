import { cn } from '@/utils/styles';
import { ORCH_OR_RFP, formatDate, formatUsd, formatUsdShort, poolPercent } from '../data/mockRfp';
import { HeroPhase } from './HeroPhase';
import { BackerFaces, PoolBar } from './PoolPanel';

/*
 * Mock treatments for the hero, compared at /consciousness/mocks and
 * openable in place with `?box=` and `?h=` (Kobe, 2026-11-17). Once one is
 * picked, keep it and delete the rest.
 */

// ---------------------------------------------------------------- headlines

export const HEADLINES = [
  { id: '1', lead: 'How does a brain make a mind?', emph: 'Fund the experiments.', note: 'Now' },
  {
    id: '2',
    lead: 'Fund the experiments',
    emph: 'that could explain consciousness.',
    note: 'Says what you do, then why',
  },
  {
    id: '3',
    lead: 'What makes us conscious?',
    emph: 'Help fund the answer.',
    note: 'One plain question',
  },
  {
    id: '4',
    lead: 'Put the theories of consciousness',
    emph: 'to the test.',
    note: 'The call in one line',
  },
  { id: '5', lead: 'Fund the science', emph: 'of consciousness.', note: 'Shortest' },
  {
    id: '6',
    lead: '$1M to test',
    emph: 'how consciousness arises.',
    note: 'Leads with the goal',
  },
  {
    id: '7',
    lead: 'Where does experience come from?',
    emph: 'Help us find out.',
    note: 'Question, then an invitation',
  },
  {
    id: '8',
    lead: 'Consciousness is an open problem.',
    emph: 'Fund the experiments.',
    note: 'Echoes the section below',
  },
] as const;

export type HeadlineId = (typeof HEADLINES)[number]['id'];

export function parseHeadline(value: unknown): HeadlineId {
  return HEADLINES.find((h) => h.id === value)?.id ?? '1';
}

export function headline(id: HeadlineId) {
  return HEADLINES.find((h) => h.id === id) ?? HEADLINES[0];
}

// ---------------------------------------------------------------- phase box

export const BOXES = [
  { id: 'A', name: 'Tabs', note: 'Now: two tabs on a line inside a card; Phase 2 opens in place.' },
  {
    id: 'B',
    name: 'One bar, two phases',
    note: 'No card. A single track split in two: Phase 1 fills as money comes in, Phase 2 waits.',
  },
  {
    id: 'C',
    name: 'Tracker',
    note: 'A vertical two-step tracker, like a delivery status: Phase 1 open, Phase 2 one muted line.',
  },
  {
    id: 'D',
    name: 'Two cards',
    note: 'Phase 1 as a solid card, Phase 2 as a dashed, greyed card beside it.',
  },
  {
    id: 'E',
    name: 'Plain stat',
    note: 'No card, no tabs: one status line, the number and the bar. Phase 2 is a line of text.',
  },
  {
    id: 'F',
    name: 'Status at the top',
    note: 'A small "Phase 1 of 2" pill above the headline; under the buttons, only the money.',
  },
] as const;

export type BoxId = (typeof BOXES)[number]['id'];

export function parseBox(value: unknown): BoxId {
  return BOXES.find((b) => b.id === value)?.id ?? 'A';
}

function facts() {
  const rfp = ORCH_OR_RFP;
  const { pool } = rfp;
  return {
    rfp,
    pool,
    pct: Math.round(poolPercent(rfp)),
    backers: `${pool.backerCount} ${pool.backerCount === 1 ? 'backer' : 'backers'}`,
  };
}

/** The Phase 1 dot: a ring radiates from it (still when motion is reduced). */
export function LiveDot({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('relative flex h-2.5 w-2.5 shrink-0', className)}>
      <span className="o-live-ring absolute inset-0 rounded-full bg-[var(--o-gold)]" />
      <span className="relative h-2.5 w-2.5 rounded-full bg-[var(--o-gold)]" />
    </span>
  );
}

function HollowDot() {
  return (
    <span
      aria-hidden
      className="h-2.5 w-2.5 shrink-0 rounded-full ring-[1.5px] ring-inset ring-[color:var(--o-mute)]"
    />
  );
}

/** "$68,450 raised toward $1M by 31 December 2026". */
function Raised({ size = 28 }: { size?: number }) {
  const { pool } = facts();
  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className="o-serif leading-none tabular-nums" style={{ fontSize: size }}>
        {formatUsd(pool.raisedUsd)}
      </span>
      <span className="text-[14px] text-[var(--o-soft)]">
        raised toward {formatUsdShort(pool.goalUsd)} by {formatDate(pool.goalBy)}
      </span>
    </p>
  );
}

/** Backer faces · backers · % · days left. */
function Meta({ daysLeft }: { daysLeft: number }) {
  const { pool, pct, backers } = facts();
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 text-[13.5px] text-[var(--o-soft)]">
      <BackerFaces size={22} />
      {pool.backerCount > 0 ? backers : 'Be the first backer'}
      <span className="opacity-50">·</span>
      <span className="tabular-nums">{pct}%</span>
      <span className="opacity-50">·</span>
      <span className="tabular-nums">
        {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
      </span>
    </div>
  );
}

const PHASE_2 = 'Pick proposals, run the experiments';

/** B: one track, two segments. */
function SplitBar({ daysLeft }: { daysLeft: number }) {
  const { pct } = facts();
  return (
    <div className="o-rise mt-9 max-w-[480px]">
      <Raised />
      <div className="mt-4 flex gap-1.5">
        <div className="h-2 flex-[3] overflow-hidden rounded-l-full bg-[rgb(var(--o-text-rgb)/0.1)]">
          <span
            className="block h-full rounded-full bg-[var(--o-gold)]"
            style={{ width: `${Math.max(pct, 1.5)}%` }}
          />
        </div>
        <div className="h-2 flex-[2] rounded-r-full bg-[repeating-linear-gradient(135deg,rgb(var(--o-text-rgb)/0.12)_0_4px,transparent_4px_8px)]" />
      </div>
      <div className="mt-2.5 flex gap-1.5 text-[12.5px] leading-snug">
        <p className="flex flex-[3] items-start gap-2">
          <LiveDot className="mt-[3px]" />
          <span>
            <span className="font-semibold text-[var(--o-text)]">Phase 1 · Raise the pool</span>
            <span className="block text-[var(--o-mute)]">{daysLeft} days left</span>
          </span>
        </p>
        <p className="flex flex-[2] items-start gap-2 text-[var(--o-mute)]">
          <HollowDot />
          <span>
            <span className="font-semibold">Phase 2 · Experiments</span>
            <span className="block">From 2027</span>
          </span>
        </p>
      </div>
    </div>
  );
}

/** C: a vertical two-step tracker. */
function Tracker({ daysLeft }: { daysLeft: number }) {
  return (
    <div className="o-rise mt-8 max-w-[480px] rounded-[16px] bg-[rgb(var(--o-ink-rgb)/0.78)] p-5 ring-1 ring-[color:var(--o-line-2)] backdrop-blur-md">
      <ol className="relative">
        <span
          aria-hidden
          className="absolute bottom-[14px] left-[4.5px] top-[14px] w-px bg-[var(--o-line-2)]"
        />
        <li className="relative flex gap-4">
          <LiveDot className="mt-[5px]" />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em]">
              Phase 1 · Raising now
            </p>
            <div className="mt-2.5">
              <Raised size={26} />
            </div>
            <PoolBar className="mt-3 h-2" />
            <Meta daysLeft={daysLeft} />
          </div>
        </li>
        <li className="relative mt-5 flex gap-4 text-[var(--o-mute)]">
          <span className="relative mt-[5px] flex rounded-full bg-[var(--o-ink)]">
            <HollowDot />
          </span>
          <p className="text-[13.5px]">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em]">
              Phase 2 · 2027
            </span>
            <span className="block">{PHASE_2}</span>
          </p>
        </li>
      </ol>
    </div>
  );
}

/** D: two cards, the second greyed. */
function TwoCards({ daysLeft }: { daysLeft: number }) {
  const { rfp } = facts();
  return (
    <div className="o-rise mt-8 grid max-w-[600px] grid-cols-1 gap-3 tablet:grid-cols-[1.6fr_1fr]">
      <div className="rounded-[16px] bg-[rgb(var(--o-ink-rgb)/0.82)] p-5 ring-1 ring-[color:rgb(var(--o-gold-rgb)/0.45)] backdrop-blur-md">
        <p className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.12em]">
          <LiveDot /> Phase 1 · Now
        </p>
        <div className="mt-3">
          <Raised size={26} />
        </div>
        <PoolBar className="mt-3 h-2" />
        <Meta daysLeft={daysLeft} />
      </div>
      <div className="rounded-[16px] border border-dashed border-[color:var(--o-line-2)] p-5 text-[var(--o-mute)]">
        <p className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.12em]">
          <HollowDot /> Phase 2 · Next
        </p>
        <p className="o-serif mt-3 text-[19px] leading-tight text-[var(--o-soft)]">{PHASE_2}</p>
        <p className="mt-2 text-[13px]">Awards {rfp.awardRangeLabel}</p>
      </div>
    </div>
  );
}

/** E: a status line, the number and the bar; no card. */
function PlainStat({ daysLeft }: { daysLeft: number }) {
  return (
    <div className="o-rise mt-9 max-w-[480px]">
      <p className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.12em]">
        <LiveDot /> Phase 1 of 2 · Raising now
      </p>
      <div className="mt-3">
        <Raised size={32} />
      </div>
      <PoolBar className="mt-3 h-2" />
      <Meta daysLeft={daysLeft} />
      <p className="mt-4 text-[13px] text-[var(--o-mute)]">
        Next, Phase 2: {PHASE_2.toLowerCase()}.
      </p>
    </div>
  );
}

/** F, top half: the status pill above the headline. */
export function StatusPill() {
  const { pool } = facts();
  return (
    <p className="o-rise mb-6 inline-flex items-center gap-2.5 rounded-full bg-[rgb(var(--o-ink-rgb)/0.8)] py-1.5 pl-3 pr-4 text-[13px] ring-1 ring-[color:var(--o-line-2)] backdrop-blur-md">
      <LiveDot />
      <span className="font-semibold text-[var(--o-text)]">Phase 1 of 2</span>
      <span className="text-[var(--o-soft)]">
        Raising {formatUsdShort(pool.goalUsd)} by {formatDate(pool.goalBy)}
      </span>
    </p>
  );
}

/** F, bottom half: only the money. */
function MoneyOnly({ daysLeft }: { daysLeft: number }) {
  return (
    <div className="o-rise mt-9 max-w-[480px]">
      <Raised />
      <PoolBar className="mt-3 h-2" />
      <Meta daysLeft={daysLeft} />
    </div>
  );
}

/** The part of the phase box that sits under the hero's buttons. */
export function PhaseBox({ box, daysLeft }: { box: BoxId; daysLeft: number }) {
  switch (box) {
    case 'B':
      return <SplitBar daysLeft={daysLeft} />;
    case 'C':
      return <Tracker daysLeft={daysLeft} />;
    case 'D':
      return <TwoCards daysLeft={daysLeft} />;
    case 'E':
      return <PlainStat daysLeft={daysLeft} />;
    case 'F':
      return <MoneyOnly daysLeft={daysLeft} />;
    default:
      return <HeroPhase daysLeft={daysLeft} />;
  }
}
