'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import { Textarea } from '@/components/ui/form/Textarea';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { cn } from '@/utils/styles';
import {
  EXPERT_COUNT_OPTIONS,
  EXPERT_SEARCH_ADDITIONAL_CONTEXT_MAX_LENGTH,
  type ExpertCountOption,
  type FindMoreExpertsPayload,
} from '@/services/expertFinder.service';

export interface FindMoreExpertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAdditionalContext: string;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (payload: FindMoreExpertsPayload) => Promise<void>;
}

const INITIAL_EXPERT_COUNT: ExpertCountOption = 10;

export function FindMoreExpertsModal({
  isOpen,
  onClose,
  initialAdditionalContext,
  isSubmitting,
  error,
  onSubmit,
}: Readonly<FindMoreExpertsModalProps>) {
  const [expertCount, setExpertCount] = useState<ExpertCountOption>(INITIAL_EXPERT_COUNT);
  const [additionalContext, setAdditionalContext] = useState(initialAdditionalContext);
  const [countOpen, setCountOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setExpertCount(INITIAL_EXPERT_COUNT);
    setAdditionalContext(initialAdditionalContext);
    setCountOpen(false);
  }, [isOpen, initialAdditionalContext]);

  const handleSubmit = async () => {
    const payload: FindMoreExpertsPayload = { expert_count: expertCount };
    if (additionalContext !== initialAdditionalContext) {
      payload.additional_context = additionalContext;
    }
    await onSubmit(payload);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Find more experts" size="md">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Request additional experts for this search. New results are appended; existing experts
          stay.
        </p>

        <Dropdown
          label="Number of researchers"
          helperText={`Up to ${expertCount} more researchers will be found`}
          trigger={
            <Button
              type="button"
              variant="outlined"
              size="md"
              className="w-full justify-between text-left text-gray-900 font-normal"
              disabled={isSubmitting}
            >
              {expertCount}
              <ChevronDown
                className={cn(
                  'ml-2 h-4 w-4 shrink-0 transition-transform',
                  countOpen && 'rotate-180'
                )}
              />
            </Button>
          }
          className="max-h-60 overflow-y-auto py-1"
          onOpenChange={setCountOpen}
        >
          <div className="py-1 max-h-60 overflow-y-auto">
            {EXPERT_COUNT_OPTIONS.map((option) => (
              <DropdownItem
                key={option}
                onClick={() => setExpertCount(option)}
                className={expertCount === option ? 'bg-primary-50 text-primary-900' : ''}
              >
                {option}
              </DropdownItem>
            ))}
          </div>
        </Dropdown>

        <Textarea
          label="Additional guidance (optional)"
          value={additionalContext}
          onChange={(e) => setAdditionalContext(e.target.value)}
          maxLength={EXPERT_SEARCH_ADDITIONAL_CONTEXT_MAX_LENGTH}
          rows={4}
          disabled={isSubmitting}
          helperText="Leave unchanged to keep the current search guidance. Clearing the field replaces it with empty guidance."
        />

        {error ? <Alert variant="error">{error}</Alert> : null}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outlined" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <LoadingButton
            type="button"
            variant="default"
            onClick={() => void handleSubmit()}
            isLoading={isSubmitting}
          >
            Find more
          </LoadingButton>
        </div>
      </div>
    </BaseModal>
  );
}
