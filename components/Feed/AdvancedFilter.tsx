'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import {
  GET_UNIFIED_CATEGORIES,
  UnifiedCategoriesResponse,
  UnifiedCategory,
  UnifiedSubcategory,
} from '@/lib/graphql/queries';
import { Loader } from '@/components/ui/Loader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import {
  ChevronDown,
  ChevronRight,
  Filter,
  X,
  Sparkles,
  Calendar,
  TrendingUp,
  Clock,
  Hash,
  Beaker,
  FileText,
  Search,
  Brain,
  Cpu,
  Globe,
  DollarSign,
  BarChart3,
  Calculator,
  Atom,
  FlaskConical,
  Microscope,
  Cog,
  Users,
  Check,
  ChevronUp,
  Database,
  Key,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdvancedFilterProps {
  selectedCategories: string[];
  selectedSubcategories: string[];
  selectedSources: string[];
  keywords: string[];
  timePeriod: string;
  sortBy: string;
  onFilterChange: (filters: {
    categories: string[];
    subcategories: string[];
    sources: string[];
    keywords: string[];
    timePeriod: string;
    sortBy: string;
  }) => void;
}

const TIME_PERIODS = [
  { value: 'LAST_24H', label: 'Today', icon: Clock },
  { value: 'LAST_3_DAYS', label: 'Last 3 Days', icon: Calendar },
  { value: 'LAST_WEEK', label: 'This Week', icon: Calendar },
  { value: 'LAST_MONTH', label: 'This Month', icon: TrendingUp },
  { value: 'LAST_3_MONTHS', label: 'Last 3 Months', icon: Hash },
];

const SORT_OPTIONS = [
  { value: 'best', label: 'Best', icon: Sparkles },
  { value: 'trending', label: 'Trending', icon: TrendingUp },
  { value: 'newest', label: 'Newest', icon: Clock },
];

const SOURCES = [
  { value: 'biorxiv', label: 'bioRxiv', logo: '/logos/biorxiv.jpg' },
  { value: 'arxiv', label: 'arXiv', logo: '/logos/arxiv.png' },
  { value: 'medrxiv', label: 'medRxiv', logo: '/logos/medrxiv.jpg' },
  { value: 'chemrxiv', label: 'chemRxiv', logo: '/logos/chemrxiv.png' },
];

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

