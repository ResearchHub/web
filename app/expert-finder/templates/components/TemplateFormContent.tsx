'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2, Save } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { BaseSection } from '@/components/ui/BaseSection';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Modal } from '@/components/ui/form/Modal';
import {
  useSavedTemplateDetail,
  useCreateSavedTemplate,
  useUpdateSavedTemplate,
  useDeleteSavedTemplate,
} from '@/hooks/useExpertFinder';
import type { SavedTemplate } from '@/types/expertFinder';
import { TemplateVariableEditor } from './TemplateBodyEditor';

export interface TemplateFormState {
  name: string;
  emailSubject: string;
  emailBody: string;
}

const emptyForm: TemplateFormState = {
  name: '',
  emailSubject: '',
  emailBody: '',
};

function templateToForm(t: SavedTemplate): TemplateFormState {
  return {
    name: t.name,
    emailSubject: t.emailSubject,
    emailBody: t.emailBody,
  };
}

function formToCreatePayload(form: TemplateFormState) {
  const emailBody = form.emailBody.trim().length > 0 ? form.emailBody : undefined;

  return {
    name: form.name.trim(),
    email_subject: form.emailSubject.trim() || undefined,
    email_body: emailBody,
  };
}

function formToUpdatePayload(form: TemplateFormState) {
  const emailBody = form.emailBody.trim().length > 0 ? form.emailBody : undefined;

  return {
    name: form.name.trim() || undefined,
    email_subject: form.emailSubject.trim() || undefined,
    email_body: emailBody,
  };
}

export interface TemplateFormContentProps {
  templateId?: string;
}

export function TemplateFormContent({ templateId }: TemplateFormContentProps) {
  const router = useRouter();
  const isEdit = templateId != null;

  const [{ template, isLoading: isLoadingDetail, error }, refetch] = useSavedTemplateDetail(
    isEdit ? templateId : null
  );
  const [{ isLoading: isCreating }, createTemplate] = useCreateSavedTemplate();
  const [{ isLoading: isUpdating }, updateTemplate] = useUpdateSavedTemplate();
  const [{ isLoading: isDeleting, error: deleteError }, deleteTemplate] = useDeleteSavedTemplate();

  const [form, setForm] = useState<TemplateFormState>(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (template) setForm(templateToForm(template));
  }, [template]);

  const setField = useCallback(
    <K extends keyof TemplateFormState>(field: K, value: TemplateFormState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaveError(null);

    if (isEdit) {
      try {
        await updateTemplate(templateId, formToUpdatePayload(form));
        await refetch();
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Failed to save');
      }
    } else {
      try {
        const created = await createTemplate(formToCreatePayload(form));
        router.push(`/expert-finder/templates/${created.id}`);
      } catch {
        // error surfaced by hook
      }
    }
  };

  const handleDelete = async () => {
    if (!templateId) return;
    setSaveError(null);
    try {
      await deleteTemplate(Number(templateId));
      window.location.href = '/expert-finder/templates';
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const isSaving = isCreating || isUpdating;

  // —— Edit mode: loading / error states ——
  if (isEdit) {
    if (isLoadingDetail && !template) {
      return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </div>
      );
    }
    if (error && !template) {
      return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          <Alert variant="error">{error}</Alert>
          <Link
            href="/expert-finder/templates"
            className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
          >
            Back to Templates
          </Link>
        </div>
      );
    }
    if (!template) return null;
  }

  const displayName =
    isEdit && template ? template.name || `Template #${templateId}` : 'New template';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Breadcrumbs
        items={[{ label: 'Templates', href: '/expert-finder/templates' }, { label: displayName }]}
        className="mb-2"
      />

      {(saveError || deleteError) && <Alert variant="error">{saveError || deleteError}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          placeholder="e.g. NeurIPS collaboration outreach"
          required
        />

        <BaseSection>
          <h3 className="text-lg font-semibold text-gray-900">Email Subject</h3>
          <p className="text-sm text-gray-500">
            Write the subject line and insert placeholders if needed (e.g.{' '}
            <code className="text-xs">{'{{user.*}}'}</code>,{' '}
            <code className="text-xs">{'{{expert.*}}'}</code>
            ).
          </p>
          <TemplateVariableEditor
            value={form.emailSubject}
            onChange={(value) => setField('emailSubject', value)}
            placeholder="Invitation to collaborate with {{organization}}"
            disabled={isDeleting || isSaving}
            singleLine
            minHeightClassName="min-h-[32px]"
          />
        </BaseSection>

        <BaseSection>
          <h3 className="text-lg font-semibold text-gray-900">Email Body</h3>
          <p className="text-sm text-gray-500">
            Write the email body and insert placeholders where personalized values should appear.
          </p>
          <TemplateVariableEditor
            value={form.emailBody}
            onChange={(value) => setField('emailBody', value)}
            disabled={isDeleting || isSaving}
            valueAsHtml
          />
        </BaseSection>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {isEdit ? (
            <Button
              type="button"
              variant="destructive"
              size="md"
              className="gap-2"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting || isSaving}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                'Delete Template'
              )}
            </Button>
          ) : (
            <div />
          )}
          <Button
            type="submit"
            variant="default"
            size="md"
            className="gap-2"
            disabled={!form.name.trim() || isDeleting || isSaving}
          >
            <Save className="h-4 w-4" aria-hidden />
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : isEdit ? (
              'Save Changes'
            ) : (
              'Create template'
            )}
          </Button>
        </div>
      </form>

      {isEdit && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Delete template?"
        >
          <p className="text-sm text-gray-600">The template will be permanently removed.</p>
          <p className="text-sm text-red-600 mb-4 italic">*This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outlined" size="sm" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="default" size="sm" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : 'Delete'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
