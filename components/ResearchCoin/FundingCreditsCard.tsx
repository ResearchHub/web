'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/Button';
import { DepositModal } from '@/components/modals/ResearchCoin/DepositModal';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useDismissableFeature } from '@/hooks/useDismissableFeature';
import { cn } from '@/utils/styles';

/** One key for the toast and the card, so closing either closes both. */
export const FUNDING_CREDITS_CARD_FEATURE = 'funding_credits_card';

/** The promo runs through Nov 12, 2026 in Pacific time, then stops showing. */
const PROMO_ENDS_AT = Date.parse('2026-11-13T00:00:00-08:00');

/** Long enough that the page settles before the toast arrives. */
const TOAST_DELAY_MS = 1200;
/** Matches the toast's transition, so it finishes leaving before it unmounts. */
const TOAST_EXIT_MS = 300;

/**
 * Whether the promo is running: null until mounted, then true before it ends
 * and false after. Checked after mount, not during render, so a page built
 * ahead of time never ships a stale answer.
 */
export function usePromoIsLive(): boolean | null {
  const [isLive, setIsLive] = useState<boolean | null>(null);
  useEffect(() => {
    const remaining = PROMO_ENDS_AT - Date.now();
    if (remaining <= 0) {
      setIsLive(false);
      return;
    }
    setIsLive(true);
    // Leave on time for a tab that stays open across the deadline.
    const timer = window.setTimeout(() => setIsLive(false), remaining);
    return () => window.clearTimeout(timer);
  }, []);
  return isLive;
}

/**
 * Invites people to deposit ResearchCoin and earn Funding Credits. Above the
 * feed on phones, where the bottom corner belongs to the nav and the funding
 * power bar. Shown until dismissed or until the promo ends.
 */
export function FundingCreditsCard({ className }: { readonly className?: string }) {
  const { isDismissed, dismissFeature, dismissStatus } = useDismissableFeature(
    FUNDING_CREDITS_CARD_FEATURE
  );
  const isLive = usePromoIsLive();

  if (!isLive || dismissStatus !== 'checked' || isDismissed) return null;

  return (
    <section
      aria-label="Funding Credits"
      className={cn(
        'relative rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm',
        className
      )}
    >
      <FundingCreditsContent onDismiss={dismissFeature} buttonClassName="h-11" />
    </section>
  );
}

/**
 * The same pitch as a toast in the bottom-right corner, from the tablet
 * breakpoint up. For a signed-out visitor it rides above the Join banner
 * while that is up, which publishes its height as `--join-banner-height`.
 */
export function FundingCreditsToast() {
  const { isDismissed, dismissFeature, dismissStatus } = useDismissableFeature(
    FUNDING_CREDITS_CARD_FEATURE
  );
  const isLive = usePromoIsLive();
  const isEligible = isLive && dismissStatus === 'checked' && !isDismissed;
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    if (!isEligible) return;
    const timer = window.setTimeout(() => setIsShown(true), TOAST_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isEligible]);

  if (!isEligible) return null;

  const dismiss = () => {
    setIsShown(false);
    window.setTimeout(dismissFeature, TOAST_EXIT_MS);
  };

  return (
    <section
      aria-label="Funding Credits"
      inert={!isShown}
      className={cn(
        'fixed bottom-[calc(1.5rem+var(--join-banner-height,0px))] right-6 z-50 hidden w-[360px] tablet:!block',
        'rounded-2xl border border-gray-200 bg-white p-4',
        'shadow-[0_16px_40px_-12px_rgba(15,23,42,0.28),0_2px_6px_-2px_rgba(15,23,42,0.08)]',
        'transition-[opacity,transform,bottom] duration-300 ease-out motion-reduce:transition-none',
        isShown ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      )}
    >
      <FundingCreditsContent onDismiss={dismiss} />
    </section>
  );
}

