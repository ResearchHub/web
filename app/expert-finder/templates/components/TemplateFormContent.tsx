'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2, Save, Sparkles, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { BaseSection } from '@/components/ui/BaseSection';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Modal } from '@/components/ui/form/Modal';
import { Tooltip } from '@/components/ui/Tooltip';
import {
  useSavedTemplateDetail,
  useCreateSavedTemplate,
  useUpdateSavedTemplate,
  useDeleteSavedTemplate,
  useOutreachCampaigns,
  useRewriteTemplate,
  usePublishTemplate,
} from '@/hooks/useExpertFinder';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import type { OutreachCampaign, SavedTemplate } from '@/types/expertFinder';
import { formatTimestamp } from '@/utils/date';
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
  const [{ campaigns, isLoading: campaignsLoading }, refetchCampaigns] =
    useOutreachCampaigns(isEdit);
  const [{ isLoading: isRewriting }, rewriteTemplate] = useRewriteTemplate();
  const [{ isLoading: isPublishing }, publishTemplate] = usePublishTemplate();

  const [form, setForm] = useState<TemplateFormState>(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [publishedCampaign, setPublishedCampaign] = useState<OutreachCampaign | null>(null);

  useEffect(() => {
    if (template) setForm(templateToForm(template));
  }, [template]);

  const matchedCampaign = useMemo(() => {
    if (!templateId) return null;
    const id = Number(templateId);
    return campaigns.find((c) => c.templateId === id) ?? null;
  }, [campaigns, templateId]);

  useEffect(() => {
    setPublishedCampaign(matchedCampaign);
  }, [matchedCampaign]);

  const dirty = isFormDirty(form, template);

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
        await Promise.all([refetch(), refetchCampaigns()]);
        toast.success('Template saved');
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

  const handleRewrite = async () => {
    if (!templateId || dirty) return;
    setActionError(null);
    try {
      const created = await rewriteTemplate(templateId);
      toast.success('Created rewritten template');
      router.push(`/expert-finder/templates/${created.id}`);
    } catch (err) {
      setActionError(extractApiErrorMessage(err, 'Failed to rewrite template'));
    }
  };

  const openPublishModal = () => {
    if (!templateId || dirty) return;
    setActionError(null);
    const defaultName =
      publishedCampaign?.name?.trim() || form.name.trim() || template?.name?.trim() || '';
    setCampaignName(defaultName.slice(0, 100));
    setShowPublishModal(true);
  };

  const handlePublishConfirm = async () => {
    if (!templateId || dirty) return;
    const name = campaignName.trim();
    if (!name) {
      setActionError('Campaign name is required');
      return;
    }
    setActionError(null);
    const wasUpdate = publishedCampaign != null;
    try {
      const campaign = await publishTemplate(templateId, { name });
      setPublishedCampaign(campaign);
      setShowPublishModal(false);
      await refetchCampaigns();
      toast.success(wasUpdate ? 'Campaign updated' : 'Campaign published');
    } catch (err) {
      setActionError(extractApiErrorMessage(err, 'Failed to publish template'));
    }
  };

  const isSaving = isCreating || isUpdating;
  const busy = isDeleting || isSaving || isRewriting || isPublishing;

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

  const campaignForUi = publishedCampaign;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Breadcrumbs
        items={[{ label: 'Templates', href: '/expert-finder/templates' }, { label: displayName }]}
        className="mb-2"
      />

      {(saveError || deleteError || actionError) && (
        <Alert variant="error">{saveError || deleteError || actionError}</Alert>
      )}

      {isEdit ? (
        <div className="flex flex-wrap items-center justify-end">
          <Tooltip
            content="Uses AI to rewrite this template into a new one with different wording, while keeping the same placeholders. Save any edits first so the rewrite uses the current text."
            position="top"
            width="w-72"
            className="text-left"
            wrapperClassName="inline-flex"
          >
            <Button
              type="button"
              variant="outlined"
              size="sm"
              className="gap-2"
              disabled={busy || dirty}
              title={dirty ? 'Save changes before rewriting' : undefined}
              onClick={handleRewrite}
            >
              {isRewriting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="h-4 w-4" aria-hidden />
              )}
              Rewrite
            </Button>
          </Tooltip>
        </div>
      ) : null}

      {isEdit ? (
        <BaseSection>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900">Outreach campaign</h3>
              <p className="text-sm text-gray-500">
                {campaignForUi
                  ? 'Update the campaign with the current template.'
                  : 'Publish this template to create a campaign.'}
              </p>
            </div>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="gap-2"
              disabled={busy || dirty}
              title={
                dirty
                  ? campaignForUi
                    ? 'Save changes before updating'
                    : 'Save changes before publishing'
                  : undefined
              }
              onClick={openPublishModal}
            >
              {isPublishing ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Upload className="h-4 w-4" aria-hidden />
              )}
              {campaignForUi ? 'Update' : 'Publish'}
            </Button>
          </div>

          {dirty ? (
            <Alert variant="warning" className="mt-3">
              {campaignForUi ? 'Save changes before updating.' : 'Save changes before publishing.'}
            </Alert>
          ) : null}

          {campaignsLoading && !campaignForUi ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading campaign…
            </div>
          ) : campaignForUi ? (
            <div className="mt-3 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/expert-finder/campaigns/${campaignForUi.id}`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {campaignForUi.name?.trim() || `Campaign #${campaignForUi.id}`}
                </Link>
                {campaignForUi.hasUnpublishedChanges ? (
                  <Badge variant="warning" size="sm">
                    Unpublished changes
                  </Badge>
                ) : (
                  <Badge variant="success" size="sm">
                    Up to date
                  </Badge>
                )}
                {campaignForUi.publishedAt ? (
                  <span className="text-xs text-gray-500">
                    Published {formatTimestamp(campaignForUi.publishedAt, false)}
                  </span>
                ) : null}
              </div>
              <p className="text-sm font-medium text-gray-900 truncate">
                {campaignForUi.publishedSubject || '—'}
              </p>
              <p className="text-xs text-gray-500">
                Queued {campaignForUi.counts.queued} · Sent {campaignForUi.counts.sent} · Opened{' '}
                {campaignForUi.counts.opened} · Replied {campaignForUi.counts.replied} · Bounced{' '}
                {campaignForUi.counts.bounced}
              </p>
              {campaignForUi.hasUnpublishedChanges ? (
                <p className="text-xs text-amber-700">
                  Template differs from the published version. Update the campaign to use the latest
                  text.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-600">Not published yet.</p>
          )}
        </BaseSection>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          placeholder="e.g. NeurIPS collaboration outreach"
          required
        />

        <BaseSection>
          <h3 className="text-lg font-semibold text-gray-900">Subject</h3>
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
            disabled={busy}
            singleLine
            minHeightClassName="min-h-[32px]"
          />
        </BaseSection>

        <BaseSection>
          <h3 className="text-lg font-semibold text-gray-900">Body</h3>
          <p className="text-sm text-gray-500">
            Write the outreach body and insert placeholders where personalized values should appear.
          </p>
          <TemplateVariableEditor
            value={form.emailBody}
            onChange={(value) => setField('emailBody', value)}
            disabled={busy}
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
              disabled={busy}
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
            disabled={!form.name.trim() || busy}
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

      {isEdit && (
        <Modal
          isOpen={showPublishModal}
          onClose={() => !isPublishing && setShowPublishModal(false)}
          title={publishedCampaign ? 'Update campaign' : 'Publish campaign'}
        >
          <p className="text-sm text-gray-600 mb-3">
            {publishedCampaign ? 'Update the campaign name.' : 'Choose a name for this campaign.'}
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
              {publishedCampaign ? 'Update' : 'Publish'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
