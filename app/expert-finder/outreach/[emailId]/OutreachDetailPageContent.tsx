'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Mail, Trash2, Send, Loader2 } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { BaseSection } from '@/components/ui/BaseSection';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
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

  const handleCopy = () => {
    if (!email) return;
    const text = `Subject: ${email.emailSubject}\n\n${email.emailBody}`;
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success('Email copied to clipboard');
      },
      () => toast.error('Failed to copy email')
    );
  };

  const handleSend = () => {
    if (!email) return;
    const subject = encodeURIComponent(email.emailSubject);
    const body = encodeURIComponent(email.emailBody);
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

  const displayTitle = email.emailSubject || `Email for ${email.expertName}`;

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
        <Input label="Subject" value={email.emailSubject} readOnly className="bg-gray-50" />
      </BaseSection>

      <BaseSection>
        <label className="block text-sm font-semibold text-gray-700">Email Body</label>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 whitespace-pre-wrap">
          {email.emailBody || '—'}
        </div>
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
