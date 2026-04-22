import type { CategoryBlock, CategoryScoreLabel } from '@/types/aiPeerReview';
import { cn } from '@/utils/styles';

interface CategorySectionProps {
  label: string;
  block: CategoryBlock;
}

const FILLED_FOR_SCORE: Record<CategoryScoreLabel, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
  'N/A': 0,
};

function ScoreBars({ score }: { score: CategoryScoreLabel }) {
  const filled = FILLED_FOR_SCORE[score] ?? 0;
  return (
    <span className="flex items-center gap-0.5 shrink-0" aria-label={`${score} score`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn('h-1.5 w-4 rounded-sm', i < filled ? 'bg-gray-700' : 'bg-gray-200')}
        />
      ))}
    </span>
  );
}

export function AiPeerReviewCategorySection({ label, block }: CategorySectionProps) {
  if (!block.rationale) return null;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <h5 className="text-sm font-medium text-gray-900">{label}</h5>
        <ScoreBars score={block.score} />
      </div>
      <p className="text-sm leading-relaxed text-gray-700">{block.rationale}</p>
    </div>
  );
}
