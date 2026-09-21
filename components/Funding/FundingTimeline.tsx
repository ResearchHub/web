'use client';

import { ClipboardCheck, HandCoins, Megaphone, Users } from 'lucide-react';
import { Timeline, type TimelineStep } from '@/components/ui/Timeline';

/**
 * The lifecycle of a request for proposal from the funder's side, in order.
 * Every surface that explains how funding works reads from here so the
 * sequence and the wording stay in one place.
 */
export const FUNDING_TIMELINE_STEPS: TimelineStep[] = [
  {
    id: 'publish',
    title: 'Publish your RFP',
    description: 'Set the scope, budget, and deadline.',
    icon: Megaphone,
  },
  {
    id: 'proposals',
    title: 'Experts submit proposals',
    description: 'We notify scientists who match your call.',
    icon: Users,
  },
  {
    id: 'review',
    title: 'Open peer review',
    description: 'Reviewers assess rigor and feasibility.',
    icon: ClipboardCheck,
  },
  {
    id: 'delegate',
    title: 'Delegate the funds',
    description: 'Choose which proposals get funded.',
    icon: HandCoins,
  },
];

interface FundingTimelineProps {
  className?: string;
}

/**
 * The RFP lifecycle as a vertical timeline. The first node is filled to read
 * as "you are here" for a funder about to publish.
 */
export function FundingTimeline({ className }: FundingTimelineProps) {
  return <Timeline steps={FUNDING_TIMELINE_STEPS} className={className} />;
}
