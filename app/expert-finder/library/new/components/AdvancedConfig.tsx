'use client';

import { useState, useCallback, useEffect } from 'react';
import type { FieldErrors } from 'react-hook-form';
import { ChevronDown, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { Input } from '@/components/ui/form/Input';
import { Dropdown, DropdownItem, MultiSelectDropdown } from '@/components/ui/form/Dropdown';
import type { ExpertSearchResult } from '@/types/expertFinder';
import type { ContentType } from '@/types/work';
import type { AdvancedConfigFormValues } from '../schema';
import { EXPERT_COUNT_OPTIONS } from '../schema';
import {
  EXPERTISE_LEVEL_OPTIONS,
  ExpertiseLevel,
  InputType,
  REGION_OPTIONS,
  getRegionLabel,
} from '@/services/expertFinder.service';
import { getFieldErrorMessage } from '@/utils/form';
import { cn } from '@/utils/styles';
import { SearchHistoryDropdown } from './SearchHistoryDropdown';
import { ExcludeExpertsFromSearchesDropdown } from './ExcludeExpertsFromSearchesDropdown';

const INPUT_TYPE_OPTIONS: { value: InputType; label: string }[] = [
  { value: 'full_content', label: 'Full Content' },
  { value: 'pdf', label: 'PDF' },
  { value: 'abstract', label: 'Abstract' },
];

interface AdvancedConfigProps {
  values: AdvancedConfigFormValues;
  onChange: (values: AdvancedConfigFormValues) => void;
  errors?: FieldErrors<AdvancedConfigFormValues>;
  availableInputTypes?: InputType[];
  contentType?: ContentType;
  onRerunSelect: (search: ExpertSearchResult | null) => void;
  selectedSearchId: number | null;
}

export function AdvancedConfig({
  values,
  onChange,
  errors,
  availableInputTypes = ['full_content'],
  contentType,
  onRerunSelect,
  selectedSearchId,
}: AdvancedConfigProps) {
  const hideInputType = contentType !== 'paper';
  const [isExpanded, setIsExpanded] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [inputTypeOpen, setInputTypeOpen] = useState(false);
  const [expertCountOpen, setExpertCountOpen] = useState(false);

  const allowedSet = new Set(availableInputTypes);
  const currentInputTypeValid = allowedSet.has(values.inputType);
  const effectiveInputType = currentInputTypeValid ? values.inputType : availableInputTypes[0];
  const inputTypeLabel =
    INPUT_TYPE_OPTIONS.find((o) => o.value === effectiveInputType)?.label ?? 'Full Content';

  useEffect(() => {
    if (availableInputTypes.length > 0 && !allowedSet.has(values.inputType)) {
      onChange({ ...values, inputType: availableInputTypes[0] });
    }
  }, [availableInputTypes, values.inputType]);

  const regionLabel = getRegionLabel(values.region);

  const handleExcludeChange = useCallback(
    (excludedExpertNames: string) => {
      onChange({ ...values, excludedExpertNames });
    },
    [onChange, values]
  );

  return (
    <CollapsibleSection
      title="Advanced Configuration"
      icon={<Settings className="w-5 h-5" />}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      className="border border-gray-200 rounded-lg p-3 bg-gray-50/50"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="min-w-0 md:col-span-2">
          <Input
            label="Name your search (Optional)"
            placeholder="e.g. fMRI-based glymphatic system measurements in mice"
            value={values.searchName ?? ''}
            onChange={(e) => onChange({ ...values, searchName: e.target.value })}
            helperText="Give this search a name to find it easily later."
          />
        </div>

        {!hideInputType && (
          <div className="min-w-0">
            <Dropdown
              label="Input Type"
              error={getFieldErrorMessage(errors?.inputType)}
              helperText={
                contentType === 'paper'
                  ? 'Choose abstract or PDF (PDF only if the paper has one).'
                  : 'Choose which part of the document to use for finding experts.'
              }
              trigger={
                <Button
                  type="button"
                  variant="outlined"
                  size="md"
                  className="w-full justify-between text-left text-gray-900 font-normal"
                >
                  {inputTypeLabel}
                  <ChevronDown
                    className={cn(
                      'ml-2 h-4 w-4 shrink-0 transition-transform',
                      inputTypeOpen && 'rotate-180'
                    )}
                  />
                </Button>
              }
              className="max-h-60 overflow-y-auto py-1"
              onOpenChange={setInputTypeOpen}
            >
              <div className="py-1 max-h-60 overflow-y-auto">
                {(contentType === 'paper'
                  ? INPUT_TYPE_OPTIONS.filter((o) => o.value === 'abstract' || o.value === 'pdf')
                  : INPUT_TYPE_OPTIONS.filter((option) => allowedSet.has(option.value))
                ).map((option) => {
                  const enabled = allowedSet.has(option.value);
                  return (
                    <DropdownItem
                      key={option.value}
                      onClick={() => enabled && onChange({ ...values, inputType: option.value })}
                      disabled={!enabled}
                      className={cn(
                        values.inputType === option.value && 'bg-primary-50 text-primary-900',
                        !enabled && 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      {option.label}
                      {!enabled && ' (no PDF)'}
                    </DropdownItem>
                  );
                })}
              </div>
            </Dropdown>
          </div>
        )}

        <div className="min-w-0">
          <Dropdown
            label="Number of Researchers"
            error={getFieldErrorMessage(errors?.expertCount)}
            helperText={`Up to ${values.expertCount} researchers will be found`}
            trigger={
              <Button
                type="button"
                variant="outlined"
                size="md"
                className="w-full justify-between text-left text-gray-900 font-normal"
              >
                {values.expertCount}
                <ChevronDown
                  className={cn(
                    'ml-2 h-4 w-4 shrink-0 transition-transform',
                    expertCountOpen && 'rotate-180'
                  )}
                />
              </Button>
            }
            className="max-h-60 overflow-y-auto py-1"
            onOpenChange={setExpertCountOpen}
          >
            <div className="py-1 max-h-60 overflow-y-auto">
              {EXPERT_COUNT_OPTIONS.map((option) => (
                <DropdownItem
                  key={option}
                  onClick={() => onChange({ ...values, expertCount: option })}
                  className={values.expertCount === option ? 'bg-primary-50 text-primary-900' : ''}
                >
                  {option}
                </DropdownItem>
              ))}
            </div>
          </Dropdown>
        </div>

        <div className="min-w-0">
          <MultiSelectDropdown<ExpertiseLevel>
            label="Expertise Level"
            error={getFieldErrorMessage(errors?.expertiseLevel)}
            options={EXPERTISE_LEVEL_OPTIONS}
            collapseLabelAbove={2}
            value={values.expertiseLevel.length === 0 ? ['all_levels'] : values.expertiseLevel}
            onChange={(selected) => {
              const previousSelection =
                values.expertiseLevel.length === 0 ? ['all_levels'] : values.expertiseLevel;
              const prevHadAll = previousSelection.includes('all_levels');
              const selectedHasAll = selected.includes('all_levels');
              const rest = selected.filter((l) => l !== 'all_levels');

              if (selectedHasAll && !prevHadAll) {
                onChange({ ...values, expertiseLevel: [] });
              } else if (selectedHasAll && prevHadAll && rest.length > 0) {
                onChange({ ...values, expertiseLevel: rest });
              } else if (selectedHasAll && rest.length === 0) {
                onChange({ ...values, expertiseLevel: [] });
              } else {
                onChange({
                  ...values,
                  expertiseLevel: selected.filter((l) => l !== 'all_levels'),
                });
              }
            }}
            placeholder="All Levels"
          />
        </div>

        <div className="min-w-0">
          <Dropdown
            label="Geographic Region"
            error={getFieldErrorMessage(errors?.region)}
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
              {REGION_OPTIONS.map((option) => (
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

        <div className="min-w-0 md:col-span-2 border-t border-gray-200 pt-4 mt-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="min-w-0">
              <SearchHistoryDropdown
                selectedSearchId={selectedSearchId}
                onSearchSelect={onRerunSelect}
              />
            </div>
            <div className="min-w-0">
              <ExcludeExpertsFromSearchesDropdown onExcludeChange={handleExcludeChange} />
            </div>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
