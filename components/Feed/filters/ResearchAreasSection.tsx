import React from 'react';
import { Layers, Info } from 'lucide-react';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { CategoryItem } from './CategoryItem';
import { UnifiedCategory } from '@/types/category';
import {
  Microscope,
  Cog,
  Users,
  Globe,
  DollarSign,
  BarChart3,
  Calculator,
  Cpu,
  FlaskConical,
  Atom,
} from 'lucide-react';

// Category icons mapping
const CATEGORY_ICONS: { [key: string]: React.ElementType } = {
  life_sciences: Microscope,
  engineering: Cog,
  social_sciences: Users,
  earth_environmental_sciences: Globe,
  economics_finance: DollarSign,
  statistics_data_science: BarChart3,
  mathematics: Calculator,
  computer_science: Cpu,
  chemistry: FlaskConical,
  physics: Atom,
};

interface ResearchAreasSectionProps {
  categories: UnifiedCategory[];
  selectedCategories: string[];
  selectedSubcategories: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onCategoryChange: (categories: string[]) => void;
  onSubcategoryChange: (subcategories: string[]) => void;
}

export function ResearchAreasSection({
  categories,
  selectedCategories,
  selectedSubcategories,
  isExpanded,
  onToggle,
  onCategoryChange,
  onSubcategoryChange,
}: ResearchAreasSectionProps) {
  const handleSubcategoryToggle = (subcategorySlug: string) => {
    const isSelected = selectedSubcategories.includes(subcategorySlug);

    if (isSelected) {
      const newSelection = selectedSubcategories.filter((s) => s !== subcategorySlug);
      onSubcategoryChange(newSelection);
    } else {
      const newSelection = [...selectedSubcategories, subcategorySlug];
      onSubcategoryChange(newSelection);
    }
  };

  // Generate description based on selected subcategories
  const getDescription = () => {
    if (selectedSubcategories.length === 0) {
      return 'No research areas selected';
    }

    // Get names of selected subcategories
    const selectedNames: string[] = [];
    categories.forEach((category) => {
      (category.subcategories || []).forEach((sub) => {
        if (selectedSubcategories.includes(sub.slug)) {
          selectedNames.push(sub.name);
        }
      });
    });

    if (selectedNames.length <= 3) {
      return selectedNames.join(', ');
    } else {
      return `${selectedNames.slice(0, 3).join(', ')} +${selectedNames.length - 3} more`;
    }
  };

  return (
    <CollapsibleSection
      title="Research Areas"
      icon={<Layers className="w-5 h-5 text-green-600" />}
      isExpanded={isExpanded}
      onToggle={onToggle}
      className="mb-4 border-b border-gray-200 pb-4"
      badge={selectedSubcategories.length > 0 ? selectedSubcategories.length : undefined}
      badgeColor="green"
      description={getDescription()}
    >
      {/* Show message when no categories are available */}
      {categories.length === 0 ? (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">No research areas available</p>
              <p className="text-xs text-gray-600 mt-1">
                Research area categories are currently being loaded. Please try again later.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Empty state message when no categories selected */}
          {selectedSubcategories.length === 0 && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">No research areas selected</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Select specific research areas below to filter papers
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {categories.map((category) => (
              <CategoryItem
                key={category.slug}
                category={category}
                selectedSubcategories={selectedSubcategories}
                categoryIcon={CATEGORY_ICONS[category.slug]}
                onSubcategoryToggle={handleSubcategoryToggle}
              />
            ))}
          </div>
        </>
      )}
    </CollapsibleSection>
  );
}
