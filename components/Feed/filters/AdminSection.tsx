import React from 'react';
import { Shield, Sparkles, Database } from 'lucide-react';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { Switch } from '@/components/ui/Switch';
import { Source } from './constants';

interface AdminSectionProps {
  useMlScoring: boolean;
  hasEnrichment: boolean;
  sources: Source[];
  selectedSources: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onMlScoringChange: (enabled: boolean) => void;
  onEnrichmentChange: (enabled: boolean) => void;
  onSourcesChange: (sources: string[]) => void;
}

export function AdminSection({
  useMlScoring,
  hasEnrichment,
  sources,
  selectedSources,
  isExpanded,
  onToggle,
  onMlScoringChange,
  onEnrichmentChange,
  onSourcesChange,
}: AdminSectionProps) {
  // Check if all sources are selected (or no sources selected means "All")
  const allSourceValues = sources.map((s) => s.value);
  const isAllSelected =
    selectedSources.length === 0 ||
    (selectedSources.length === sources.length &&
      allSourceValues.every((value) => selectedSources.includes(value)));

  const handleAllToggle = () => {
    if (isAllSelected) {
      // If "All" is currently selected, deselect all (which will revert to "All" behavior)
      // This creates a toggle effect
      onSourcesChange([]);
    } else {
      // Select all sources explicitly
      onSourcesChange([]);
    }
  };

  const handleSourceToggle = (sourceValue: string) => {
    if (isAllSelected) {
      // If "All" is selected and user clicks a specific source,
      // select all sources except the clicked one
      const newSelection = allSourceValues.filter((v) => v !== sourceValue);
      onSourcesChange(newSelection);
    } else {
      const isSelected = selectedSources.includes(sourceValue);

      if (isSelected) {
        const newSelection = selectedSources.filter((s) => s !== sourceValue);
        // If deselecting would result in empty array, it means "All"
        onSourcesChange(newSelection);
      } else {
        const newSelection = [...selectedSources, sourceValue];
        // If selecting all sources, clear the array to represent "All"
        if (newSelection.length === sources.length) {
          onSourcesChange([]);
        } else {
          onSourcesChange(newSelection);
        }
      }
    }
  };

  // Calculate active settings count
  // Don't count sources if "All" is selected (default state)
  // Don't count hasEnrichment if it's true (default state)
  const activeCount =
    (useMlScoring ? 1 : 0) +
    (!hasEnrichment ? 1 : 0) +
    (isAllSelected ? 0 : selectedSources.length);

  // Generate description
  const descriptions = [];
  if (useMlScoring) descriptions.push('ML scoring');
  if (!hasEnrichment) descriptions.push('No enrichment');
  if (!isAllSelected && selectedSources.length > 0) {
    descriptions.push(`${selectedSources.length} source${selectedSources.length > 1 ? 's' : ''}`);
  } else if (isAllSelected) {
    descriptions.push('All sources');
  }
  const description =
    descriptions.length > 0 ? descriptions.join(', ') : 'Configure advanced settings';

  return (
    <CollapsibleSection
      title="Admin"
      icon={<Shield className="w-5 h-5 text-gray-600" />}
      isExpanded={isExpanded}
      onToggle={onToggle}
      className="mb-4 border-b border-gray-200 pb-4"
      badge={activeCount > 0 ? activeCount : undefined}
      badgeColor="blue"
      description={description}
    >
      <div className="space-y-4">
        {/* ML Scoring Option */}
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
          <Switch checked={useMlScoring} onCheckedChange={onMlScoringChange} />
        </div>

        {/* Has Enrichment Option */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-900">Enriched Data</h5>
              <p className="text-xs text-gray-600 mt-0.5">
                Include papers with additional metadata like impact scores and citations
              </p>
            </div>
          </div>
          <Switch checked={hasEnrichment} onCheckedChange={onEnrichmentChange} />
        </div>

        {/* Sources Section */}
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-3">Paper Sources</h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {/* All Sources Button */}
            <button
              onClick={handleAllToggle}
              className={`
                flex flex-col items-center p-3 rounded-lg border-2 transition-all
                ${
                  isAllSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="h-8 w-8 mb-2 flex items-center justify-center">
                <span
                  className={`text-lg font-bold ${isAllSelected ? 'text-blue-600' : 'text-gray-600'}`}
                >
                  All
                </span>
              </div>
              <span
                className={`text-xs font-medium ${isAllSelected ? 'text-blue-700' : 'text-gray-700'}`}
              >
                All Sources
              </span>
            </button>

            {/* Individual Source Buttons */}
            {sources.map((source) => {
              const isSelected = isAllSelected || selectedSources.includes(source.value);

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
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
