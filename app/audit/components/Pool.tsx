import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/styles';
import { formatUsd, poolPercent, type RfpView } from '../data/rfp';

/** Progress toward the goal; a sliver always shows once anyone has given. */
export function PoolBar({ rfp, className }: { rfp: RfpView; className?: string }) {
  const pct = poolPercent(rfp);
  const shown = pct > 0 ? Math.max(pct, 1.5) : 0;
  return (
    <div
      role="img"
      aria-label={`${formatUsd(rfp.raisedUsd)} raised of a ${formatUsd(rfp.goalUsd)} goal`}
      className={cn('h-2 overflow-hidden rounded-[2px] bg-[rgb(var(--a-ink-rgb)/0.1)]', className)}
    >
      <span className="block h-full bg-[var(--a-red)]" style={{ width: `${shown}%` }} />
    </div>
  );
}

/** The top backers' faces, overlapping, up to `max`; each links to their profile. */
export function BackerFaces({ rfp, size, max = 10 }: { rfp: RfpView; size: number; max?: number }) {
  if (rfp.backers.length === 0) return null;
  return (
    <span className="flex shrink-0 -space-x-2">
      {rfp.backers.slice(0, max).map((b) => (
        <span
          key={b.id}
          className="relative flex rounded-full ring-2 ring-[var(--a-sheet)] hover:z-10"
        >
          <Avatar src={b.avatarUrl} alt={b.name} size={size} authorId={b.authorId} />
        </span>
      ))}
    </span>
  );
}
