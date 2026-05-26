'use client';

import { useState, useEffect } from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Textarea } from '@/components/ui/form/Textarea';
import { LoadingButton } from '@/components/ui/LoadingButton';
import type { ExpertResult } from '@/types/expertFinder';
import type { AddExpertPayload, PatchExpertPayload } from '@/services/expertFinder.service';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { usePatchExpert, useAddExpert } from '@/hooks/useExpertFinder';

export interface ExpertFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchId: string;
  expert?: ExpertResult;
  onSuccess: () => Promise<void>;
}

function buildEditPayload(values: {
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

function buildAddPayload(values: {
  email: string;
  honorific: string;
  firstName: string;
  middleName: string;
  lastName: string;
  nameSuffix: string;
  academicTitle: string;
  affiliation: string;
  expertise: string;
  notes: string;
}): AddExpertPayload {
  const t = (s: string) => s.trim();
  const payload: AddExpertPayload = { email: t(values.email).toLowerCase() };

  if (t(values.honorific)) payload.honorific = t(values.honorific);
  if (t(values.firstName)) payload.first_name = t(values.firstName);
  if (t(values.middleName)) payload.middle_name = t(values.middleName);
  if (t(values.lastName)) payload.last_name = t(values.lastName);
  if (t(values.nameSuffix)) payload.name_suffix = t(values.nameSuffix);
  if (t(values.academicTitle)) payload.academic_title = t(values.academicTitle);
  if (t(values.affiliation)) payload.affiliation = t(values.affiliation);
  if (t(values.expertise)) payload.expertise = t(values.expertise);
  if (t(values.notes)) payload.notes = t(values.notes);

  return payload;
}

export function ExpertFormModal({
  isOpen,
  onClose,
  searchId,
  expert,
  onSuccess,
}: ExpertFormModalProps) {
  const [, patchExpert] = usePatchExpert();
  const [, addExpert] = useAddExpert();
  const isAdd = expert == null;

  const [email, setEmail] = useState('');
  const [honorific, setHonorific] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nameSuffix, setNameSuffix] = useState('');
  const [academicTitle, setAcademicTitle] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [expertise, setExpertise] = useState('');
  const [notes, setNotes] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSubmitError(null);
    if (expert != null) {
      setHonorific(expert.honorific);
      setFirstName(expert.firstName);
      setMiddleName(expert.middleName);
      setLastName(expert.lastName);
      setNameSuffix(expert.nameSuffix);
    } else {
      setEmail('');
      setHonorific('');
      setFirstName('');
      setMiddleName('');
      setLastName('');
      setNameSuffix('');
      setAcademicTitle('');
      setAffiliation('');
      setExpertise('');
      setNotes('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isAdd]);

  const handleSubmit = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      if (expert != null) {
        const payload = buildEditPayload({
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
        await patchExpert(expert.expertId!, payload);
      } else {
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
          setSubmitError('Email is required.');
          setIsSubmitting(false);
          return;
        }
        await addExpert(
          searchId,
          buildAddPayload({
            email,
            honorific,
            firstName,
            middleName,
            lastName,
            nameSuffix,
            academicTitle,
            affiliation,
            expertise,
            notes,
          })
        );
      }
      await onSuccess();
      onClose();
    } catch (err) {
      setSubmitError(
        extractApiErrorMessage(err, isAdd ? 'Failed to add expert' : 'Failed to update expert')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isAdd ? 'Add expert' : 'Edit expert name'}
      size="lg"
      showCloseButton
      padding="p-6"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {isAdd && (
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane.doe@university.edu"
          />
        )}
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
          {isAdd && (
            <Input
              label="Academic title"
              value={academicTitle}
              onChange={(e) => setAcademicTitle(e.target.value)}
              placeholder="e.g. Associate Professor"
            />
          )}
        </div>
        {isAdd && (
          <>
            <Input
              label="Affiliation"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              placeholder="e.g. MIT"
            />
            <Input
              label="Expertise"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="e.g. Quantum computing"
            />
            <Textarea
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </>
        )}
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
            loadingText={isAdd ? 'Adding…' : 'Saving…'}
          >
            {isAdd ? 'Add expert' : 'Save'}
          </LoadingButton>
        </div>
      </div>
    </BaseModal>
  );
}
