'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, Upload, MoreVertical } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Alert } from '@/components/ui/Alert';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Modal } from '@/components/ui/form/Modal';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { OutreachEmailContentForm } from '@/app/expert-finder/components/OutreachEmailContentForm';
import {
  useSavedTemplateDetail,
  useCreateSavedTemplate,
  useUpdateSavedTemplate,
  useDeleteSavedTemplate,
  useOutreachCapacity,
  useRewriteTemplate,
  usePublishTemplate,
} from '@/hooks/useExpertFinder';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import type { SavedTemplate } from '@/types/expertFinder';

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

const EMAILS_PATH = '/expert-finder/emails';

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

function isFormDirty(form: TemplateFormState, template: SavedTemplate | null): boolean {
  if (!template) return false;
  return (
    form.name !== template.name ||
    form.emailSubject !== template.emailSubject ||
    form.emailBody !== template.emailBody
  );
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
  const [{ capacity, isLoading: capacityLoading }] = useOutreachCapacity(isEdit);
  const [{ isLoading: isRewriting }, rewriteTemplate] = useRewriteTemplate();
  const [{ isLoading: isPublishing }, publishTemplate] = usePublishTemplate();

  const [form, setForm] = useState<TemplateFormState>(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (template) setForm(templateToForm(template));
  }, [template]);

  const dirty = isFormDirty(form, template);
  const noMailbox =
    !capacityLoading && capacity != null && (capacity.activeMailboxCount ?? 0) === 0;

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
        toast.success('Draft saved');
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Failed to save');
      }
    } else {
      try {
        const created = await createTemplate(formToCreatePayload(form));
        router.push(`${EMAILS_PATH}/${created.id}`);
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
      window.location.href = EMAILS_PATH;
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleRewrite = async () => {
    if (!templateId || dirty) return;
    setActionError(null);
    try {
      const created = await rewriteTemplate(templateId);
      toast.success('Created rewritten draft');
      router.push(`${EMAILS_PATH}/${created.id}`);
    } catch (err) {
      setActionError(extractApiErrorMessage(err, 'Failed to rewrite draft'));
    }
  };

  const openPublishModal = () => {
    if (!templateId || dirty || noMailbox) return;
    setActionError(null);
    const defaultName = form.name.trim() || template?.name?.trim() || '';
    setCampaignName(defaultName.slice(0, 100));
    setShowPublishModal(true);
  };

  const handlePublishConfirm = async () => {
    if (!templateId || dirty || noMailbox) return;
    const name = campaignName.trim();
    if (!name) {
      setActionError('Campaign name is required');
      return;
    }
    setActionError(null);
    try {
      const campaign = await publishTemplate(templateId, { name });
      setShowPublishModal(false);
      toast.success('Campaign created');
      router.push(`/expert-finder/campaigns/${campaign.id}`);
    } catch (err) {
      setActionError(extractApiErrorMessage(err, 'Failed to publish campaign'));
    }
  };

  const isSaving = isCreating || isUpdating;
  const busy = isDeleting || isSaving || isRewriting || isPublishing;
  const canPublish = !busy && !dirty && !noMailbox;
  const canRewrite = !busy && !dirty;

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
            href={EMAILS_PATH}
            className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
          >
            Back to Emails
          </Link>
        </div>
      );
    }
    if (!template) return null;
  }

  const displayName = isEdit && template ? template.name || `Draft #${templateId}` : 'New draft';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Breadcrumbs
          items={[{ label: 'Emails', href: EMAILS_PATH }, { label: displayName }]}
          className="mb-0"
        />

        {isEdit ? (
          <BaseMenu
            align="end"
            trigger={
              <Button
                type="button"
                variant="outlined"
                size="sm"
                className="gap-1.5"
                disabled={busy}
                aria-label="Draft actions"
              >
                <MoreVertical className="h-4 w-4" aria-hidden />
              </Button>
            }
          >
            <BaseMenuItem
              disabled={!canRewrite}
              onSelect={() => void handleRewrite()}
              className="cursor-pointer gap-2"
              title={dirty ? 'Save changes before reviewing' : undefined}
            >
              {isRewriting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="h-4 w-4" aria-hidden />
              )}
              Review with AI
            </BaseMenuItem>
            <BaseMenuItem
              disabled={!canPublish}
              onSelect={openPublishModal}
              className="cursor-pointer gap-2"
              title={
                noMailbox
                  ? 'Connect a mailbox before publishing'
                  : dirty
                    ? 'Save changes before publishing'
                    : undefined
              }
            >
              {isPublishing ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Upload className="h-4 w-4" aria-hidden />
              )}
              Publish
            </BaseMenuItem>
          </BaseMenu>
        ) : null}
      </div>

      {(saveError || deleteError || actionError) && (
        <Alert variant="error">{saveError || deleteError || actionError}</Alert>
      )}

      {isEdit && noMailbox ? (
        <Alert variant="warning">
          Connect a mailbox before publishing.{' '}
          <Link
            href="/expert-finder/settings"
            className="font-medium text-primary-700 underline-offset-2 hover:underline"
          >
            Open settings
          </Link>
        </Alert>
      ) : null}

      {isEdit && dirty ? (
        <Alert variant="warning">Save changes before reviewing with AI or publishing.</Alert>
      ) : null}

      <OutreachEmailContentForm
        values={form}
        onChange={setField}
        onSubmit={handleSubmit}
        disabled={busy}
        deleteLabel={isEdit ? 'Delete draft' : undefined}
        onDelete={isEdit ? () => setShowDeleteConfirm(true) : undefined}
        isDeleting={isDeleting}
        submitLabel={isEdit ? 'Save changes' : 'Create draft'}
        isSubmitting={isSaving}
      />

      {isEdit && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Delete draft?"
        >
          <p className="text-sm text-gray-600">The draft will be permanently removed.</p>
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

      {isEdit && (
        <Modal
          isOpen={showPublishModal}
          onClose={() => !isPublishing && setShowPublishModal(false)}
          title="Publish campaign"
        >
          <p className="text-sm text-gray-600 mb-3">
            Creates a new campaign from this draft. Choose a name for the campaign.
          </p>
          <Input
            label="Campaign name"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value.slice(0, 100))}
            placeholder="e.g. Spring RFP blast"
            required
            disabled={isPublishing}
            helperText={`${campaignName.trim().length}/100`}
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outlined"
              size="sm"
              disabled={isPublishing}
              onClick={() => setShowPublishModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              disabled={isPublishing || !campaignName.trim()}
              onClick={() => void handlePublishConfirm()}
            >
              {isPublishing ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Upload className="h-4 w-4" aria-hidden />
              )}
              Publish
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
