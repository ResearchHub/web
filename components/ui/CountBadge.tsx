import { cn } from '@/utils/styles';

/** A small count beside a label: a tab's, or a fact's. */
export function CountBadge({ count, className }: { count: number | string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md bg-gray-100 px-1.5 text-xs font-semibold leading-5 tabular-nums text-gray-700',
        className
      )}
    >
      {count}
    </span>
  );
}
