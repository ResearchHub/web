'use client';

import { ArrowUpRight } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/styles';
import { CONCIERGE } from '@/constants/concierge';

interface ConciergeCardProps {
  readonly className?: string;
}

/**
 * For a funder, under the composer: a call with a PhD on the team, offered
 * as a person rather than a link, for anyone who would rather talk an
 * opportunity through than type it.
 */
export function ConciergeCard({ className }: ConciergeCardProps) {
  return (
    <a
      href={CONCIERGE.bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-primary-200 hover:bg-primary-50/40',
        className
      )}
    >
      <Avatar src={CONCIERGE.avatarUrl} alt="ResearchHub concierge" size={40} />
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium uppercase tracking-[0.07em] text-gray-500">
          Concierge
        </span>
        <span className="block text-sm font-medium text-gray-900">
          Book a call with a PhD to discuss your funding opportunity.
        </span>
      </span>
      <ArrowUpRight
        className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-primary-700"
        aria-hidden="true"
      />
    </a>
  );
}
