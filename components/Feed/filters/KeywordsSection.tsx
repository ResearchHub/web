import React, { useState, useEffect } from 'react';
import { Key } from 'lucide-react';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { Input } from '@/components/ui/form/Input';
import { Button } from '@/components/ui/Button';

interface KeywordsSectionProps {
  keywords: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onKeywordsChange: (keywords: string[]) => void;
}

export function KeywordsSection({
  keywords,
  isExpanded,
  onToggle,
  onKeywordsChange,
}: KeywordsSectionProps) {
  const [tempKeywords, setTempKeywords] = useState<string>(keywords.join(', '));

  // Sync tempKeywords when keywords prop changes
  useEffect(() => {
    setTempKeywords(keywords.join(', '));
  }, [keywords]);

  const handleKeywordsSave = () => {
    const newKeywords = tempKeywords
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    onKeywordsChange(newKeywords);
  };

  // Generate description based on current keywords
  const description =
    keywords.length > 0
      ? `Filtering by: ${keywords.slice(0, 3).join(', ')}${keywords.length > 3 ? ` +${keywords.length - 3} more` : ''}`
      : 'Add keywords to filter papers';

  return (
    <CollapsibleSection
      title="Keywords"
      icon={<Key className="w-5 h-5 text-purple-600" />}
      isExpanded={isExpanded}
      onToggle={onToggle}
      className="mb-4 border-b border-gray-200 pb-4"
      badge={keywords.length > 0 ? keywords.length : undefined}
      badgeColor="purple"
      description={description}
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
  );
}
