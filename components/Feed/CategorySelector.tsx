'use client';

import { useQuery } from '@apollo/client';
import { GET_CATEGORIES, CategoriesResponse } from '@/lib/graphql/queries';
import { Badge } from '@/components/ui/Badge';
import { Loader } from '@/components/ui/Loader';
import { Alert } from '@/components/ui/Alert';
import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategorySelectorProps {
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
}

export function CategorySelector({ selectedCategories, onCategoryChange }: CategorySelectorProps) {
  const { loading, error, data } = useQuery<CategoriesResponse>(GET_CATEGORIES);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const categories = data?.categoriesWithCounts || [];

  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
      }
    };

    checkScroll();
    const container = scrollContainerRef.current;
    container?.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      container?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [categories]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleCategoryToggle = (categoryName: string) => {
    if (selectedCategories.includes(categoryName)) {
      onCategoryChange(selectedCategories.filter(c => c !== categoryName));
    } else {
      onCategoryChange([...selectedCategories, categoryName]);
    }
  };

  const handleClearAll = () => {
    onCategoryChange([]);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 mb-6 p-3 bg-gray-50 rounded-lg">
        <Loader size="small" />
        <span className="text-sm text-gray-600">Loading categories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <Alert.Title>Error loading categories</Alert.Title>
        <Alert.Description>{error.message}</Alert.Description>
      </Alert>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Filter by Category</h3>
        {selectedCategories.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            Clear all ({selectedCategories.length})
          </button>
        )}
      </div>

      <div className="relative">
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm p-1 rounded-full shadow-md hover:bg-gray-50 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category.name);
            return (
              <button
                key={category.name}
                onClick={() => handleCategoryToggle(category.name)}
                className={`
                  inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium
                  whitespace-nowrap transition-all transform hover:scale-105
                  ${isSelected 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <span>{category.displayName}</span>
                {category.paperCount !== null && (
                  <span className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                    ({category.paperCount})
                  </span>
                )}
                {category.recentPapersCount !== null && category.recentPapersCount > 0 && (
                  <span className={`
                    inline-flex items-center justify-center w-2 h-2 rounded-full
                    ${isSelected ? 'bg-white' : 'bg-green-500'}
                  `} title={`${category.recentPapersCount} new papers this week`} />
                )}
              </button>
            );
          })}
        </div>

        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm p-1 rounded-full shadow-md hover:bg-gray-50 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}