import React, { useMemo, useCallback, memo } from 'react';
import { Layers, Info } from 'lucide-react';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { CategoryItem } from './CategoryItem';
import { UnifiedCategory } from '@/types/category';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Microscope,
  Wrench,
  Users,
  Globe,
  DollarSign,
  BarChart3,
  Calculator,
  Monitor,
  FlaskConical,
  Atom,
} from 'lucide-react';

// Category icons mapping
const CATEGORY_ICONS: { [key: string]: React.ElementType } = {
  life_health_sciences: Microscope,
  engineering_technology: Wrench,
  social_behavioral_sciences: Users,
  earth_environmental_sciences: Globe,
  economics_finance: DollarSign,
  statistics_data_science: BarChart3,
  mathematics: Calculator,
  computer_data_sciences: Monitor,
  chemistry: FlaskConical,
  physical_sciences: Atom,
};

interface ResearchAreasSectionProps {
  categories: UnifiedCategory[];
  selectedCategories: string[];
  selectedSubcategories: string[];
  isExpanded?: boolean; // Make it optional since we won't use it
  onToggle?: () => void; // Make it optional
  onCategoryChange: (categories: string[]) => void;
  onSubcategoryChange: (subcategories: string[]) => void;
  hasActiveSelections?: boolean;
}

export function ResearchAreasSection({
  categories,
  selectedCategories,
  selectedSubcategories,
  isExpanded,
  onToggle,
  onCategoryChange,
  onSubcategoryChange,
  hasActiveSelections,
}: ResearchAreasSectionProps) {
  // Use a ref to prevent animation interruptions during selections
  const isSelectingRef = React.useRef(false);
  const animationTimeoutRef = React.useRef<NodeJS.Timeout>();

  const handleToggle = useCallback(() => {
    onToggle?.();
  }, [onToggle]);

  const handleSubcategoryToggle = useCallback(
    (subcategorySlug: string) => {
      // Mark that we're selecting to prevent animation interruptions
      isSelectingRef.current = true;

      // Clear any existing timeout
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }

      // Reset after a short delay
      animationTimeoutRef.current = setTimeout(() => {
        isSelectingRef.current = false;
      }, 300);

      const isSelected = selectedSubcategories.includes(subcategorySlug);

      if (isSelected) {
        const newSelection = selectedSubcategories.filter((s) => s !== subcategorySlug);
        onSubcategoryChange(newSelection);
      } else {
        const newSelection = [...selectedSubcategories, subcategorySlug];
        onSubcategoryChange(newSelection);
      }
    },
    [selectedSubcategories, onSubcategoryChange]
  );

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Generate description based on selected subcategories
  const description = useMemo(() => {
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
  }, [selectedSubcategories, categories]);

  return (
    <div className="mb-4 border-b border-gray-200 pb-4">
      <button
        onClick={handleToggle}
        className="flex items-start justify-between w-full hover:bg-gray-50 rounded-lg p-2 -m-2 transition-all duration-200"
      >
        <div className="flex gap-2 flex-1">
          <div className="mt-0.5">
            <Layers className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-gray-900">Research Areas</h4>
              {selectedSubcategories.length > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                  {selectedSubcategories.length}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-0.5">{description}</p>
          </div>
        </div>
        <div className="mt-0.5">
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.div>
        </div>
      </button>

      <motion.div
        layoutId="research-areas-content"
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{
          height: {
            duration: isSelectingRef.current ? 0 : 0.2,
            ease: 'easeInOut',
            // Prevent height from resetting during updates
            type: 'tween',
          },
          opacity: {
            duration: isSelectingRef.current ? 0 : 0.1,
            ease: 'easeInOut',
          },
        }}
        className="overflow-hidden"
        style={{
          willChange: 'height',
          // Force the element to stay in the rendering layer during selections
          transform: 'translateZ(0)',
          // Prevent layout shifts
          contain: 'layout',
        }}
      >
        <div className="mt-3">
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
                      <p className="text-sm font-medium text-amber-900">
                        No research areas selected
                      </p>
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
        </div>
      </motion.div>
    </div>
  );
}

// Export a fully self-contained version
export const SelfContainedResearchAreasSection = memo(
  function SelfContainedResearchAreasSection(props: ResearchAreasSectionProps) {
    // Use localStorage to persist state across re-renders
    const [internalIsOpen, setInternalIsOpen] = React.useState(() => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('researchAreasExpanded');
        return saved === 'true';
      }
      return false;
    });

    // Track if we're currently animating to prevent interruptions
    const isAnimatingRef = React.useRef(false);

    // Create stable handlers
    const stableToggle = React.useCallback(() => {
      if (isAnimatingRef.current) return;

      isAnimatingRef.current = true;
      setInternalIsOpen((prev) => {
        const newValue = !prev;
        if (typeof window !== 'undefined') {
          localStorage.setItem('researchAreasExpanded', String(newValue));
        }
        // Reset animation flag after animation completes
        setTimeout(() => {
          isAnimatingRef.current = false;
        }, 300);
        return newValue;
      });
    }, []);

    // Use a stable key for the inner component
    return (
      <ResearchAreasSection
        key="inner-research-areas"
        {...props}
        isExpanded={internalIsOpen}
        onToggle={stableToggle}
      />
    );
  },
  // Custom comparison to prevent re-renders when only callbacks change
  (prevProps, nextProps) => {
    // Helper to compare arrays by content
    const arraysEqual = (a: string[], b: string[]) => {
      if (a.length !== b.length) return false;
      // Sort arrays to ensure order doesn't matter
      const sortedA = [...a].sort();
      const sortedB = [...b].sort();
      return sortedA.every((val, idx) => val === sortedB[idx]);
    };

    // Don't re-render just because callbacks changed or if content is the same
    return (
      arraysEqual(prevProps.selectedSubcategories, nextProps.selectedSubcategories) &&
      prevProps.categories === nextProps.categories &&
      arraysEqual(prevProps.selectedCategories, nextProps.selectedCategories) &&
      // Ignore function props in comparison
      prevProps.onCategoryChange === prevProps.onCategoryChange &&
      prevProps.onSubcategoryChange === prevProps.onSubcategoryChange
    );
  }
);
