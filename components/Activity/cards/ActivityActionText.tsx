'use client';

import { FC, ReactNode } from 'react';
import { BountyAmount } from '../amounts/BountyAmount';
import { ContributionAmount } from '../amounts/ContributionAmount';
import { GrantFundingAmount } from '../amounts/GrantFundingAmount';
import { ReviewScoreStars } from '../amounts/ReviewScoreStars';
import { ActivityAuthorSummary } from './ActivityAuthorSummary';
import type { ActivityActionLine, ActivityActionValue } from '../lib/activityDisplay.utils';
import { cn } from '@/utils/styles';

/** Amounts keep the line's size and stand out by weight and colour. */
const VALUE_CLASS = 'text-[length:inherit] font-semibold';

function ActionValue({ value }: Readonly<{ value: ActivityActionValue }>) {
  switch (value.kind) {
    case 'contribution':
      return (
        <ContributionAmount contribution={value.amount} showSign={false} className={VALUE_CLASS} />
      );
    case 'grant':
      return <GrantFundingAmount amount={value.amount} className={VALUE_CLASS} />;
    case 'bounty':
      return <BountyAmount bounty={value.bounty} className={VALUE_CLASS} />;
    case 'score':
      return (
        <span className="inline-flex items-center gap-1 align-[-2px]">
          <ReviewScoreStars score={value.score} size="sm" />
          <span className="font-semibold text-amber-700">{value.score.toFixed(1)}</span>
        </span>
      );
  }
}

interface ActivityActionTextProps {
  line: ActivityActionLine;
  /** Runs on at the end of the line, as the byline's time does. */
  suffix?: ReactNode;
  className?: string;
}

/**
 * What the actor did, with its amount or score, set in the byline's grey so it never
 * reads as the content under it. A `div`, since a named target brings its profile
 * tooltip, which renders block content.
 */
export const ActivityActionText: FC<ActivityActionTextProps> = ({ line, suffix, className }) => (
  <div className={cn('text-sm leading-5 text-gray-600', className)}>
    {line.label}
    {line.target && (
      <>
        {' '}
        <ActivityAuthorSummary authors={[line.target]} />
      </>
    )}
    {line.value && (
      <>
        {' '}
        <ActionValue value={line.value} />
      </>
    )}
    {line.trailing && ` ${line.trailing}`}
    {suffix && <> {suffix}</>}
  </div>
);
