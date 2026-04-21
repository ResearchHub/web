import type { CategoryBlock } from '@/types/aiPeerReview';

interface CategorySectionProps {
  label: string;
  block: CategoryBlock;
}

export function AiPeerReviewCategorySection({ label, block }: CategorySectionProps) {
  if (!block.rationale) return null;
  return (
    <div>
      <h5 className="mb-1 text-sm font-medium text-gray-900">{label}</h5>
      <p className="text-sm leading-relaxed text-gray-700">{block.rationale}</p>
    </div>
  );
}
