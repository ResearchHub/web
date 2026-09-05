'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Check,
  ChevronRight,
  Coins,
  Loader2,
  PenLine,
  Search,
  Send,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/utils/styles';
import type { ActivityIcon, ActivityStep } from '../lib/types';

/** Gap between steps landing while the turn is live. */
const STEP_INTERVAL_MS = 1100;

const ICONS: Record<ActivityIcon, LucideIcon> = {
  read: BookOpen,
  search: Search,
  check: Check,
  write: PenLine,
  send: Send,
  people: Users,
  money: Coins,
};

interface ActivityTraceProps {
  readonly steps: ActivityStep[];
  /** True while the turn is still on its thinking beat. */
  readonly live: boolean;
}

/**
 * The work behind a turn, shown tool-call style: steps land one at a time
 * while the assistant is thinking, then fold into a one-line summary the
 * funder can reopen. Reading is what earns the answer, so it is shown.
 */
export const ActivityTrace = ({ steps, live }: ActivityTraceProps) => {
  const [revealed, setRevealed] = useState(live ? 1 : steps.length);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!live) {
      setRevealed(steps.length);
      return;
    }

    const interval = setInterval(() => {
      setRevealed((previous) => Math.min(previous + 1, steps.length));
    }, STEP_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [live, steps.length]);

  const showSteps = live || isExpanded;

  return (
    <div className="mb-4">
      {!live && (
        <button
          type="button"
          onClick={() => setIsExpanded((previous) => !previous)}
          className="group flex items-center gap-1.5 rounded-md py-0.5 text-[13px] text-gray-500 transition-colors hover:text-gray-800"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary-500" />
          <span>
            Worked through {steps.length} {steps.length === 1 ? 'step' : 'steps'}
          </span>
          <ChevronRight
            className={cn(
              'h-3.5 w-3.5 text-gray-400 transition-transform',
              isExpanded && 'rotate-90'
            )}
          />
        </button>
      )}

      <AnimatePresence initial={false}>
        {showSteps && (
          <motion.ol
            key="steps"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={cn('overflow-hidden', !live && 'mt-1.5')}
          >
            <div className="space-y-1.5 border-l-2 border-gray-200 pl-3.5">
              {steps.slice(0, revealed).map((step, index) => {
                const Icon = ICONS[step.icon ?? 'check'];
                const isCurrent = live && index === revealed - 1;

                return (
                  <motion.li
                    key={`${index}-${step.label}`}
                    initial={live ? { opacity: 0, x: -6 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="flex items-start gap-2.5 text-[14px]"
                  >
                    <span
                      className={cn(
                        'mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center',
                        isCurrent ? 'text-primary-600' : 'text-gray-400'
                      )}
                    >
                      {isCurrent ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Icon className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={cn('font-medium', isCurrent ? 'text-gray-900' : 'text-gray-700')}
                      >
                        {step.label}
                      </span>
                      {step.detail && !isCurrent && (
                        <span className="ml-2 text-[13px] text-gray-400">{step.detail}</span>
                      )}
                    </span>
                  </motion.li>
                );
              })}
            </div>
          </motion.ol>
        )}
      </AnimatePresence>
    </div>
  );
};