function FundingCreditsContent({
  onDismiss,
  buttonClassName,
}: {
  readonly onDismiss: () => void;
  readonly buttonClassName?: string;
}) {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute right-1.5 top-1.5 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        <X className="h-4 w-4" />
      </button>

      <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-green-700">
        <Sparkle className="h-3.5 w-3.5 text-green-500" />
        New · Funding Credits
      </p>

      <CreditsWeekChart />

      <h2 className="mt-3.5 font-serif text-xl leading-tight text-gray-900">
        ResearchHub Endowment
      </h2>
      <p className="mt-1 text-[13px] leading-snug text-gray-600">
        Funding credits are used to fund science on the platform.
      </p>

      <div className="mt-3.5 grid grid-cols-2 gap-2">
        <Button
          className={cn('font-semibold', buttonClassName)}
          onClick={() => executeAuthenticatedAction(() => setIsDepositOpen(true))}
        >
          Deposit RSC
        </Button>
        <Link
          href="/endowment"
          className={cn(buttonVariants({ variant: 'outlined' }), 'font-semibold', buttonClassName)}
        >
          Learn more
        </Link>
      </div>

      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
    </>
  );
}

function Sparkle({ className }: { readonly className?: string }) {
  return (
    <svg viewBox="-8 -8 16 16" fill="currentColor" aria-hidden className={className}>
      <path d="M0 -8 C1 -2 2 -1 8 0 C2 1 1 2 0 8 C-1 2 -2 1 -8 0 C-2 -1 -1 -2 0 -8Z" />
    </svg>
  );
}

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
/** Light at the base, darker as the stack grows. */
const PILL_FILLS = ['#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d'];
const COLUMN_X = (day: number) => 44 + day * 38;
const PILL_Y = (level: number) => 82 - level * 10;

/** A week of credits stacking up, with today's landing on top. */
function CreditsWeekChart() {
  const today = DAYS.length - 1;

  return (
    <svg viewBox="0 0 330 112" aria-hidden className="block h-auto w-full">
      <style>{`
        @keyframes fc-drop {
          0% { transform: translateY(-28px); opacity: 0; }
          15% { opacity: 1; }
          25%, 90% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(0); opacity: 0; }
        }
        @keyframes fc-twinkle { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
        @media (prefers-reduced-motion: no-preference) {
          .fc-today { animation: fc-drop 3s ease-out infinite; }
          .fc-twinkle { animation: fc-twinkle 2s ease-in-out infinite; }
          .fc-twinkle-alt { animation: fc-twinkle 2s ease-in-out 1s infinite; }
        }
      `}</style>
      <rect width="330" height="112" rx="12" fill="#f0fdf4" />
      <line x1="28" y1="93" x2="302" y2="93" stroke="#bbf7d0" strokeWidth="1.5" />

      {DAYS.map((_, day) =>
        // Each day holds one more pill than the day before; today's top one drops in.
        Array.from({ length: Math.min(day + 1, PILL_FILLS.length) }, (_, level) => (
          <rect
            key={`${day}-${level}`}
            x={COLUMN_X(day)}
            y={PILL_Y(level)}
            width="26"
            height="8"
            rx="4"
            fill={PILL_FILLS[level]}
          />
        ))
      )}
      <rect
        className="fc-today"
        x={COLUMN_X(today)}
        y={PILL_Y(PILL_FILLS.length)}
        width="26"
        height="8"
        rx="4"
        fill="#166534"
      />

      <g fontSize="9" fontWeight="600" fill="#166534" textAnchor="middle">
        {DAYS.map((letter, day) => (
          <text key={day} x={COLUMN_X(day) + 13} y="105">
            {letter}
          </text>
        ))}
      </g>

      <g className="fc-twinkle" transform="translate(301 15) scale(0.625)" fill="#22c55e">
        <path d="M0 -8 C1 -2 2 -1 8 0 C2 1 1 2 0 8 C-1 2 -2 1 -8 0 C-2 -1 -1 -2 0 -8Z" />
      </g>
      <g className="fc-twinkle-alt" transform="translate(32 48) scale(0.5)" fill="#86efac">
        <path d="M0 -8 C1 -2 2 -1 8 0 C2 1 1 2 0 8 C-1 2 -2 1 -8 0 C-2 -1 -1 -2 0 -8Z" />
      </g>
    </svg>
  );
}
