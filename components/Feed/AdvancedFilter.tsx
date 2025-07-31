'use client';

import { useState, memo, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES, CategoriesResponse } from '@/lib/graphql/queries';
import { Loader } from '@/components/ui/Loader';
import { Alert } from '@/components/ui/Alert';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterSummaryBar } from './filters/FilterSummaryBar';
import { KeywordsSection } from './filters/KeywordsSection';
import {
  ResearchAreasSection,
  SelfContainedResearchAreasSection,
} from './filters/ResearchAreasSection';
import { AdminSection } from './filters/AdminSection';
import { SOURCES } from './filters/constants';

interface AdvancedFilterProps {
  selectedCategories: string[];
  selectedSubcategories: string[];
  selectedSources: string[];
  keywords: string[];
  timePeriod: string;
  sortBy: string;
  useMlScoring: boolean;
  hasEnrichment?: boolean;
  isUpdating?: boolean;
  onFilterChange: (filters: {
    categories: string[];
    subcategories: string[];
    sources: string[];
    keywords: string[];
    timePeriod: string;
    sortBy: string;
    useMlScoring: boolean;
    hasEnrichment: boolean;
  }) => void;
}

function AdvancedFilterComponent({
  selectedCategories,
  selectedSubcategories,
  selectedSources,
  keywords,
  timePeriod,
  sortBy,
  useMlScoring,
  hasEnrichment = true, // Default to true
  isUpdating = false,
  onFilterChange,
}: AdvancedFilterProps) {
  const { loading, error, data } = useQuery<CategoriesResponse>(GET_CATEGORIES, {
    variables: {
      minPaperCount: 0,
      includeEmptySubcategories: true,
    },
  });

  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    keywords: false,
    admin: false,
    researchAreas: false, // Closed by default
  });

  // Get categories directly from the response
  const categories = data?.categories || [];

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleKeywordsChange = (newKeywords: string[]) => {
    onFilterChange({
      categories: selectedCategories,
      subcategories: selectedSubcategories,
      sources: selectedSources,
      keywords: newKeywords,
      timePeriod,
      sortBy,
      useMlScoring,
      hasEnrichment,
    });
  };

  const handleCategoriesChange = useCallback(
    (newCategories: string[]) => {
      onFilterChange({
        categories: newCategories,
        subcategories: selectedSubcategories,
        sources: selectedSources,
        keywords,
        timePeriod,
        sortBy,
        useMlScoring,
        hasEnrichment,
      });
    },
    [
      selectedSubcategories,
      selectedSources,
      keywords,
      timePeriod,
      sortBy,
      useMlScoring,
      hasEnrichment,
      onFilterChange,
    ]
  );

  const handleSubcategoriesChange = useCallback(
    (newSubcategories: string[]) => {
      onFilterChange({
        categories: selectedCategories,
        subcategories: newSubcategories,
        sources: selectedSources,
        keywords,
        timePeriod,
        sortBy,
        useMlScoring,
        hasEnrichment,
      });
    },
    [
      selectedCategories,
      selectedSources,
      keywords,
      timePeriod,
      sortBy,
      useMlScoring,
      hasEnrichment,
      onFilterChange,
    ]
  );

  const handleSourcesChange = (newSources: string[]) => {
    onFilterChange({
      categories: selectedCategories,
      subcategories: selectedSubcategories,
      sources: newSources,
      keywords,
      timePeriod,
      sortBy,
      useMlScoring,
      hasEnrichment,
    });
  };

  const handleMlScoringChange = (enabled: boolean) => {
    onFilterChange({
      categories: selectedCategories,
      subcategories: selectedSubcategories,
      sources: selectedSources,
      keywords,
      timePeriod,
      sortBy,
      useMlScoring: enabled,
      hasEnrichment,
    });
  };

  const handleEnrichmentChange = (enabled: boolean) => {
    onFilterChange({
      categories: selectedCategories,
      subcategories: selectedSubcategories,
      sources: selectedSources,
      keywords,
      timePeriod,
      sortBy,
      useMlScoring,
      hasEnrichment: enabled,
    });
  };

  const clearAllFilters = () => {
    onFilterChange({
      categories: [],
      subcategories: [],
      sources: [], // Empty array means no sources selected
      keywords: [],
      timePeriod: 'LAST_WEEK',
      sortBy: 'best',
      useMlScoring: true, // ML scoring stays on when clearing
      hasEnrichment: true, // Default to true
    });
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedSubcategories.length +
    selectedSources.length +
    keywords.length;

  if (loading) {
    return (
      <div className="flex items-center gap-2 mb-6 p-3 bg-gray-50 rounded-lg">
        <Loader size="sm" />
        <span className="text-sm text-gray-600">Loading filters...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" className="mb-6">
        <span className="font-semibold">Error loading filters</span>
        <p>{error.message}</p>
      </Alert>
    );
  }

  return (
    <div className="mb-6">
      {/* Filter Summary Bar */}
      <FilterSummaryBar activeFilterCount={activeFilterCount} onClearAll={clearAllFilters} />

      {/* Filter Panel */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Customize Results</h3>
              <div className="flex items-center gap-3">
                {isUpdating && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader size="sm" />
                    <span>Updating...</span>
                  </div>
                )}
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>

            {/* Keywords Section */}
            <KeywordsSection
              keywords={keywords}
              isExpanded={expandedSections.keywords}
              onToggle={() => toggleSection('keywords')}
              onKeywordsChange={handleKeywordsChange}
            />

            {/* Research Areas Section */}
            <SelfContainedResearchAreasSection
              key="research-areas-section"
              categories={categories || []}
              selectedCategories={selectedCategories}
              selectedSubcategories={selectedSubcategories}
              onCategoryChange={handleCategoriesChange}
              onSubcategoryChange={handleSubcategoriesChange}
            />

            {/* Advanced Section - ML Scoring and Sources */}
            <AdminSection
              useMlScoring={useMlScoring}
              hasEnrichment={hasEnrichment}
              sources={SOURCES}
              selectedSources={selectedSources}
              isExpanded={expandedSections.admin}
              onToggle={() => toggleSection('admin')}
              onMlScoringChange={handleMlScoringChange}
              onEnrichmentChange={handleEnrichmentChange}
              onSourcesChange={handleSourcesChange}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Export memoized version of AdvancedFilter
export const AdvancedFilter = memo(AdvancedFilterComponent);
