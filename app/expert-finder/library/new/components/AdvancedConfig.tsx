'use client';

import { useState, useEffect } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { ChevronDown, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { Loader } from '@/components/ui/Loader';
import { Input } from '@/components/ui/form/Input';
import { Textarea } from '@/components/ui/form/Textarea';
import { BaseMenu, BaseMenuRadioGroup, BaseMenuRadioItem } from '@/components/ui/form/BaseMenu';
import { MultiSelectDropdown } from '@/components/ui/form/MultiSelectDropdown';
import type { ExpertSearchResult } from '@/types/expertFinder';
import type { ContentType } from '@/types/work';
import type { AdvancedConfigFormValues, ExpertFinderFormValues } from '../schema';
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
  additionalContextRegister: ReturnType<UseFormRegister<ExpertFinderFormValues>>;
  additionalContextError?: string;
  additionalContextCharCount: number;
  additionalContextMaxLength: number;
}

export function AdvancedConfig({
  values,
  onChange,
  errors,
  availableInputTypes = ['full_content'],
  contentType,
  onRerunSelect,
  selectedSearchId,
  additionalContextRegister,
  additionalContextError,
  additionalContextCharCount,
  additionalContextMaxLength,
}: AdvancedConfigProps) {
  const hideInputType = contentType !== 'paper';
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoadingRerun, setIsLoadingRerun] = useState(false);
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
  const inputTypeError = getFieldErrorMessage(errors?.inputType);
  const expertCountError = getFieldErrorMessage(errors?.expertCount);
  const regionError = getFieldErrorMessage(errors?.region);

  return (
    <CollapsibleSection
      title="Advanced Configuration"
      icon={<Settings className="w-5 h-5" />}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      className="border border-gray-200 rounded-lg p-3 bg-gray-50/50"
    >
      <div className="relative mt-6" aria-busy={isLoadingRerun}>
        {isLoadingRerun ? (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg bg-white/70"
            role="status"
            aria-live="polite"
          >
            <Loader size="md" className="text-blue-500" />
          </div>
        ) : null}
        <div
          className={cn(
            'grid grid-cols-1 md:!grid-cols-2 gap-4',
            isLoadingRerun && 'pointer-events-none opacity-60'
          )}
        >
          <div className="min-w-0 md:!col-span-2">
            <Input
              label="Name your search (Optional)"
              placeholder="e.g. fMRI-based glymphatic system measurements in mice"
              value={values.searchName ?? ''}
              onChange={(e) => onChange({ ...values, searchName: e.target.value })}
              helperText="Give this search a name to find it easily later."
            />
          </div>

          <div className="min-w-0 md:!col-span-2">
            <Textarea
              label="Additional guidance (optional)"
              helperText={`Steers how experts are identified for this search. ${additionalContextCharCount} / ${additionalContextMaxLength} characters`}
              error={additionalContextError}
              {...additionalContextRegister}
            />
          </div>

          {!hideInputType && (
            <div className="min-w-0">
              <label className="mb-1 block text-sm font-semibold text-gray-700">Input Type</label>
              <BaseMenu
                align="start"
                sameWidth
                className="max-h-60"
                onOpenChange={setInputTypeOpen}
                trigger={
                  <Button
                    type="button"
                    variant="outlined"
                    size="md"
                    className={cn(
                      'w-full justify-between text-left text-gray-900 font-normal',
                      inputTypeError && 'border-red-500'
                    )}
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
              >
                <BaseMenuRadioGroup
                  value={effectiveInputType}
                  onValueChange={(value) => onChange({ ...values, inputType: value as InputType })}
                >
                  {(contentType === 'paper'
                    ? INPUT_TYPE_OPTIONS.filter((o) => o.value === 'abstract' || o.value === 'pdf')
                    : INPUT_TYPE_OPTIONS.filter((option) => allowedSet.has(option.value))
                  ).map((option) => {
                    const enabled = allowedSet.has(option.value);
                    return (
                      <BaseMenuRadioItem
                        key={option.value}
                        value={option.value}
                        disabled={!enabled}
                      >
                        {option.label}
                        {!enabled && ' (no PDF)'}
                      </BaseMenuRadioItem>
                    );
                  })}
                </BaseMenuRadioGroup>
              </BaseMenu>
              {inputTypeError && <p className="mt-1 text-xs text-red-500">{inputTypeError}</p>}
              <p className="mt-1 text-xs text-gray-500">
                {contentType === 'paper'
                  ? 'Choose abstract or PDF (PDF only if the paper has one).'
                  : 'Choose which part of the document to use for finding experts.'}
              </p>
            </div>
          )}

          <div className="min-w-0">
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Number of Researchers
            </label>
            <BaseMenu
              align="start"
              sameWidth
              className="max-h-60"
              onOpenChange={setExpertCountOpen}
              trigger={
                <Button
                  type="button"
                  variant="outlined"
                  size="md"
                  className={cn(
                    'w-full justify-between text-left text-gray-900 font-normal',
                    expertCountError && 'border-red-500'
                  )}
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
            >
              <BaseMenuRadioGroup
                value={String(values.expertCount)}
                onValueChange={(value) =>
                  onChange({
                    ...values,
                    expertCount: Number(value) as AdvancedConfigFormValues['expertCount'],
                  })
                }
              >
                {EXPERT_COUNT_OPTIONS.map((option) => (
                  <BaseMenuRadioItem key={option} value={String(option)}>
                    {option}
                  </BaseMenuRadioItem>
                ))}
              </BaseMenuRadioGroup>
            </BaseMenu>
            {expertCountError && <p className="mt-1 text-xs text-red-500">{expertCountError}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Up to {values.expertCount} researchers will be found
            </p>
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
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Geographic Region
            </label>
            <BaseMenu
              align="start"
              sameWidth
              className="max-h-60"
              onOpenChange={setRegionOpen}
              trigger={
                <Button
                  type="button"
                  variant="outlined"
                  size="md"
                  className={cn(
                    'w-full justify-between text-left text-gray-900 font-normal',
                    regionError && 'border-red-500'
                  )}
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
            >
              <BaseMenuRadioGroup
                value={values.region}
                onValueChange={(value) =>
                  onChange({ ...values, region: value as AdvancedConfigFormValues['region'] })
                }
              >
                {REGION_OPTIONS.map((option) => (
                  <BaseMenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </BaseMenuRadioItem>
                ))}
              </BaseMenuRadioGroup>
            </BaseMenu>
            {regionError && <p className="mt-1 text-xs text-red-500">{regionError}</p>}
          </div>

          <div className="min-w-0 md:!col-span-2 border-t border-gray-200 pt-4 mt-2">
            <SearchHistoryDropdown
              selectedSearchId={selectedSearchId}
              onSearchSelect={onRerunSelect}
              onLoadingChange={setIsLoadingRerun}
            />
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
