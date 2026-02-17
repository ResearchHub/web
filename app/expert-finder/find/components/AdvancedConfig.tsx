'use client';

import { useState } from 'react';
import { ChevronDown, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { Input } from '@/components/ui/form/Input';
import { Textarea } from '@/components/ui/form/Textarea';
import { Dropdown, DropdownItem, MultiSelectDropdown } from '@/components/ui/form/Dropdown';
import type { ExpertiseLevel, Region, Gender } from '@/types/expertFinder';
import type { AdvancedConfigFormValues } from '../schema';
import { EXPERTISE_LEVELS_SPECIFIC } from '../schema';
import { cn } from '@/utils/styles';

const EXPERTISE_LEVEL_LABELS: Record<ExpertiseLevel, string> = {
  'All Levels': 'All Levels',
  'PhD/PostDocs': 'PhD / PostDocs',
  'Early Career Researchers': 'Early Career Researchers',
  'Mid-Career Researchers': 'Mid-Career Researchers',
  'Top Expert/World Renowned Expert': 'Top Expert / World Renowned',
};

const EXPERTISE_LEVEL_OPTIONS: { value: ExpertiseLevel; label: string }[] = [
  { value: 'All Levels', label: 'All Levels' },
  ...EXPERTISE_LEVELS_SPECIFIC.map((value) => ({
    value,
    label: EXPERTISE_LEVEL_LABELS[value],
  })),
];

const REGIONS: { value: Region; label: string }[] = [
  { value: 'All Regions', label: 'All Regions' },
  { value: 'US', label: 'US' },
  { value: 'non-US', label: 'non-US' },
  { value: 'Europe', label: 'Europe' },
  { value: 'Asia-Pacific', label: 'Asia-Pacific' },
  { value: 'Africa & MENA', label: 'Africa & MENA' },
];

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'All Genders', label: 'All Genders' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
];

const MIN_EXPERTS = 5;
const MAX_EXPERTS = 20;

interface AdvancedConfigProps {
  values: AdvancedConfigFormValues;
  onChange: (values: AdvancedConfigFormValues) => void;
}

export function AdvancedConfig({ values, onChange }: AdvancedConfigProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);

  const regionLabel = REGIONS.find((o) => o.value === values.region)?.label ?? 'All Regions';
  const genderLabel = GENDERS.find((o) => o.value === values.gender)?.label ?? 'All Genders';

  return (
    <CollapsibleSection
      title="Advanced Configuration"
      icon={<Settings className="w-5 h-5" />}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      className="border border-gray-200 rounded-lg p-3 bg-gray-50/50"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="min-w-0">
          <Input
            type="number"
            label="Number of Experts"
            min={MIN_EXPERTS}
            max={MAX_EXPERTS}
            value={values.expertCount}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!Number.isNaN(v)) {
                const clamped = Math.min(MAX_EXPERTS, Math.max(MIN_EXPERTS, v));
                onChange({ ...values, expertCount: clamped });
              }
            }}
            onBlur={(e) => {
              const v = parseInt(e.target.value, 10);
              if (Number.isNaN(v) || v < MIN_EXPERTS || v > MAX_EXPERTS) {
                onChange({
                  ...values,
                  expertCount: Math.min(
                    MAX_EXPERTS,
                    Math.max(MIN_EXPERTS, Number.isNaN(v) ? MIN_EXPERTS : v)
                  ),
                });
              }
            }}
            helperText={`Between ${MIN_EXPERTS} and ${MAX_EXPERTS}`}
            className="max-h-[36px]"
          />
        </div>

        <div className="min-w-0">
          <MultiSelectDropdown<ExpertiseLevel>
            label="Expertise Level"
            options={EXPERTISE_LEVEL_OPTIONS}
            collapseLabelAbove={2}
            value={values.expertiseLevel.length === 0 ? ['All Levels'] : values.expertiseLevel}
            onChange={(selected) => {
              const previousSelection =
                values.expertiseLevel.length === 0 ? ['All Levels'] : values.expertiseLevel;
              const prevHadAll = previousSelection.includes('All Levels');
              const selectedHasAll = selected.includes('All Levels');
              const rest = selected.filter((l) => l !== 'All Levels');

              if (selectedHasAll && !prevHadAll) {
                onChange({ ...values, expertiseLevel: [] });
              } else if (selectedHasAll && prevHadAll && rest.length > 0) {
                onChange({ ...values, expertiseLevel: rest });
              } else if (selectedHasAll && rest.length === 0) {
                onChange({ ...values, expertiseLevel: [] });
              } else {
                onChange({ ...values, expertiseLevel: selected });
              }
            }}
            placeholder="All Levels"
          />
        </div>

        <div className="min-w-0">
          <Dropdown
            label="Geographic Region"
            trigger={
              <Button
                type="button"
                variant="outlined"
                size="md"
                className="w-full justify-between text-left text-gray-900 font-normal"
              >
                {regionLabel}
                <ChevronDown
                  className={cn(
                    'ml-2 h-4 w-4 shrink-0 transition-transform',
                    regionOpen && 'rotate-180'
                  )}
                />
              </Button>
            }
            className="max-h-60 overflow-y-auto py-1"
            onOpenChange={setRegionOpen}
          >
            <div className="py-1 max-h-60 overflow-y-auto">
              {REGIONS.map((option) => (
                <DropdownItem
                  key={option.value}
                  onClick={() => onChange({ ...values, region: option.value })}
                  className={values.region === option.value ? 'bg-primary-50 text-primary-900' : ''}
                >
                  {option.label}
                </DropdownItem>
              ))}
            </div>
          </Dropdown>
        </div>

        <div className="min-w-0">
          <Dropdown
            label="Gender Preference"
            trigger={
              <Button
                type="button"
                variant="outlined"
                size="md"
                className="w-full justify-between text-left text-gray-900 font-normal"
              >
                {genderLabel}
                <ChevronDown
                  className={cn(
                    'ml-2 h-4 w-4 shrink-0 transition-transform',
                    genderOpen && 'rotate-180'
                  )}
                />
              </Button>
            }
            className="max-h-60 overflow-y-auto py-1"
            onOpenChange={setGenderOpen}
          >
            <div className="py-1 max-h-60 overflow-y-auto">
              {GENDERS.map((option) => (
                <DropdownItem
                  key={option.value}
                  onClick={() => onChange({ ...values, gender: option.value })}
                  className={values.gender === option.value ? 'bg-primary-50 text-primary-900' : ''}
                >
                  {option.label}
                </DropdownItem>
              ))}
            </div>
          </Dropdown>
        </div>

        <div className="min-w-0 md:col-span-2">
          <Textarea
            label="Exclude Expert Names"
            placeholder="Comma-separated names (e.g. Jane Doe, John Smith)"
            value={values.excludedExpertNames}
            onChange={(e) => onChange({ ...values, excludedExpertNames: e.target.value })}
            helperText="Optional. Experts with these names will be excluded from results."
            rows={2}
          />
        </div>
      </div>
    </CollapsibleSection>
  );
}
