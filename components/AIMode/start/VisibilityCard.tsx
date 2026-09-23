import { Lock } from 'lucide-react';
import { cn } from '@/utils/styles';

interface VisibilityCardProps {
  readonly className?: string;
}

/**
 * For a researcher, under the composer, in the concierge card's shape: a
 * word on who will see the proposal, before any of it is written.
 */
export function VisibilityCard({ className }: VisibilityCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm',
        className
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"
      >
        <Lock className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium uppercase tracking-[0.07em] text-gray-500">
          Visibility
        </span>
        <span className="block text-sm font-medium text-gray-900">
          You control who sees your proposal: Public, or private to funder.
        </span>
      </span>
    </div>
  );
}
