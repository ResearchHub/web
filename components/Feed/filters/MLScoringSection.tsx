import React from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { Switch } from '@/components/ui/Switch';

interface MLScoringSectionProps {
  useMlScoring: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onMlScoringChange: (enabled: boolean) => void;
}

export function MLScoringSection({
  useMlScoring,
  isExpanded,
  onToggle,
  onMlScoringChange,
}: MLScoringSectionProps) {
  const description = useMlScoring ? 'ML-powered ranking enabled' : 'Standard ranking';

  return (
    <CollapsibleSection
      title="Advanced Options"
      icon={<Brain className="w-5 h-5 text-indigo-600" />}
      isExpanded={isExpanded}
      onToggle={onToggle}
      className="mb-4 border-b border-gray-200 pb-4"
      badge={useMlScoring ? 1 : undefined}
      badgeColor="indigo"
      description={description}
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
        <Switch checked={useMlScoring} onCheckedChange={onMlScoringChange} />
      </div>
    </CollapsibleSection>
  );
}
