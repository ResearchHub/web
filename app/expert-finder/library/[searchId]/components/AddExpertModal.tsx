'use client';

import { useState, useEffect } from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Textarea } from '@/components/ui/form/Textarea';
import { LoadingButton } from '@/components/ui/LoadingButton';
import type { AddExpertPayload } from '@/services/expertFinder.service';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';

export interface AddExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (searchId: string, payload: AddExpertPayload) => Promise<unknown>;
  searchId: string;
  onSuccess: () => Promise<void>;
}

function buildPayload(values: {
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

export function AddExpertModal({
  isOpen,
  onClose,
  onAdd,
  searchId,
  onSuccess,
}: AddExpertModalProps) {
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
    setSubmitError(null);
  }, [isOpen]);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setSubmitError('Email is required.');
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const payload = buildPayload({
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
      });
      await onAdd(searchId, payload);
      await onSuccess();
      onClose();
    } catch (err) {
      setSubmitError(extractApiErrorMessage(err, 'Failed to add expert'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add expert"
      size="lg"
      showCloseButton
      padding="p-6"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane.doe@university.edu"
        />
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
          <Input
            label="Academic title"
            value={academicTitle}
            onChange={(e) => setAcademicTitle(e.target.value)}
            placeholder="e.g. Associate Professor"
          />
        </div>
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
        <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
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
            loadingText="Adding..."
          >
            Add expert
          </LoadingButton>
        </div>
      </div>
    </BaseModal>
  );
}
