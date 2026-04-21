import { ShieldCheck, ShieldQuestion, ShieldX } from 'lucide-react';
import type { OverallRating } from '@/types/aiPeerReview';
import { cn } from '@/utils/styles';

interface AiPeerReviewVerdictBadgeProps {
  rating: OverallRating | null;
}

const VERDICT_CONFIG: Record<
  Exclude<OverallRating, null>,
  { text: string; color: string; Icon: typeof ShieldCheck }
> = {
  excellent: {
    text: 'The proposal is sufficient to test the hypothesis.',
    color: 'text-green-600',
    Icon: ShieldCheck,
  },
  good: {
    text: 'The proposal may be sufficient to test the hypothesis.',
    color: 'text-orange-500',
    Icon: ShieldQuestion,
  },
  poor: {
    text: 'The proposal is not sufficient to test the hypothesis.',
    color: 'text-red-600',
    Icon: ShieldX,
  },
};

export function AiPeerReviewVerdictBadge({ rating }: AiPeerReviewVerdictBadgeProps) {
  if (!rating) return null;
  const cfg = VERDICT_CONFIG[rating];
  const Icon = cfg.Icon;
  return (
    <div className={cn('flex items-center gap-2', cfg.color)}>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="text-sm font-medium">{cfg.text}</span>
    </div>
  );
}
