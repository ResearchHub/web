import React from 'react';
import { Database } from 'lucide-react';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';

interface Source {
  value: string;
  label: string;
  logo: string;
}

interface SourcesSectionProps {
  sources: Source[];
  selectedSources: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onSourcesChange: (sources: string[]) => void;
}

export function SourcesSection({
  sources,
  selectedSources,
  isExpanded,
  onToggle,
  onSourcesChange,
}: SourcesSectionProps) {
  const handleSourceToggle = (sourceValue: string) => {
    const newSources = selectedSources.includes(sourceValue)
      ? selectedSources.filter((s) => s !== sourceValue)
      : [...selectedSources, sourceValue];
    onSourcesChange(newSources);
  };

  const handleAllSourcesClick = () => {
    if (selectedSources.length > 0) {
      onSourcesChange([]);
    }
  };

  // Generate description based on selected sources
  const getDescription = () => {
    if (selectedSources.length === 0) {
      return 'All sources';
    }

    const selectedLabels = selectedSources.map((value) => {
      const source = sources.find((s) => s.value === value);
      return source?.label || value;
    });

    if (selectedLabels.length <= 3) {
      return selectedLabels.join(', ');
    } else {
      return `${selectedLabels.slice(0, 3).join(', ')} +${selectedLabels.length - 3} more`;
    }
  };

  return (
    <CollapsibleSection
      title="Sources"
      icon={<Database className="w-5 h-5 text-blue-600" />}
      isExpanded={isExpanded}
      onToggle={onToggle}
      className=""
      badge={selectedSources.length > 0 ? selectedSources.length : undefined}
      badgeColor="blue"
      description={getDescription()}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* All sources button */}
        <button
          onClick={handleAllSourcesClick}
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
              className={`text-lg font-bold ${
                selectedSources.length === 0 ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              ALL
            </span>
          </div>
          <span
            className={`text-xs font-medium ${
              selectedSources.length === 0 ? 'text-blue-700' : 'text-gray-700'
            }`}
          >
            All Sources
          </span>
          <span
            className={`text-xs ${
              selectedSources.length === 0 ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            {sources.length} sources
          </span>
        </button>

        {sources.map((source) => {
          const isSelected = selectedSources.includes(source.value);
          // TODO: Get actual paper counts per source
          const paperCount = Math.floor(Math.random() * 50000) + 10000; // Placeholder

          return (
            <button
              key={source.value}
              onClick={() => handleSourceToggle(source.value)}
              className={`
                flex flex-col items-center p-3 rounded-lg border-2 transition-all
                ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <img src={source.logo} alt={source.label} className="h-8 w-8 mb-2 object-contain" />
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
  );
}
