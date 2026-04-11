'use client';

import { useState, useEffect } from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { LoadingButton } from '@/components/ui/LoadingButton';
import type { ExpertResult } from '@/types/expertFinder';
import type { PatchExpertPayload } from '@/services/expertFinder.service';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';

export interface ExpertEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  expert: ExpertResult;
  expertId: number;
  onSave: (expertId: number, payload: PatchExpertPayload) => Promise<void>;
}

function buildPayload(values: {
  honorific: string;
  firstName: string;
  middleName: string;
  lastName: string;
  nameSuffix: string;
}): PatchExpertPayload {
  const payload: PatchExpertPayload = {};
  const t = (s: string) => s.trim();

  if (t(values.honorific)) payload.honorific = t(values.honorific);
  if (t(values.firstName)) payload.first_name = t(values.firstName);
  if (t(values.middleName)) payload.middle_name = t(values.middleName);
  if (t(values.lastName)) payload.last_name = t(values.lastName);
  if (t(values.nameSuffix)) payload.name_suffix = t(values.nameSuffix);

  return payload;
}

export function ExpertEditModal({
  isOpen,
  onClose,
  expert,
  expertId,
  onSave,
}: ExpertEditModalProps) {
  const [honorific, setHonorific] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nameSuffix, setNameSuffix] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setHonorific(expert.honorific);
    setFirstName(expert.firstName);
    setMiddleName(expert.middleName);
    setLastName(expert.lastName);
    setNameSuffix(expert.nameSuffix);
    setSubmitError(null);
  }, [isOpen, expert]);

  const handleSubmit = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const payload = buildPayload({
        honorific,
        firstName,
        middleName,
        lastName,
        nameSuffix,
      });
      if (Object.keys(payload).length === 0) {
        setSubmitError('Change at least one field to save.');
        setIsSubmitting(false);
        return;
      }
      await onSave(expertId, payload);
      onClose();
    } catch (err) {
      setSubmitError(extractApiErrorMessage(err, 'Failed to update expert'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit expert name"
      size="lg"
      showCloseButton
      padding="p-6"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Honorific"
            value={honorific}
            onChange={(e) => setHonorific(e.target.value)}
            placeholder="e.g. Dr, Prof, Mr, Ms"
          />
          <Input
            label="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            label="Middle name"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
          />
          <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <Input
            label="Name suffix"
            value={nameSuffix}
            onChange={(e) => setNameSuffix(e.target.value)}
            placeholder="e.g. Jr., Sr., III, IV"
          />
        </div>
        {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outlined" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <LoadingButton
            type="button"
            variant="default"
            onClick={() => void handleSubmit()}
            isLoading={isSubmitting}
            loadingText="Saving…"
          >
            Save
          </LoadingButton>
        </div>
      </div>
    </BaseModal>
  );
}
