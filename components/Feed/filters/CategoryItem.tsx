import React, { useState } from 'react';
import { UnifiedCategory } from '@/types/category';
import { Brain, CheckSquare, Square } from 'lucide-react';

interface CategoryItemProps {
  category: UnifiedCategory;
  selectedSubcategories: string[];
  categoryIcon?: React.ElementType;
  onSubcategoryToggle: (subcategorySlug: string, categorySlug?: string) => void;
  onSelectAll?: (categorySlug: string, subcategorySlugs: string[]) => void;
  onDeselectAll?: (categorySlug: string, subcategorySlugs: string[]) => void;
}

export function CategoryItem({
  category,
  selectedSubcategories,
  categoryIcon: CategoryIcon = Brain,
  onSubcategoryToggle,
  onSelectAll,
  onDeselectAll,
}: CategoryItemProps) {
  const subcategories = category.subcategories || [];
  const selectedSubCount = subcategories.filter((sub) =>
    selectedSubcategories.includes(sub.slug)
  ).length;

  // Check if all subcategories are selected
  const allSelected = subcategories.length > 0 && selectedSubCount === subcategories.length;
  const someSelected = selectedSubCount > 0 && selectedSubCount < subcategories.length;

  // Sort subcategories by paper count (descending)
  const sortedSubcategories = [...subcategories].sort(
    (a, b) => (b.paperCount || 0) - (a.paperCount || 0)
  );

  const handleSelectAllToggle = () => {
    const subcategorySlugs = subcategories.map((sub) => sub.slug);
    if (allSelected) {
      onDeselectAll?.(category.slug, subcategorySlugs);
    } else {
      onSelectAll?.(category.slug, subcategorySlugs);
    }
  };

  return (
    <div className="relative rounded-lg overflow-hidden transition-all duration-200">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 flex-1">
            <div className={`p-1.5 rounded-lg bg-white shadow-sm text-gray-600`}>
              <CategoryIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 flex items-baseline gap-2">
              <h5 className="text-base font-semibold text-gray-900">{category.name}</h5>
              <span className="text-xs text-gray-500">
                {category.paperCount || 0} papers
                {selectedSubCount > 0 && (
                  <span className="ml-1 text-blue-600 font-medium">
                    • {selectedSubCount} selected
                  </span>
                )}
              </span>
            </div>
          </div>
          {/* Select All Checkbox */}
          {subcategories.length > 0 && (
            <button
              onClick={handleSelectAllToggle}
              className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
              title={allSelected ? 'Deselect all' : 'Select all'}
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-xs text-gray-600">Select all</span>
            </button>
          )}
        </div>

        {/* Subcategories */}
        <div className="flex flex-wrap gap-1.5">
          {sortedSubcategories.map((subcategory) => {
            const isSubSelected = selectedSubcategories.includes(subcategory.slug);
            return (
              <button
                key={subcategory.slug}
                onClick={(e) => {
                  e.stopPropagation();
                  onSubcategoryToggle(subcategory.slug, category.slug);
                }}
                className={`
                  px-3 py-1 rounded-md text-xs transition-all
                  flex items-center gap-1.5
                  ${
                    allSelected
                      ? 'bg-blue-50 text-blue-600 font-medium border border-blue-200 opacity-60 hover:opacity-80'
                      : isSubSelected
                        ? 'bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700 active:bg-blue-800'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 active:bg-gray-100'
                  }
                `}
              >
                <span>{subcategory.name}</span>
                <span
                  className={`text-[10px] font-medium ${
                    allSelected
                      ? 'text-blue-400'
                      : isSubSelected
                        ? 'text-blue-100'
                        : 'text-gray-400'
                  }`}
                >
                  {subcategory.paperCount || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
