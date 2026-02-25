'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Copy, Mail, Trash2, Send, Loader2, Save } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { BaseSection } from '@/components/ui/BaseSection';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Textarea } from '@/components/ui/form/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/form/Modal';
import {
  useGeneratedEmailDetail,
  useUpdateGeneratedEmail,
  useDeleteGeneratedEmail,
} from '@/hooks/useExpertFinder';
import { formatTimestamp } from '@/utils/date';
import { toast } from 'react-hot-toast';

export interface OutreachDetailPageContentProps {
  emailId: string;
}

export function OutreachDetailPageContent({ emailId }: OutreachDetailPageContentProps) {
  const [{ email, isLoading, error }, refetch] = useGeneratedEmailDetail(emailId);
  const [{ isLoading: isUpdating }, updateEmail] = useUpdateGeneratedEmail();
  const [{ isLoading: isDeleting }, deleteEmail] = useDeleteGeneratedEmail();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  const handleDelete = async () => {
    setActionError(null);
    try {
      await deleteEmail(emailId);
      window.location.href = '/expert-finder/outreach';
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const displaySubject = isDraft ? editSubject : (email?.emailSubject ?? '');
  const displayBody = isDraft ? editBody : (email?.emailBody ?? '');

  const handleCopy = () => {
    if (!email) return;
    const text = `Subject: ${displaySubject}\n\n${displayBody}`;
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success('Email copied to clipboard');
      },
      () => toast.error('Failed to copy email')
    );
  };

  const handleSend = () => {
    if (!email) return;
    const subject = encodeURIComponent(displaySubject);
    const body = encodeURIComponent(displayBody);
    window.location.href = `mailto:${email.expertEmail || ''}?subject=${subject}&body=${body}`;
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

  if (error && !email) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <Alert variant="error">{error}</Alert>
        <Link
          href="/expert-finder/outreach"
          className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          Back to Outreach
        </Link>
      </div>
    );
  }

  if (!email) return null;

  const displayTitle = displaySubject || `Email for ${email.expertName}`;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Outreach', href: '/expert-finder/outreach' },
          { label: displayTitle.length > 40 ? `${displayTitle.slice(0, 40)}…` : displayTitle },
        ]}
        className="mb-2"
      />

      {actionError && <Alert variant="error">{actionError}</Alert>}

      <div className="grid grid-cols-1 md:!grid-cols-2 gap-4 items-start">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900">{email.expertName || '—'}</h1>
          {email.expertEmail && <p className="text-sm text-gray-600 mt-0.5">{email.expertEmail}</p>}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
            {email.expertTitle && <span>Title: {email.expertTitle}</span>}
            {email.expertAffiliation && <span>Affiliation: {email.expertAffiliation}</span>}
          </div>
          {email.expertise && (
            <p className="text-sm text-gray-600 mt-1">Expertise: {email.expertise}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Template: {email.template || '—'} · Created: {formatTimestamp(email.createdAt, false)}
          </p>
        </div>
        <div className="min-w-0 flex flex-wrap items-center gap-2">
          <Button variant="outlined" size="sm" className="gap-2" onClick={handleCopy}>
            <Copy className="h-4 w-4" aria-hidden />
            Copy
          </Button>
          <Button variant="outlined" size="sm" className="gap-2" onClick={handleSend}>
            <Mail className="h-4 w-4" aria-hidden />
            Send
          </Button>
          {email.status !== 'sent' && (
            <Button
              variant="default"
              size="sm"
              className="gap-2 bg-amber-500 hover:bg-amber-600"
              onClick={handleMarkSent}
              disabled={isUpdating}
            >
              <Send className="h-4 w-4" aria-hidden />
              Mark Sent
            </Button>
          )}
          <Badge variant={email.status === 'sent' ? 'success' : 'warning'}>
            {email.status === 'sent' ? 'Sent' : 'Draft'}
          </Badge>
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
        {isDraft ? (
          <>
            <Textarea
              label="Email Body"
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              placeholder="Email body"
              rows={12}
              className="min-h-[200px]"
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
        ) : (
          <>
            <label className="block text-sm font-semibold text-gray-700">Email Body</label>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 whitespace-pre-wrap">
              {email.emailBody || '—'}
            </div>
          </>
        )}
      </BaseSection>

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
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
