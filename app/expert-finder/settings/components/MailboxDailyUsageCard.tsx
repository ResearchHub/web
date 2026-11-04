'use client';

import { useMemo, type ReactNode } from 'react';
import { cn } from '@/utils/styles';
import { formatCountdownRemaining } from '@/utils/date';
import type { MailboxStatus } from '@/types/expertFinder';

export interface MailboxDailyUsageCardProps {
  status: Pick<
    MailboxStatus,
    'dailyCap' | 'sentToday' | 'queuedToday' | 'remainingToday' | 'resetsAt'
  >;
  className?: string;
}

/**
 * Segmented daily send quota meter (sent / queued / remaining), styled like the
 * RFP funding impact progress bar with distinct segment colors.
 */
export function MailboxDailyUsageCard({ status, className }: MailboxDailyUsageCardProps) {
  const { dailyCap, sentToday, queuedToday, remainingToday, resetsAt } = status;

  const segments = useMemo(() => {
    const cap = Math.max(dailyCap, 1);
    const sent = Math.min(sentToday, cap);
    const queued = Math.min(queuedToday, Math.max(0, cap - sent));
    const remaining = Math.max(0, cap - sent - queued);
    return {
      sentPct: (sent / cap) * 100,
      queuedPct: (queued / cap) * 100,
      remainingPct: (remaining / cap) * 100,
      usedRatio: Math.min(1, (sent + queued) / cap),
    };
  }, [dailyCap, sentToday, queuedToday]);

  const exhausted = remainingToday <= 0;
  const nearlyFull = !exhausted && segments.usedRatio >= 0.8;
  const countdown = resetsAt ? formatCountdownRemaining(resetsAt) : null;
  const resetsLabel =
    countdown && !countdown.isPast && countdown.formatted
      ? `Resets in ${countdown.formatted}`
      : resetsAt
        ? `Resets at ${new Date(resetsAt).toLocaleString(undefined, {
            timeZone: 'UTC',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short',
          })}`
        : null;

  const sentColor = exhausted ? 'bg-red-500' : nearlyFull ? 'bg-amber-500' : 'bg-orange-500';
  const remainingColor = exhausted ? 'bg-gray-200' : 'bg-emerald-500/80';

  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white p-4 space-y-3', className)}>
      <style jsx global>{`
        @keyframes ef-quota-stripe-move {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 42px 0;
          }
        }
      `}</style>

      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div className="text-sm font-medium text-gray-700">Daily send balance</div>
        <div className="text-sm text-gray-500">
          <span
            className={cn(
              'font-semibold',
              exhausted ? 'text-red-600' : nearlyFull ? 'text-amber-700' : 'text-gray-900'
            )}
          >
            {remainingToday}
          </span>{' '}
          of {dailyCap} left today
        </div>
      </div>

      <div
        className="relative w-full h-4 bg-gray-200 rounded-lg overflow-hidden"
        role="img"
        aria-label={`${sentToday} sent, ${queuedToday} in queue, ${remainingToday} remaining of ${dailyCap} daily cap`}
      >
        <div className="absolute inset-0 flex">
          {segments.sentPct > 0 && (
            <div
              className={cn('h-full transition-all duration-300', sentColor)}
              style={{ width: `${segments.sentPct}%` }}
            />
          )}
          {segments.queuedPct > 0 && (
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${segments.queuedPct}%`,
                backgroundColor: exhausted ? '#f87171' : '#fbbf24',
                backgroundImage: `repeating-linear-gradient(
                  -45deg,
                  transparent,
                  transparent 10px,
                  rgba(255, 255, 255, 0.35) 10px,
                  rgba(255, 255, 255, 0.35) 20px
                )`,
                animation: 'ef-quota-stripe-move 1s linear infinite',
              }}
            />
          )}
          {segments.remainingPct > 0 && (
            <div
              className={cn('h-full transition-all duration-300', remainingColor)}
              style={{ width: `${segments.remainingPct}%` }}
            />
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600">
        <LegendItem
          dotClassName={sentColor}
          label={
            <>
              <span className="font-medium text-gray-800">{sentToday}</span> sent
            </>
          }
        />
        <LegendItem
          dotClassName="bg-amber-400"
          striped
          label={
            <>
              <span className="font-medium text-gray-800">{queuedToday}</span> in queue
            </>
          }
        />
        <LegendItem
          dotClassName={exhausted ? 'bg-gray-300' : 'bg-emerald-500'}
          label={
            <>
              <span className="font-medium text-gray-800">{remainingToday}</span> left
            </>
          }
        />
      </div>

      {resetsLabel && resetsAt && (
        <p className="text-xs text-gray-500">
          <time dateTime={resetsAt} title={new Date(resetsAt).toISOString()}>
            {resetsLabel}
          </time>
        </p>
      )}

      {exhausted && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          You&apos;ve reached today&apos;s send limit. New outreach can be sent after the quota
          resets at UTC midnight.
        </p>
      )}
    </div>
  );
}

function LegendItem({
  dotClassName,
  striped = false,
  label,
}: {
  dotClassName?: string;
  striped?: boolean;
  label: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn('inline-block h-2.5 w-2.5 rounded-sm shrink-0', dotClassName)}
        aria-hidden
        style={
          striped
            ? {
                backgroundImage: `repeating-linear-gradient(
                  -45deg,
                  transparent,
                  transparent 2px,
                  rgba(255, 255, 255, 0.45) 2px,
                  rgba(255, 255, 255, 0.45) 4px
                )`,
              }
            : undefined
        }
      />
      <span>{label}</span>
    </span>
  );
}
