import Link from 'next/link';
import { formatUsdShort } from '../data/rfp';

export interface ProposalRowData {
  href: string;
  title: string;
  imageUrl: string | null;
  authors: string[];
  raisedUsd: number | null;
  goalUsd: number | null;
  funded?: boolean;
}

/** One proposal: cover, title, who wrote it and how far its funding has come. */
export function ProposalRow({ p }: { p: ProposalRowData }) {
  const share = p.raisedUsd != null && p.goalUsd ? Math.min(1, p.raisedUsd / p.goalUsd) : null;
  return (
    <li>
      <Link href={p.href} className="group flex items-center gap-4 py-4">
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-[10px] object-cover" />
        ) : (
          <span
            aria-hidden
            className="h-16 w-16 shrink-0 rounded-[10px] bg-[rgb(var(--o-gold-rgb)/0.18)]"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[16px] leading-snug text-[var(--o-text)] group-hover:underline group-hover:decoration-[color:var(--o-line-2)] group-hover:underline-offset-4">
            {p.title}
          </p>
          {p.authors.length > 0 && (
            <p className="mt-1 truncate text-[13px] text-[var(--o-mute)]">
              {p.authors.slice(0, 2).join(', ')}
              {p.authors.length > 2 && ` +${p.authors.length - 2}`}
            </p>
          )}
          {p.raisedUsd != null && (
            <div className="mt-2 flex items-center gap-3 text-[12.5px] text-[var(--o-soft)]">
              {share != null && (
                <span
                  aria-hidden
                  className="h-1 w-24 overflow-hidden rounded-full bg-[rgb(var(--o-text-rgb)/0.1)]"
                >
                  <span
                    className="block h-full rounded-full bg-[var(--o-gold)]"
                    style={{ width: `${Math.max(share * 100, 2)}%` }}
                  />
                </span>
              )}
              <span className="tabular-nums">
                {formatUsdShort(p.raisedUsd)}
                {p.goalUsd ? ` of ${formatUsdShort(p.goalUsd)}` : ''}
                {p.funded && ' · funded'}
              </span>
            </div>
          )}
        </div>
      </Link>
    </li>
  );
}
