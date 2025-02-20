import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ReviewCategory {
  id: string;
  title: string;
  description: string;
}

export const REVIEW_CATEGORIES: ReviewCategory[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    description:
      "Does the introduction clearly articulate the research question and provide adequate context? Is the study's significance within the field convincingly established?",
  },
  {
    id: 'methods',
    title: 'Methods',
    description:
      "Does the study design test the authors' hypothesis? Are the methods described in enough detail for independent replication?",
  },
  {
    id: 'results',
    title: 'Results',
    description:
      "Were the study's findings analyzed and interpreted reasonably? Is the resulting data open and auditable? Are the figures of high resolution, describe data appropriately and adequately labelled?",
  },
  {
    id: 'discussion',
    title: 'Discussion',
    description:
      "Do the results support the authors' conclusions? Are there any alternative interpretations of the study's findings that the authors should have considered?",
  },
];

interface ReviewCategoriesProps {
  onSelectCategory: (category: ReviewCategory) => void;
  disabled?: boolean;
}

export const ReviewCategories = ({ onSelectCategory, disabled = false }: ReviewCategoriesProps) => {
  return (
    <BaseMenu
      align="start"
      trigger={
        <Button variant="ghost" size="sm" disabled={disabled} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Add Review Category</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      }
    >
      {REVIEW_CATEGORIES.map((category) => (
        <BaseMenuItem
          key={category.id}
          onClick={() => onSelectCategory(category)}
          className="flex flex-col items-start p-3 hover:bg-gray-50"
        >
          <div className="font-medium">{category.title}</div>
          <div className="text-sm text-gray-600 mt-1">{category.description}</div>
        </BaseMenuItem>
      ))}
    </BaseMenu>
  );
};
