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
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Switch } from '@/components/ui/Switch';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
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
  Info,
  Save,
  History,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SavedFilter {
  id: string;
  name: string;
  description: string;
  categories: string[];
  subcategories: string[];
  sources: string[];
  keywords: string[];
  timePeriod: string;
  sortBy: string;
  useMlScoring: boolean;
  createdAt: Date;
}

interface AdvancedFilterProps {
  selectedCategories: string[];
  selectedSubcategories: string[];
  selectedSources: string[];
  keywords: string[];
  timePeriod: string;
  sortBy: string;
  useMlScoring: boolean;
  isUpdating?: boolean;
  onFilterChange: (filters: {
    categories: string[];
    subcategories: string[];
    sources: string[];
    keywords: string[];
    timePeriod: string;
    sortBy: string;
    useMlScoring: boolean;
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
  useMlScoring,
  isUpdating = false,
  onFilterChange,
}: AdvancedFilterProps) {
  const { loading, error, data } = useQuery<UnifiedCategoriesResponse>(GET_UNIFIED_CATEGORIES);
  const [keywordsInput, setKeywordsInput] = useState<string>(keywords.join(', '));
  const [tempKeywords, setTempKeywords] = useState<string>(keywords.join(', '));

  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    keywords: false,
    sources: false,
    researchAreas: false,
    mlScoring: false,
  });

  // State for expanded categories (show more subcategories)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // State for saved filters
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => {
    try {
      const saved = localStorage.getItem('researchhub_saved_filters');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const INITIAL_SUBCATEGORIES_SHOWN = 5;

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
        useMlScoring,
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
        useMlScoring,
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
        useMlScoring,
      });
    } else {
      onFilterChange({
        categories: selectedCategories,
        subcategories: [...selectedSubcategories, subcategorySlug],
        sources: selectedSources,
        keywords,
        timePeriod,
        sortBy,
        useMlScoring,
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
      useMlScoring,
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
      useMlScoring: false,
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
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-3 mb-4 -mx-4 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">
              {activeFilterCount === 0
                ? 'Showing all papers'
                : `${activeFilterCount} filter${activeFilterCount === 1 ? '' : 's'} active`}
            </span>
            {activeFilterCount === 0 && (
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute left-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  When no categories are selected, papers from all research areas will be shown in
                  your feed.
                </div>
              </div>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

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
            <CollapsibleSection
              title="Keywords"
              icon={<Key className="w-5 h-5 text-purple-600" />}
              isExpanded={expandedSections.keywords}
              onToggle={() => toggleSection('keywords')}
              className="mb-6 border-b border-gray-200 pb-6"
              badge={keywords.length > 0 ? keywords.length : undefined}
              badgeColor="purple"
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
            </CollapsibleSection>

            {/* Research Areas Section */}
            <CollapsibleSection
              title="Research Areas"
              icon={<Layers className="w-5 h-5 text-green-600" />}
              isExpanded={expandedSections.researchAreas}
              onToggle={() => toggleSection('researchAreas')}
              className="mb-6 border-b border-gray-200 pb-6"
              badge={selectedSubcategories.length > 0 ? selectedSubcategories.length : undefined}
              badgeColor="green"
            >
              {/* Empty state message when no categories selected */}
              {categories.length > 0 &&
                selectedCategories.length === 0 &&
                selectedSubcategories.length === 0 && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Showing papers from all research areas
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Select specific categories below to narrow your results
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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

                  const isExpanded = expandedCategories.has(category.slug);
                  const visibleSubcategories = isExpanded
                    ? sortedSubcategories
                    : sortedSubcategories.slice(0, INITIAL_SUBCATEGORIES_SHOWN);
                  const hasMoreSubcategories =
                    sortedSubcategories.length > INITIAL_SUBCATEGORIES_SHOWN;

                  return (
                    <div
                      key={category.slug}
                      className="relative rounded-lg overflow-hidden transition-all duration-200"
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
                        </div>

                        {/* Subcategories - Smaller pills */}
                        <div className="flex flex-wrap gap-1.5">
                          {/* All button */}
                          <button
                            onClick={() => {
                              if (selectedSubCount > 0) {
                                // Deselect all subcategories in this category
                                const categorySubSlugs = category.subcategories.map((s) => s.slug);
                                onFilterChange({
                                  categories: selectedCategories,
                                  subcategories: selectedSubcategories.filter(
                                    (s) => !categorySubSlugs.includes(s)
                                  ),
                                  sources: selectedSources,
                                  keywords,
                                  timePeriod,
                                  sortBy,
                                  useMlScoring,
                                });
                              }
                              // If no subcategories are selected (All is active), do nothing
                            }}
                            className={`
                              px-3 py-1 rounded-md text-xs transition-all
                              flex items-center gap-1.5 font-medium
                              ${
                                selectedSubCount === 0
                                  ? 'bg-blue-600 text-white shadow-sm cursor-default'
                                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 cursor-pointer'
                              }
                            `}
                          >
                            <span>All</span>
                            <span
                              className={`text-[10px] font-medium ${
                                selectedSubCount === 0 ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              {category.paperCount || 0}
                            </span>
                          </button>
                          {visibleSubcategories.map((subcategory) => {
                            const isSubSelected = selectedSubcategories.includes(subcategory.slug);
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
                          {hasMoreSubcategories && (
                            <button
                              onClick={() => {
                                setExpandedCategories((prev) => {
                                  const newSet = new Set(prev);
                                  if (isExpanded) {
                                    newSet.delete(category.slug);
                                  } else {
                                    newSet.add(category.slug);
                                  }
                                  return newSet;
                                });
                              }}
                              className="px-3 py-1 rounded-md text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              {isExpanded
                                ? 'Show less'
                                : `Show ${sortedSubcategories.length - INITIAL_SUBCATEGORIES_SHOWN} more`}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>

            {/* Advanced Options Section */}
            <CollapsibleSection
              title="Advanced Options"
              icon={<Brain className="w-5 h-5 text-indigo-600" />}
              isExpanded={expandedSections.mlScoring}
              onToggle={() => toggleSection('mlScoring')}
              className="mb-6 border-b border-gray-200 pb-6"
              badge={useMlScoring ? 1 : undefined}
              badgeColor="indigo"
            >
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">ML-Powered Scoring</h5>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Use machine learning to rank papers based on relevance and quality
                    </p>
                  </div>
                </div>
                <Switch
                  checked={useMlScoring}
                  onCheckedChange={(checked) => {
                    onFilterChange({
                      categories: selectedCategories,
                      subcategories: selectedSubcategories,
                      sources: selectedSources,
                      keywords,
                      timePeriod,
                      sortBy,
                      useMlScoring: checked,
                    });
                  }}
                />
              </div>
            </CollapsibleSection>

            {/* Sources Section */}
            <CollapsibleSection
              title="Sources"
              icon={<Database className="w-5 h-5 text-blue-600" />}
              isExpanded={expandedSections.sources}
              onToggle={() => toggleSection('sources')}
              className=""
              badge={selectedSources.length > 0 ? selectedSources.length : undefined}
              badgeColor="blue"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* All sources button */}
                <button
                  onClick={() => {
                    if (selectedSources.length > 0) {
                      // Deselect all sources
                      onFilterChange({
                        categories: selectedCategories,
                        subcategories: selectedSubcategories,
                        sources: [],
                        keywords,
                        timePeriod,
                        sortBy,
                        useMlScoring,
                      });
                    }
                    // If no sources are selected (All is active), do nothing
                  }}
                  className={`
                          flex flex-col items-center p-3 rounded-lg border-2 transition-all
                          ${
                            selectedSources.length === 0
                              ? 'border-blue-500 bg-blue-50 cursor-default'
                              : 'border-gray-200 bg-white hover:border-gray-300 cursor-pointer'
                          }
                        `}
                >
                  <div className="h-8 w-8 mx-auto flex items-center justify-center mb-2">
                    <span
                      className={`text-lg font-bold ${selectedSources.length === 0 ? 'text-blue-600' : 'text-gray-600'}`}
                    >
                      ALL
                    </span>
                  </div>
                  <span
                    className={`text-xs font-medium ${selectedSources.length === 0 ? 'text-blue-700' : 'text-gray-700'}`}
                  >
                    All Sources
                  </span>
                  <span
                    className={`text-xs ${selectedSources.length === 0 ? 'text-blue-600' : 'text-gray-500'}`}
                  >
                    {SOURCES.length} sources
                  </span>
                </button>
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
                          useMlScoring,
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
                        className="h-8 w-8 mb-2 object-contain"
                      />
                      <span
                        className={`text-xs font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}
                      >
                        {source.label}
                      </span>
                      <span className={`text-xs ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                        {paperCount.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CollapsibleSection>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
