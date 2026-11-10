'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { X, type LucideIcon } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/Button';
import { useDismissableFeature } from '@/hooks/useDismissableFeature';
import { cn } from '@/utils/styles';

/** Long enough that the page settles before the toast arrives. */
const TOAST_DELAY_MS = 1200;
/** Matches the toast's transition, so it finishes leaving before it unmounts. */
const TOAST_EXIT_MS = 300;

/**
 * `card` sits above the feed on phones, where the bottom corner belongs to the
 * nav and the funding power bar. `toast` takes the bottom-right corner from the
 * tablet breakpoint up.
 */
export type HomePromoVariant = 'card' | 'toast';

export interface HomePromoSlotProps {
  readonly variant: HomePromoVariant;
  readonly className?: string;
}

export type HomePromoAction = { readonly label: string } & (
  | { readonly onClick: () => void }
  | { readonly href: string }
);

interface HomePromoContent {
  readonly preview: ReactNode;
  readonly title: string;
  readonly description: string;
  readonly primaryAction: HomePromoAction;
  readonly secondaryAction: HomePromoAction;
}

interface HomePromoFrameProps extends HomePromoSlotProps, HomePromoContent {
  /** Dismissable feature key. The card and the toast share it, so closing either closes both. */
  readonly feature: string;
  readonly label: string;
  /** Toast only: in the feed, the card's heading carries it alone. */
  readonly eyebrow: { readonly icon: LucideIcon; readonly text: string };
}

/**
 * The chrome every homepage promo shares, so each one only brings its pitch.
 * Shown until dismissed.
 */
export function HomePromoFrame({ variant, eyebrow, ...props }: HomePromoFrameProps) {
  switch (variant) {
    case 'card':
      return <PromoCard {...props} />;
    case 'toast':
      return <PromoToast {...props} eyebrow={eyebrow} />;
    default: {
      const unhandled: never = variant;
      return unhandled;
    }
  }
}

type PromoShellProps = Omit<HomePromoFrameProps, 'variant' | 'eyebrow'>;

function PromoCard({ feature, label, className, ...content }: PromoShellProps) {
  const { isDismissed, dismissFeature, dismissStatus } = useDismissableFeature(feature);

  if (dismissStatus !== 'checked' || isDismissed) return null;

  return (
    <section
      aria-label={label}
      className={cn(
        'relative rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm',
        className
      )}
    >
      <PromoBody {...content} onDismiss={dismissFeature} buttonClassName="h-11" />
    </section>
  );
}

/**
 * For a signed-out visitor the toast rides above the Join banner while that is
 * up, which publishes its height as `--join-banner-height`.
 */
function PromoToast({
  feature,
  label,
  className,
  eyebrow,
  ...content
}: PromoShellProps & Pick<HomePromoFrameProps, 'eyebrow'>) {
  const { isDismissed, dismissFeature, dismissStatus } = useDismissableFeature(feature);
  const isEligible = dismissStatus === 'checked' && !isDismissed;
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

  const EyebrowIcon = eyebrow.icon;

  return (
    <section
      aria-label={label}
      inert={!isShown}
      className={cn(
        'fixed bottom-[calc(1.5rem+var(--join-banner-height,0px))] right-6 z-50 hidden w-[360px] tablet:!block',
        'rounded-2xl border border-gray-200 bg-white p-4',
        'shadow-[0_16px_40px_-12px_rgba(15,23,42,0.28),0_2px_6px_-2px_rgba(15,23,42,0.08)]',
        'transition-[opacity,transform,bottom] duration-300 ease-out motion-reduce:transition-none',
        isShown ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
        className
      )}
    >
      <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-primary-700">
        <EyebrowIcon className="h-3.5 w-3.5" aria-hidden />
        {eyebrow.text}
      </p>
      <PromoBody {...content} onDismiss={dismiss} />
    </section>
  );
}

function PromoBody({
  preview,
  title,
  description,
  primaryAction,
  secondaryAction,
  onDismiss,
  buttonClassName,
}: HomePromoContent & {
  readonly onDismiss: () => void;
  readonly buttonClassName?: string;
}) {
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

      <div className="flex items-center gap-3 pr-6">
        <div aria-hidden className="w-32 shrink-0">
          {preview}
        </div>
        <div className="min-w-0">
          <h2 className="font-serif text-xl leading-tight text-gray-900">{title}</h2>
          <p className="mt-1 text-[13px] leading-snug text-gray-600">{description}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <PromoActionButton action={primaryAction} className={buttonClassName} />
        <PromoActionButton
          action={secondaryAction}
          variant="outlined"
          className={buttonClassName}
        />
      </div>
    </>
  );
}

function PromoActionButton({
  action,
  variant,
  className,
}: {
  readonly action: HomePromoAction;
  readonly variant?: 'outlined';
  readonly className?: string;
}) {
  const classes = cn('font-semibold', className);

  if ('href' in action) {
    return (
      <Link href={action.href} className={cn(buttonVariants({ variant }), classes)}>
        {action.label}
      </Link>
    );
  }

  return (
    <Button className={classes} variant={variant} onClick={action.onClick}>
      {action.label}
    </Button>
  );
}
