'use client';

import { useState, useEffect, type ReactNode } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { ChevronDown, Globe2, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { Loader } from '@/components/ui/Loader';
import { Input } from '@/components/ui/form/Input';
import { Textarea } from '@/components/ui/form/Textarea';
import { Dropdown, DropdownItem, MultiSelectDropdown } from '@/components/ui/form/Dropdown';
import type { ExpertSearchResult } from '@/types/expertFinder';
import type { ContentType } from '@/types/work';
import type { AdvancedConfigFormValues, ExpertFinderFormValues } from '../schema';
import {
  EXPERTISE_LEVEL_OPTIONS,
  ExpertiseLevel,
  InputType,
  REGION_OPTIONS,
  clampExpertCount,
  getExpertCountOptions,
  getRegionLabel,
  type ExpertSearchEngine,
} from '@/services/expertFinder.service';
import { getFieldErrorMessage } from '@/utils/form';
import { cn } from '@/utils/styles';
import { SearchHistoryDropdown } from './SearchHistoryDropdown';

interface EngineModeCardProps {
  selected: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function EngineModeCard({ selected, icon, title, description, onClick }: EngineModeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-start rounded-lg border p-4 text-left transition-colors',
        selected
          ? 'border-primary-600 bg-primary-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      )}
    >
      <div className={cn('mb-2', selected ? 'text-primary-600' : 'text-gray-500')}>{icon}</div>
      <span
        className={cn('text-sm font-semibold', selected ? 'text-primary-900' : 'text-gray-900')}
      >
        {title}
      </span>
      <span className="mt-1 text-sm leading-snug text-gray-500">{description}</span>
    </button>
  );
}

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
  const expertCountOptions = getExpertCountOptions(values.engine);

  const setEngine = (engine: ExpertSearchEngine) => {
    onChange({
      ...values,
      engine,
      expertCount: clampExpertCount(values.expertCount, engine),
    });
  };

  return (
    <CollapsibleSection
      title="Search settings"
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

          <div className="min-w-0 md:!col-span-2 space-y-2">
            <p className="text-sm font-medium text-gray-700">Search engine</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <EngineModeCard
                selected={values.engine === 'advanced'}
                icon={<Sparkles className="h-5 w-5" aria-hidden />}
                title="Advanced"
                description="OpenAlex + LLM agent. Finds relevant works for more precise expert matches."
                onClick={() => setEngine('advanced')}
              />
              <EngineModeCard
                selected={values.engine === 'basic'}
                icon={<Globe2 className="h-5 w-5" aria-hidden />}
                title="Basic"
                description="GPT + web search. Broader results; useful when Advanced is blocked by content filters."
                onClick={() => setEngine('basic')}
              />
            </div>
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
                {expertCountOptions.map((option) => (
                  <DropdownItem
                    key={option}
                    onClick={() => onChange({ ...values, expertCount: option })}
                    className={
                      values.expertCount === option ? 'bg-primary-50 text-primary-900' : ''
                    }
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
                    className={
                      values.region === option.value ? 'bg-primary-50 text-primary-900' : ''
                    }
                  >
                    {option.label}
                  </DropdownItem>
                ))}
              </div>
            </Dropdown>
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
