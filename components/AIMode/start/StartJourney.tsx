'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  ClipboardCheck,
  HandCoins,
  LayoutDashboard,
  Lock,
  Megaphone,
  PenLine,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { FundingIntent } from '@/components/Funding/fundingDirection';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { cn } from '@/utils/styles';

interface JourneyStep {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly detail: string;
}

interface JourneyNote {
  readonly icon: LucideIcon;
  readonly title: string;
  /** Somewhere to go, when there is one. */
  readonly href?: string;
}

interface Journey {
  readonly heading: string;
  /** The first step is this conversation; the rest follow from it. */
  readonly steps: readonly JourneyStep[];
  readonly note: JourneyNote;
}

/**
 * What the two "open a document" modals say on their first slide, folded
 * into the workspace: the road from this conversation to funded science,
 * for a funder and for a researcher.
 */
const JOURNEYS: Record<FundingIntent, Journey> = {
  fund: {
    heading: 'How funding works',
    steps: [
      {
        icon: Megaphone,
        title: 'Publish your RFP',
        detail: 'Set the scope, budget, and deadline.',
      },
      {
        icon: Users,
        title: 'Experts submit proposals',
        detail: 'We notify scientists who match your call.',
      },
      {
        icon: ClipboardCheck,
        title: 'Open peer review',
        detail: 'Reviewers assess rigor and feasibility.',
      },
      {
        icon: HandCoins,
        title: 'Delegate the funds',
        detail: 'Choose which proposals get funded.',
      },
    ],
    note: {
      icon: LayoutDashboard,
      title: 'Track it from your funder dashboard',
      href: '/my-funding',
    },
  },
  need_funding: {
    heading: 'How getting funded works',
    steps: [
      {
        icon: PenLine,
        title: 'Draft your proposal',
        detail: 'Aims, budget, and timeline, with the assistant.',
      },
      {
        icon: Target,
        title: 'Apply to an RFP or open call',
        detail: "Answer a funder's call, or put it to the community.",
      },
      {
        icon: ClipboardCheck,
        title: 'Open peer review',
        detail: 'Reviewers assess rigor and feasibility.',
      },
      {
        icon: HandCoins,
        title: 'Get funded',
        detail: 'Institutions and the community back it.',
      },
    ],
    note: {
      icon: Lock,
      title: 'Stay in control: public, or funders only',
    },
  },
};

const ACCENT: Record<
  FundingIntent,
  {
    readonly dot: string;
    readonly icon: string;
    readonly note: string;
    readonly noteIcon: string;
  }
> = {
  fund: {
    dot: 'bg-primary-600',
    icon: 'text-primary-700',
    note: 'border-primary-200 bg-primary-50 hover:bg-primary-100',
    noteIcon: 'text-primary-700',
  },
  need_funding: {
    dot: 'bg-emerald-600',
    icon: 'text-emerald-700',
    note: 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100',
    noteIcon: 'text-emerald-700',
  },
};

interface StartJourneyProps {
  readonly intent: FundingIntent;
  readonly className?: string;
}

/**
 * The rail beside the composer: a four-step timeline with this conversation
 * as step one. Hollow dots for what is to come, a radiating one for now, and
 * one connector running dot to dot. Under it, one more thing to know: a
 * link when there is somewhere to go, plain text when there is not.
 */
export function StartJourney({ intent, className }: StartJourneyProps) {
  const journey = JOURNEYS[intent];
  const accent = ACCENT[intent];
  const NoteIcon = journey.note.icon;

  return (
    <aside
      aria-label={journey.heading}
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-5 pb-4 pt-5',
        className
      )}
    >
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
        {journey.heading}
      </h3>
      <ol className="flex flex-col">
        {journey.steps.map((step, index) => {
          const Icon = step.icon;
          const current = index === 0;
          const last = index === journey.steps.length - 1;
          return (
            <li key={step.title} className="flex gap-3">
              <div className="flex w-2.5 shrink-0 flex-col items-center pt-[5px]">
                {current ? (
                  <RadiatingDot ring color={accent.dot} className="shrink-0" />
                ) : (
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 shrink-0 rounded-full border-[1.5px] border-gray-300 bg-white"
                  />
                )}
                {!last && <span aria-hidden="true" className="w-px flex-1 bg-gray-200" />}
              </div>
              <div className={cn('flex min-w-0 flex-col gap-0.5', !last && 'pb-4')}>
                <span
                  className={cn(
                    'flex items-center gap-1.5 text-[13px] font-semibold',
                    current ? 'text-gray-900' : 'text-gray-700'
                  )}
                >
                  <Icon
                    className={cn('h-4 w-4 shrink-0', current ? accent.icon : 'text-gray-500')}
                    aria-hidden="true"
                  />
                  {step.title}
                  {current && <span className="sr-only">(this conversation)</span>}
                </span>
                <span className="text-xs leading-relaxed text-gray-500">{step.detail}</span>
              </div>
            </li>
          );
        })}
      </ol>
      {journey.note.href ? (
        <Link
          href={journey.note.href}
          className={cn(
            'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-colors',
            accent.note
          )}
        >
          <NoteIcon
            className={cn('h-[18px] w-[18px] shrink-0', accent.noteIcon)}
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 text-xs font-semibold text-gray-900">
            {journey.note.title}
          </span>
          <ArrowUpRight
            className={cn('h-3.5 w-3.5 shrink-0', accent.noteIcon)}
            aria-hidden="true"
          />
        </Link>
      ) : (
        <p className="flex items-center gap-2 px-0.5 text-xs text-gray-500">
          <NoteIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />
          {journey.note.title}
        </p>
      )}
    </aside>
  );
}
