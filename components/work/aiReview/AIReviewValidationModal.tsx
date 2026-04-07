'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { ProgressStepper } from '@/components/ui/ProgressStepper';
import { ChecklistValueBadge } from './ChecklistValueBadge';
import { useAIReviewMock } from './AIReviewMockContext';
import type { ChecklistValue, UserChecklistValidation } from './types';
import { cn } from '@/utils/styles';

interface AIReviewValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIReviewValidationModal({ isOpen, onClose }: AIReviewValidationModalProps) {
  const { data, userValidations, setUserValidation } = useAIReviewMock();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Draft state: accumulate all validations locally until submit
  const [draftValidations, setDraftValidations] = useState<Record<string, UserChecklistValidation>>(
    () => ({ ...userValidations })
  );

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setDraftValidations({ ...userValidations });
    }
  }, [isOpen]);

  const categories = data.categories;
  const currentCategory = categories[currentStepIndex];
  const isLastStep = currentStepIndex === categories.length - 1;
  const isFirstStep = currentStepIndex === 0;

  const steps = useMemo(
    () =>
      categories.map((cat) => ({
        id: cat.id,
        label: cat.title,
      })),
    [categories]
  );

  const setDraftValue = useCallback(
    (itemId: string, value: ChecklistValue | null, note?: string) => {
      setDraftValidations((prev) => {
        if (value === null) {
          const next = { ...prev };
          delete next[itemId];
          return next;
        }
        return { ...prev, [itemId]: { value, note } };
      });
    },
    []
  );

  // Count how many items in current category have been validated
  const currentCategoryProgress = useMemo(() => {
    if (!currentCategory) return { done: 0, total: 0 };
    const allItems = currentCategory.subcategories.flatMap((s) => s.checklist);
    const done = allItems.filter((item) => draftValidations[item.id] !== undefined).length;
    return { done, total: allItems.length };
  }, [currentCategory, draftValidations]);

  const handleNext = () => {
    if (isLastStep) return;
    setCurrentStepIndex((i) => i + 1);
  };

  const handleBack = () => {
    if (isFirstStep) return;
    setCurrentStepIndex((i) => i - 1);
  };

  const handleStepClick = (stepId: string) => {
    const idx = categories.findIndex((c) => c.id === stepId);
    if (idx >= 0) setCurrentStepIndex(idx);
  };

  const handleSubmit = () => {
    // Commit all draft validations to the context
    Object.entries(draftValidations).forEach(([itemId, validation]) => {
      setUserValidation(itemId, validation);
    });
    // Clear any validations that were removed
    Object.keys(userValidations).forEach((itemId) => {
      if (!(itemId in draftValidations)) {
        setUserValidation(itemId, null);
      }
    });
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  // Count total validated across all categories
  const totalProgress = useMemo(() => {
    const allItems = categories.flatMap((c) => c.subcategories.flatMap((s) => s.checklist));
    const done = allItems.filter((item) => draftValidations[item.id] !== undefined).length;
    return { done, total: allItems.length };
  }, [categories, draftValidations]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <span>Validate AI Review</span>
          <span className="text-sm font-normal text-gray-500">
            {totalProgress.done} of {totalProgress.total} items reviewed
          </span>
        </div>
      }
      size="2xl"
      padding="p-0"
      footer={
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={isFirstStep}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {currentCategoryProgress.done} of {currentCategoryProgress.total} validated
            </span>
            {isLastStep ? (
              <Button type="button" onClick={handleSubmit} className="gap-1">
                <Check className="w-4 h-4" />
                Submit Review
              </Button>
            ) : (
              <Button type="button" onClick={handleNext} className="gap-1">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      }
    >
      {/* Step indicator */}
      <div className="px-6 pt-4 pb-3 border-b border-gray-100 bg-gray-50/50">
        <ProgressStepper
          steps={steps}
          currentStep={currentCategory?.id ?? ''}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Category content */}
      {currentCategory && (
        <div className="px-6 py-5 space-y-8">
          {currentCategory.subcategories.map((sub) => {
            return (
              <section key={sub.id}>
                {/* Subcategory header */}
                <div className="mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    {sub.title}
                  </h3>
                </div>

                {/* Checklist items */}
                <div className="space-y-3">
                  {sub.checklist.map((item) => {
                    const draft = draftValidations[item.id];

                    return (
                      <ValidationChecklistItem
                        key={item.id}
                        label={item.label}
                        aiValue={item.aiValue}
                        userValue={draft?.value ?? null}
                        userNote={draft?.note ?? ''}
                        onValueChange={(v) => setDraftValue(item.id, v, draft?.note)}
                        onNoteChange={(note) => setDraftValue(item.id, draft?.value ?? null, note)}
                        onClear={() => setDraftValue(item.id, null)}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </BaseModal>
  );
}

/** Individual checklist item within the validation modal */
function ValidationChecklistItem({
  label,
  aiValue,
  userValue,
  userNote,
  onValueChange,
  onNoteChange,
  onClear,
}: {
  label: string;
  aiValue: ChecklistValue;
  userValue: ChecklistValue | null;
  userNote: string;
  onValueChange: (value: ChecklistValue | null) => void;
  onNoteChange: (note: string) => void;
  onClear: () => void;
}) {
  const [showNote, setShowNote] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      {/* Label */}
      <p className="text-sm font-medium text-gray-900 leading-snug mb-3">{label}</p>

      {/* Two-column grid: labels left, controls right */}
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 items-center">
        {/* AI verdict row */}
        <span className="text-[10px] text-gray-600 uppercase font-semibold">AI verdict</span>
        <div>
          <ChecklistValueBadge value={aiValue} />
        </div>

        {/* Your assessment row */}
        <span className="text-[10px] text-gray-600 uppercase font-semibold">Your assessment</span>
        <div className="flex items-center gap-2">
          {(['YES', 'PARTIAL', 'NO'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onValueChange(v)}
              className={cn(
                'rounded-md border px-3 py-1 text-xs font-semibold transition-colors',
                userValue === v
                  ? v === 'YES'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                    : v === 'PARTIAL'
                      ? 'border-amber-500 bg-amber-50 text-amber-900'
                      : 'border-red-500 bg-red-50 text-red-900'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              )}
            >
              {v === 'YES' ? 'Yes' : v === 'PARTIAL' ? 'Partial' : 'No'}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-3">
            {userValue !== null && !showNote && (
              <button
                type="button"
                onClick={() => setShowNote(true)}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                {userNote ? 'Edit note' : '+ Add note'}
              </button>
            )}
            {userValue !== null && (
              <button
                type="button"
                onClick={() => {
                  onClear();
                  setShowNote(false);
                }}
                className="text-xs text-gray-400 hover:text-red-500 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Note input */}
      {showNote && userValue !== null && (
        <div className="mt-2">
          <textarea
            value={userNote}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Optional note explaining your assessment..."
            className="w-full rounded-md border border-gray-200 text-sm p-2 min-h-[56px] focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowNote(false)}
            className="text-[11px] text-gray-500 hover:text-gray-700 mt-1"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