export function AdvancedFilter({
  selectedCategories,
  selectedSubcategories,
  selectedSources,
  keywords,
  timePeriod,
  sortBy,
  onFilterChange,
}: AdvancedFilterProps) {
  const { loading, error, data } = useQuery<UnifiedCategoriesResponse>(GET_UNIFIED_CATEGORIES);
  const [keywordsInput, setKeywordsInput] = useState<string>(keywords.join(', '));
  const [tempKeywords, setTempKeywords] = useState<string>(keywords.join(', '));

  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    keywords: true,
    sources: true,
    researchAreas: true,
  });

  const categories = data?.unifiedCategories || [];

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryToggle = (categorySlug: string) => {
    const category = categories.find((c) => c.slug === categorySlug);
    if (!category) return;

    const isSelected = selectedCategories.includes(categorySlug);
    const categorySubcategories = category.subcategories.map((s) => s.slug);

    if (isSelected) {
      // Remove category and all its subcategories
      onFilterChange({
        categories: selectedCategories.filter((c) => c !== categorySlug),
        subcategories: selectedSubcategories.filter((s) => !categorySubcategories.includes(s)),
        sources: selectedSources,
        keywords,
        timePeriod,
        sortBy,
      });
    } else {
      // Add category
      onFilterChange({
        categories: [...selectedCategories, categorySlug],
        subcategories: selectedSubcategories,
        sources: selectedSources,
        keywords,
        timePeriod,
        sortBy,
      });
    }
  };

  const handleSubcategoryToggle = (subcategorySlug: string, categorySlug: string) => {
    const isSelected = selectedSubcategories.includes(subcategorySlug);

    if (isSelected) {
      onFilterChange({
        categories: selectedCategories,
        subcategories: selectedSubcategories.filter((s) => s !== subcategorySlug),
        sources: selectedSources,
        keywords,
        timePeriod,
        sortBy,
      });
    } else {
      onFilterChange({
        categories: selectedCategories,
        subcategories: [...selectedSubcategories, subcategorySlug],
        sources: selectedSources,
        keywords,
        timePeriod,
        sortBy,
      });
    }
  };

  const handleKeywordsSave = () => {
    // Parse keywords from comma-separated string
    const newKeywords = tempKeywords
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    setKeywordsInput(tempKeywords);
    onFilterChange({
      categories: selectedCategories,
      subcategories: selectedSubcategories,
      sources: selectedSources,
      keywords: newKeywords,
      timePeriod,
      sortBy,
    });
  };

  const clearAllFilters = () => {
    setKeywordsInput('');
    setTempKeywords('');
    onFilterChange({
      categories: [],
      subcategories: [],
      sources: [],
      keywords: [],
      timePeriod: 'LAST_WEEK',
      sortBy: 'best',
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
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Keywords Section */}
            <div className="mb-6 border-b border-gray-200 pb-6">
              <button
                onClick={() => toggleSection('keywords')}
                className="flex items-center justify-between w-full mb-3 hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-purple-600" />
                  <h4 className="text-sm font-medium text-gray-900">Keywords</h4>
                  {keywords.length > 0 && (
                    <Badge variant="default" className="text-xs bg-purple-100 text-purple-700">
                      {keywords.length}
                    </Badge>
                  )}
                </div>
                {expandedSections.keywords ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              <AnimatePresence>
                {expandedSections.keywords && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={tempKeywords}
                        onChange={(e) => setTempKeywords(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleKeywordsSave();
                          }
                        }}
                        placeholder="Enter comma-separated keywords (e.g., covid, molecular, artificial intelligence)"
                        className="flex-1"
                      />
                      <Button onClick={handleKeywordsSave} variant="default" className="px-4">
                        Save
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Separate multiple keywords with commas. Press Enter or click Save to apply.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sources Section */}
            <div className="mb-6 border-b border-gray-200 pb-6">
              <button
                onClick={() => toggleSection('sources')}
                className="flex items-center justify-between w-full mb-3 hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  <h4 className="text-sm font-medium text-gray-900">Sources</h4>
                  {selectedSources.length > 0 && (
                    <Badge variant="default" className="text-xs bg-blue-100 text-blue-700">
                      {selectedSources.length}
                    </Badge>
                  )}
                </div>
                {expandedSections.sources ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              <AnimatePresence>
                {expandedSections.sources && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-3">
                      {SOURCES.map((source) => {
                        const isSelected = selectedSources.includes(source.value);
                        // TODO: Get actual paper counts per source
                        const paperCount = Math.floor(Math.random() * 50000) + 10000; // Placeholder

                        return (
                          <button
                            key={source.value}
                            onClick={() => {
                              const newSources = isSelected
                                ? selectedSources.filter((s) => s !== source.value)
                                : [...selectedSources, source.value];
                              onFilterChange({
                                categories: selectedCategories,
                                subcategories: selectedSubcategories,
                                sources: newSources,
                                keywords,
                                timePeriod,
                                sortBy,
                              });
                            }}
                            className={`
                              flex flex-col items-center p-3 rounded-lg border-2 transition-all
                              ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                              }
                            `}
                          >
                            <img
                              src={source.logo}
                              alt={source.label}
                              className="h-8 w-auto mb-2 object-contain"
                            />
                            <span
                              className={`text-xs font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}
                            >
                              {source.label}
                            </span>
                            <span
                              className={`text-xs ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}
                            >
                              {paperCount.toLocaleString()}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Research Areas Section */}
            <div>
              <button
                onClick={() => toggleSection('researchAreas')}
                className="flex items-center justify-between w-full mb-3 hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-green-600" />
                  <h4 className="text-sm font-medium text-gray-900">Research Areas</h4>
                  {(selectedCategories.length > 0 || selectedSubcategories.length > 0) && (
                    <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                      {selectedCategories.length + selectedSubcategories.length}
                    </Badge>
                  )}
                </div>
                {expandedSections.researchAreas ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              <AnimatePresence>
                {expandedSections.researchAreas && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2">
                      {categories.map((category) => {
                        const isCategorySelected = selectedCategories.includes(category.slug);
                        const selectedSubCount = category.subcategories.filter((sub) =>
                          selectedSubcategories.includes(sub.slug)
                        ).length;
                        const CategoryIcon = CATEGORY_ICONS[category.slug] || Brain;

                        // Sort subcategories by paper count (descending)
                        const sortedSubcategories = [...category.subcategories].sort(
                          (a, b) => (b.paperCount || 0) - (a.paperCount || 0)
                        );

                        return (
                          <div
                            key={category.slug}
                            className={`
                        relative border rounded-lg overflow-hidden transition-all duration-200
                        bg-gradient-to-r from-gray-50 to-gray-50 border-gray-200 hover:border-gray-300
                        ${isCategorySelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                      `}
                          >
                            {/* Category Header - More compact */}
                            <div className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3 flex-1">
                                  <div
                                    className={`
                              p-1.5 rounded-lg bg-white shadow-sm
                              ${isCategorySelected ? 'text-blue-600' : 'text-gray-600'}
                            `}
                                  >
                                    <CategoryIcon className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 flex items-baseline gap-2">
                                    <h5 className="text-base font-semibold text-gray-900">
                                      {category.name}
                                    </h5>
                                    <span className="text-xs text-gray-500">
                                      {category.paperCount || 0} papers
                                      {selectedSubCount > 0 && !isCategorySelected && (
                                        <span className="ml-1 text-blue-600 font-medium">
                                          • {selectedSubCount} selected
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                </div>

                                {/* Select category button - smaller */}
                                <button
                                  onClick={() => handleCategoryToggle(category.slug)}
                                  className={`
                              p-1.5 rounded-md transition-colors
                              ${
                                isCategorySelected
                                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                  : 'bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                              }
                            `}
                                  title={
                                    isCategorySelected
                                      ? 'Deselect category'
                                      : 'Select entire category'
                                  }
                                >
                                  {isCategorySelected ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <div className="w-4 h-4 border-2 border-current rounded" />
                                  )}
                                </button>
                              </div>

                              {/* Subcategories - Smaller pills */}
                              <div className="flex flex-wrap gap-1.5">
                                {sortedSubcategories.map((subcategory) => {
                                  const isSubSelected = selectedSubcategories.includes(
                                    subcategory.slug
                                  );
                                  return (
                                    <button
                                      key={subcategory.slug}
                                      onClick={() =>
                                        handleSubcategoryToggle(subcategory.slug, category.slug)
                                      }
                                      className={`
                                  px-3 py-1 rounded-md text-xs transition-all
                                  flex items-center gap-1.5
                                  ${
                                    isSubSelected
                                      ? 'bg-blue-600 text-white font-medium shadow-sm'
                                      : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                                  }
                                `}
                                    >
                                      <span>{subcategory.name}</span>
                                      <span
                                        className={`text-[10px] font-medium ${isSubSelected ? 'text-blue-100' : 'text-gray-400'}`}
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
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Active Filters Display */}
      {(selectedCategories.length > 0 ||
        selectedSubcategories.length > 0 ||
        selectedSources.length > 0 ||
        keywords.length > 0) && (
        <div className="flex flex-wrap gap-2 mt-3">
          {keywords.map((keyword, index) => (
            <Badge
              key={`keyword-${index}`}
              variant="default"
              className="text-xs bg-purple-100 text-purple-700"
            >
              {keyword}
              <button
                onClick={() => {
                  const newKeywords = keywords.filter((_, i) => i !== index);
                  setKeywordsInput(newKeywords.join(', '));
                  onFilterChange({
                    categories: selectedCategories,
                    subcategories: selectedSubcategories,
                    sources: selectedSources,
                    keywords: newKeywords,
                    timePeriod,
                    sortBy,
                  });
                }}
                className="ml-1.5 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {selectedCategories.map((catSlug) => {
            const category = categories.find((c) => c.slug === catSlug);
            if (!category) return null;
            return (
              <Badge key={catSlug} variant="default" className="text-xs">
                {category.name}
                <button
                  onClick={() => handleCategoryToggle(catSlug)}
                  className="ml-1.5 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
          {selectedSubcategories.map((subSlug) => {
            const category = categories.find((c) =>
              c.subcategories.some((s) => s.slug === subSlug)
            );
            const subcategory = category?.subcategories.find((s) => s.slug === subSlug);
            if (!subcategory) return null;
            return (
              <Badge key={subSlug} variant="default" className="text-xs bg-blue-100 text-blue-700">
                {subcategory.name}
                <button
                  onClick={() => handleSubcategoryToggle(subSlug, category!.slug)}
                  className="ml-1.5 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
          {selectedSources.map((source) => {
            const sourceInfo = SOURCES.find((s) => s.value === source);
            if (!sourceInfo) return null;
            return (
              <Badge key={source} className="text-xs bg-gray-100 text-gray-700">
                {sourceInfo.label}
                <button
                  onClick={() => {
                    onFilterChange({
                      categories: selectedCategories,
                      subcategories: selectedSubcategories,
                      sources: selectedSources.filter((s) => s !== source),
                      keywords,
                      timePeriod,
                      sortBy,
                    });
                  }}
                  className="ml-1.5 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
