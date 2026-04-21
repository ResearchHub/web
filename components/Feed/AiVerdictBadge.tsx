'use client';

import { FC } from 'react';
import { ShieldCheck, ShieldQuestion, ShieldX } from 'lucide-react';
import { cn } from '@/utils/styles';
import { Tooltip } from '@/components/ui/Tooltip';
import type { OverallRating } from '@/types/aiPeerReview';

const AI_VERDICT_CONFIG: Record<
  Exclude<OverallRating, null>,
  { label: string; tooltip: string; badge: string; Icon: typeof ShieldCheck }
> = {
  excellent: {
    label: 'Excellent',
    tooltip: 'AI review: sufficient to test the hypothesis.',
    badge: 'bg-green-50 border-green-200 text-green-700',
    Icon: ShieldCheck,
  },
  good: {
    label: 'Good',
    tooltip: 'AI review: may be sufficient to test the hypothesis.',
    badge: 'bg-orange-50 border-orange-200 text-orange-600',
    Icon: ShieldQuestion,
  },
  poor: {
    label: 'Poor',
    tooltip: 'AI review: not sufficient to test the hypothesis.',
    badge: 'bg-red-50 border-red-200 text-red-600',
    Icon: ShieldX,
  },
};

interface AiVerdictBadgeProps {
  rating: OverallRating | null;
  className?: string;
}

export const AiVerdictBadge: FC<AiVerdictBadgeProps> = ({ rating, className }) => {
  if (!rating) return null;
  const cfg = AI_VERDICT_CONFIG[rating];
  const Icon = cfg.Icon;
  return (
    <Tooltip content={cfg.tooltip} width="w-56" position="top">
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium',
          cfg.badge,
          className
        )}
      >
        <Icon size={11} />
        {cfg.label}
      </span>
    </Tooltip>
  );
};
