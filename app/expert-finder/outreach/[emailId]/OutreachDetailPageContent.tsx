'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Trash2, Send, Loader2, Save, Eye } from 'lucide-react';
import { getTemplateDisplayLabel } from '@/app/expert-finder/library/[searchId]/components/GenerateEmailModal';
import { Alert } from '@/components/ui/Alert';
import { BaseSection } from '@/components/ui/BaseSection';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { TemplateVariableEditor } from '@/app/expert-finder/templates/components/TemplateBodyEditor';
import { Input } from '@/components/ui/form/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/form/Modal';
import {
  useGeneratedEmailDetail,
  useUpdateGeneratedEmail,
  useDeleteGeneratedEmail,
  usePreviewEmails,
  useSendEmails,
} from '@/hooks/useExpertFinder';
import { toast } from 'react-hot-toast';

export interface OutreachDetailPageContentProps {
  emailId: string;
  breadcrumbVariant?: 'outreach' | 'library';
  librarySearchId?: string;
}

export function OutreachDetailPageContent({
  emailId,
  breadcrumbVariant = 'outreach',
  librarySearchId,
}: OutreachDetailPageContentProps) {
  const [{ email, isLoading, error }, refetch] = useGeneratedEmailDetail(emailId);
  const [{ isLoading: isUpdating }, updateEmail] = useUpdateGeneratedEmail();
  const [{ isLoading: isDeleting }, deleteEmail] = useDeleteGeneratedEmail();
  const [{ isLoading: isSendingPreview }, previewEmails] = usePreviewEmails();
  const [{ isLoading: isSendingToExpert }, sendEmails] = useSendEmails();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPreviewConfirm, setShowPreviewConfirm] = useState(false);
  const [showSendToExpertConfirm, setShowSendToExpertConfirm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');

  useEffect(() => {
    if (email) {
      setEditSubject(email.emailSubject ?? '');
      setEditBody(email.emailBody ?? '');
    }
  }, [email?.id, email?.emailSubject, email?.emailBody]);

  const isDraft = email?.status !== 'sent';
  const hasEdits =
    isDraft &&
    (editSubject !== (email?.emailSubject ?? '') || editBody !== (email?.emailBody ?? ''));

  const handleSaveDraft = async () => {
    if (!emailId || !hasEdits) return;
    setActionError(null);
    try {
      await updateEmail(emailId, {
        email_subject: editSubject,
        email_body: editBody,
      });
      refetch();
      toast.success('Draft saved');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to save draft');
    }
  };

  const handleMarkSent = async () => {
    setActionError(null);
    try {
      await updateEmail(emailId, { status: 'sent' });
      refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  const backHref =
    breadcrumbVariant === 'library' && librarySearchId
      ? `/expert-finder/library/${librarySearchId}?tab=outreach`
      : '/expert-finder/outreach';

  const handleDelete = async () => {
    setActionError(null);
    try {
      await deleteEmail(emailId);
      window.location.href = backHref;
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const displaySubject = isDraft ? editSubject : (email?.emailSubject ?? '');
  const displayBody = isDraft ? editBody : (email?.emailBody ?? '');

  const handleSendPreview = async () => {
    if (!emailId || !email) return;
    setActionError(null);
    try {
      await previewEmails([Number(emailId)]);
      setShowPreviewConfirm(false);
      toast.success('Preview email sent to your email address.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to send preview email');
    }
  };

  const handleSendToExpert = async () => {
    if (!emailId || !email) return;
    setActionError(null);
    try {
      await sendEmails({ generated_email_ids: [Number(emailId)] });
      setShowSendToExpertConfirm(false);
      refetch();
      toast.success('Email sent to the expert.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to send email');
    }
  };

  if (isLoading && !email) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const errorBackHref =
    breadcrumbVariant === 'library' && librarySearchId
      ? `/expert-finder/library/${librarySearchId}?tab=outreach`
      : '/expert-finder/outreach';

  if (error && !email) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <Alert variant="error">{error}</Alert>
        <Link
          href={errorBackHref}
          className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          {breadcrumbVariant === 'library' ? 'Back to search' : 'Back to Outreach'}
        </Link>
      </div>
    );
  }

  if (!email) return null;

  const displayTitle = displaySubject || `Email for ${email.expertName}`;
  const breadcrumbLabel = displayTitle.length > 40 ? `${displayTitle.slice(0, 40)}…` : displayTitle;

  const breadcrumbItems =
    breadcrumbVariant === 'library' && librarySearchId
      ? [
          { label: 'Library', href: '/expert-finder/library' },
          {
            label: `Search #${librarySearchId}`,
            href: `/expert-finder/library/${librarySearchId}?tab=outreach`,
          },
          { label: breadcrumbLabel },
        ]
      : [{ label: 'Outreach', href: '/expert-finder/outreach' }, { label: breadcrumbLabel }];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Breadcrumbs items={breadcrumbItems} className="mb-2" />

      {actionError && <Alert variant="error">{actionError}</Alert>}

      <div className="grid grid-cols-1 md:!grid-cols-2 items-start gap-4">
        <div className="min-w-0">
          <div className="flex gap-3">
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-gray-900 sm:!text-lg md:!text-xl mt-0.5">
                {email.expertName || '—'}
              </h1>
            </div>
          </div>
          {email.expertEmail && (
            <div className="flex gap-3">
              <div className="min-w-0">
                <p className="text-sm text-gray-700 mt-0.5 break-all">{email.expertEmail}</p>
              </div>
            </div>
          )}
        </div>
        <div className="min-w-0 flex flex-wrap items-center gap-2 justify-start md:!justify-end">
          <Badge variant={email.status === 'sent' ? 'success' : 'warning'}>
            {email.status === 'sent' ? 'Sent' : 'Draft'}
          </Badge>
          {email.status !== 'sent' && (
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={() => setShowSendToExpertConfirm(true)}
              disabled={isSendingToExpert}
              title="Send this email to the expert"
            >
              {isSendingToExpert ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Send className="h-4 w-4" aria-hidden />
              )}
              Send
            </Button>
          )}
          {email.status !== 'sent' && (
            <Button
              variant="outlined"
              size="sm"
              className="gap-2"
              onClick={() => setShowPreviewConfirm(true)}
              disabled={isSendingPreview}
              title="Send test email to your inbox"
            >
              {isSendingPreview ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )}
              Preview
            </Button>
          )}
          {email.status !== 'sent' && (
            <Button
              variant="default"
              size="sm"
              className="gap-2 bg-amber-500 hover:bg-amber-600"
              onClick={handleMarkSent}
              disabled={isUpdating}
              title="Mark as sent"
            >
              <Mail className="h-4 w-4" aria-hidden />
            </Button>
          )}
        </div>
      </div>

      <BaseSection>
        {isDraft ? (
          <Input
            label="Subject"
            value={editSubject}
            onChange={(e) => setEditSubject(e.target.value)}
            placeholder="Email subject"
          />
        ) : (
          <Input label="Subject" value={email.emailSubject} readOnly className="bg-gray-50" />
        )}
      </BaseSection>

      <BaseSection>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email Body</label>
          {isDraft ? (
            <>
              <TemplateVariableEditor
                value={editBody}
                onChange={setEditBody}
                placeholder="Email body"
                valueAsHtml
                disabled={false}
                showVariablePanel={false}
              />
              {hasEdits && (
                <Button
                  variant="default"
                  size="sm"
                  className="mt-3 gap-2"
                  onClick={handleSaveDraft}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Save className="h-4 w-4" aria-hidden />
                  )}
                  Save draft
                </Button>
              )}
            </>
          ) : !email.emailBody?.trim() ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
              —
            </div>
          ) : (
            <TemplateVariableEditor
              value={email.emailBody ?? ''}
              onChange={() => {}}
              valueAsHtml
              disabled
              showVariablePanel={false}
            />
          )}
        </div>
      </BaseSection>

      {email.status !== 'sent' && (
        <div className="flex justify-end pt-2">
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Delete
          </Button>
        </div>
      )}

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete email?"
      >
        <p className="text-sm text-gray-600 mb-4">This draft will be permanently removed.</p>
        <div className="flex justify-end gap-2">
          <Button variant="outlined" size="sm" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="default" size="sm" onClick={handleDelete} disabled={isDeleting}>
            Delete
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showSendToExpertConfirm}
        onClose={() => !isSendingToExpert && setShowSendToExpertConfirm(false)}
        title="Send this email to the expert?"
      >
        <p className="text-sm text-gray-600 mb-4">
          This email will be sent to the expert. Sending may be disabled in non-production
          environments.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="outlined"
            size="sm"
            onClick={() => setShowSendToExpertConfirm(false)}
            disabled={isSendingToExpert}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSendToExpert}
            disabled={isSendingToExpert}
            className="gap-2"
          >
            {isSendingToExpert ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Send className="h-4 w-4" aria-hidden />
            )}
            Send
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showPreviewConfirm}
        onClose={() => !isSendingPreview && setShowPreviewConfirm(false)}
        title="Send test email"
      >
        <p className="text-sm text-gray-600 mb-4">
          The email will be sent to your email address for testing.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="outlined"
            size="sm"
            onClick={() => setShowPreviewConfirm(false)}
            disabled={isSendingPreview}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSendPreview}
            disabled={isSendingPreview}
            className="gap-2"
          >
            {isSendingPreview ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
            Send
          </Button>
        </div>
      </Modal>
    </div>
  );
}
