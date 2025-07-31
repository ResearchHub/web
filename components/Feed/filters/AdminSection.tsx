import React from 'react';
import { Settings2, Sparkles, Database } from 'lucide-react';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { Switch } from '@/components/ui/Switch';
import Image from 'next/image';
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
  // Check if all sources are selected
  const allSourceValues = sources.map((s) => s.value);
  const isAllSelected =
    selectedSources.length === sources.length &&
    allSourceValues.every((value) => selectedSources.includes(value));

  const handleAllToggle = () => {
    if (isAllSelected) {
      // If all are selected, deselect all
      onSourcesChange([]);
    } else {
      // Select all sources
      onSourcesChange(allSourceValues);
    }
  };

  const handleSourceToggle = (sourceValue: string) => {
    const isSelected = selectedSources.includes(sourceValue);

    if (isSelected) {
      // Remove the source from selection
      const newSelection = selectedSources.filter((s) => s !== sourceValue);
      onSourcesChange(newSelection);
    } else {
      // Add the source to selection
      const newSelection = [...selectedSources, sourceValue];
      onSourcesChange(newSelection);
    }
  };

  // Calculate active settings count
  // Don't count hasEnrichment if it's true (default state)
  const activeCount = (useMlScoring ? 1 : 0) + (!hasEnrichment ? 1 : 0) + selectedSources.length;

  // Generate description
  const descriptions = [];
  if (useMlScoring) descriptions.push('ML scoring');
  if (!hasEnrichment) descriptions.push('No enrichment');
  if (selectedSources.length > 0) {
    descriptions.push(`${selectedSources.length} source${selectedSources.length > 1 ? 's' : ''}`);
  }
  const description =
    descriptions.length > 0 ? descriptions.join(', ') : 'Configure advanced settings';

  return (
    <CollapsibleSection
      title="Advanced"
      icon={<Settings2 className="w-5 h-5 text-gray-600" />}
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <h5 className="text-sm font-medium text-gray-700">Paper Sources</h5>
              {selectedSources.length > 0 && (
                <span className="text-xs text-gray-500">
                  <span className="text-blue-600 font-medium">
                    {selectedSources.length} selected
                  </span>
                </span>
              )}
            </div>
            <button
              onClick={handleAllToggle}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={() => {}}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Select all</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Individual Source Badges */}
            {sources.map((source) => {
              const isSelected = selectedSources.includes(source.value);

              return (
                <button
                  key={source.value}
                  onClick={() => handleSourceToggle(source.value)}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                    border transition-all duration-200
                    ${
                      isSelected
                        ? 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                    }
                  `}
                >
                  <Image
                    src={source.logo}
                    alt={source.label}
                    width={40}
                    height={14}
                    className="object-contain"
                    style={{ maxHeight: '14px' }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
