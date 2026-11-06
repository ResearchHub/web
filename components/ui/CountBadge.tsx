import { cn } from '@/utils/styles';

/**
 * A small count beside a label: a tab's, or a sidebar card's. Never narrower
 * than it is tall, so a one-digit count and a blank placeholder match.
 */
export function CountBadge({ count, className }: { count: number | string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex min-w-5 items-center justify-center rounded-md bg-gray-100 px-1.5 text-xs font-semibold leading-5 tabular-nums text-gray-700',
        className
      )}
    >
      {count}
    </span>
  );
}
