'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Trash2,
  Send,
  Loader2,
  Save,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Octagon,
} from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { BaseSection } from '@/components/ui/BaseSection';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { TemplateVariableEditor } from '@/app/expert-finder/templates/components/TemplateBodyEditor';
import { Input } from '@/components/ui/form/Input';
import { Badge } from '@/components/ui/Badge';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { ConfirmationModal } from '@/components/ui/form/ConfirmationModal';
import { SendConfirmationModal } from '@/app/expert-finder/components/SendConfirmationModal';
import { Textarea } from '@/components/ui/form/Textarea';
import {
  getGeneratedEmailStatusPresentation,
  isGeneratedEmailClosed,
  isGeneratedEmailDraftLike,
  isGeneratedEmailFailed,
  isGeneratedEmailPipelineBusy,
} from '@/app/expert-finder/lib/generatedEmailStatus';
import { cn } from '@/utils/styles';
import {
  useGeneratedEmailDetail,
  useUpdateGeneratedEmail,
  useDeleteGeneratedEmail,
  usePreviewEmails,
  useSendEmails,
} from '@/hooks/useExpertFinder';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'react-hot-toast';
import { isValidEmail } from '@/utils/validation';
import { TAB_OUTREACH } from '@/app/expert-finder/lib/searchDetailTabs';
import { useOutreachReplyTo } from '@/hooks/useOutreachReplyTo';

function buildOutreachDetailHref(librarySearchId: string, neighborEmailId: number): string {
  return `/expert-finder/library/${librarySearchId}/outreach/${neighborEmailId}`;
}

export interface OutreachDetailPageContentProps {
  emailId: string;
  librarySearchId: string;
}

export function OutreachDetailPageContent({
  emailId,
  librarySearchId,
}: OutreachDetailPageContentProps) {
  const router = useRouter();
  const { user } = useUser();
  const [{ email, isLoading, error }, refetch] = useGeneratedEmailDetail(emailId);
  const [{ isLoading: isUpdating }, updateEmail] = useUpdateGeneratedEmail();
  const [{ isLoading: isDeleting }, deleteEmail] = useDeleteGeneratedEmail();
  const [{ isLoading: isSendingPreview }, previewEmails] = usePreviewEmails();
  const [{ isLoading: isSendingToExpert }, sendEmails] = useSendEmails();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPreviewConfirm, setShowPreviewConfirm] = useState(false);
  const [showSendToExpertConfirm, setShowSendToExpertConfirm] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showMarkSentConfirm, setShowMarkSentConfirm] = useState(false);
  const [closeNotes, setCloseNotes] = useState('');
  const [markSentNotes, setMarkSentNotes] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const { replyTo, setReplyTo } = useOutreachReplyTo();

  const backHref = useMemo(
    () => `/expert-finder/library/${librarySearchId}?tab=${TAB_OUTREACH}`,
    [librarySearchId]
  );

  const neighborNav = useMemo(() => {
    const nav = email?.listNavigation;
    if (!nav) {
      return {
        prevHref: null as string | null,
        nextHref: null as string | null,
        positionLabel: null as string | null,
      };
    }
    const positionLabel =
      nav.total > 0 && nav.position != null && nav.position >= 1
        ? `${nav.position} of ${nav.total}`
        : null;
    return {
      prevHref:
        nav.previousId != null && nav.previousId > 0
          ? buildOutreachDetailHref(librarySearchId, nav.previousId)
          : null,
      nextHref:
        nav.nextId != null && nav.nextId > 0
          ? buildOutreachDetailHref(librarySearchId, nav.nextId)
          : null,
      positionLabel,
    };
  }, [email, librarySearchId]);

  useEffect(() => {
    if (email) {
      setEditSubject(email.emailSubject ?? '');
      setEditBody(email.emailBody ?? '');
    }
  }, [email?.id, email?.emailSubject, email?.emailBody]);

  useEffect(() => {
    if (!showSendToExpertConfirm && !showPreviewConfirm) return;
    if (!user?.email) return;
    setReplyTo((prev) => (prev.trim() ? prev : user.email));
  }, [showSendToExpertConfirm, showPreviewConfirm, user?.email]);

  const isDraftLike = email != null && isGeneratedEmailDraftLike(email.status);
  const hasEdits =
    email != null &&
    isDraftLike &&
    (editSubject !== (email.emailSubject ?? '') || editBody !== (email.emailBody ?? ''));

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

  const handleMarkSentSubmit = async () => {
    if (!emailId) return;
    setActionError(null);
    try {
      const notes = markSentNotes.trim();
      await updateEmail(emailId, {
        status: 'sent',
        ...(notes ? { notes } : {}),
      });
      setShowMarkSentConfirm(false);
      setMarkSentNotes('');
      refetch();
      toast.success('Email marked as sent.');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to update');
    }
  };

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

  const displaySubject = email != null && isDraftLike ? editSubject : (email?.emailSubject ?? '');

  const handleSendPreview = async () => {
    if (!emailId || !email) return;
    const trimmedReplyTo = (replyTo ?? '').trim();
    if (!trimmedReplyTo || !isValidEmail(trimmedReplyTo)) {
      setActionError('Please enter a valid Reply To email address.');
      return;
    }
    setActionError(null);
    try {
      await previewEmails({
        generated_email_ids: [Number(emailId)],
        reply_to: trimmedReplyTo,
      });
      setShowPreviewConfirm(false);
      toast.success('Preview email sent to your email address.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to send preview email');
    }
  };

  const handleSendToExpert = async () => {
    if (!emailId || !email) return;
    const trimmedReplyTo = (replyTo ?? '').trim();
    if (!trimmedReplyTo || !isValidEmail(trimmedReplyTo)) {
      setActionError('Please enter a valid Reply To email address.');
      return;
    }
    setActionError(null);
    try {
      await sendEmails({
        generated_email_ids: [Number(emailId)],
        reply_to: trimmedReplyTo,
      });
      setShowSendToExpertConfirm(false);
      refetch();
      toast.success('Email sent to the expert.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to send email');
    }
  };

  const handleCloseEmail = async () => {
    if (!emailId) return;
    setActionError(null);
    try {
      const notes = closeNotes.trim();
      await updateEmail(emailId, {
        status: 'closed',
        ...(notes ? { notes } : {}),
      });
      setShowCloseConfirm(false);
      setCloseNotes('');
      refetch();
      toast.success('Email marked as closed.');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to close email');
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

  if (error && !email) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <Alert variant="error">{error}</Alert>
        <Link
          href={backHref}
          className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          Back to search
        </Link>
      </div>
    );
  }

  if (!email) return null;

  const isClosed = isGeneratedEmailClosed(email.status);
  const isSent = email.status === 'sent';
  const statusPresentation = getGeneratedEmailStatusPresentation(email.status);
  const pipelineBusy = isGeneratedEmailPipelineBusy(email.status);
  /** No overflow actions once the message is sent or retired (draft / failed / in-flight still get Preview, etc.). */
  const showOutreachMoreMenu = !isClosed && !isSent;
  const failedOrDraftForPreview =
    isGeneratedEmailDraftLike(email.status) || isGeneratedEmailFailed(email.status);

  const displayTitle = displaySubject || `Email for ${email.expertName}`;
  const breadcrumbLabel = displayTitle.length > 40 ? `${displayTitle.slice(0, 40)}…` : displayTitle;

  const breadcrumbItems = [
    { label: 'Library', href: '/expert-finder/library' },
    {
      label: `Search #${librarySearchId}`,
      href: backHref,
    },
    { label: breadcrumbLabel },
  ];

  const neighborNavBar = (
    <div className="flex flex-wrap items-center gap-2 justify-start md:!justify-end">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={!neighborNav.prevHref}
        aria-label="Previous email"
        onClick={() => {
          if (neighborNav.prevHref) router.push(neighborNav.prevHref);
        }}
      >
        <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
      </Button>
      {neighborNav.positionLabel ? (
        <span className="text-sm text-gray-600 tabular-nums px-1">{neighborNav.positionLabel}</span>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={!neighborNav.nextHref}
        aria-label="Next email"
        onClick={() => {
          if (neighborNav.nextHref) router.push(neighborNav.nextHref);
        }}
      >
        <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
      </Button>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Breadcrumbs items={breadcrumbItems} className="mb-2" />

      <div className="sm:!hidden">{neighborNavBar}</div>

      {actionError && <Alert variant="error">{actionError}</Alert>}

      {pipelineBusy && (
        <Alert variant="warning">
          This email is {email.status === 'sending' ? 'being sent' : 'processing'}. Some actions may
          be unavailable until it finishes.
        </Alert>
      )}

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
          {email.createdBy?.author && (
            <div className="mt-2 text-sm text-gray-600">
              Created by:{' '}
              {email.createdBy.author.id ? (
                <AuthorTooltip authorId={email.createdBy.author.id}>
                  <Link
                    href={`/author/${email.createdBy.author.id}`}
                    className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    {email.createdBy.author.fullName}
                  </Link>
                </AuthorTooltip>
              ) : (
                <span className="font-medium text-gray-900">{email.createdBy.author.fullName}</span>
              )}
            </div>
          )}
        </div>
        <div className="min-w-0 flex flex-col gap-2">
          <div className="hidden sm:!block">{neighborNavBar}</div>
          <div className="flex flex-wrap items-center gap-2 justify-start md:!justify-end">
            <Badge variant={statusPresentation.variant}>{statusPresentation.label}</Badge>
            {isDraftLike && (
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
            {showOutreachMoreMenu && (
              <BaseMenu
                align="end"
                trigger={
                  <button
                    type="button"
                    className={cn(
                      'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm transition-colors',
                      'hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
                    )}
                    aria-label="More email actions"
                  >
                    <MoreVertical className="h-4 w-4" aria-hidden />
                  </button>
                }
              >
                {failedOrDraftForPreview && (
                  <BaseMenuItem
                    disabled={isSendingPreview || pipelineBusy}
                    onSelect={() => setShowPreviewConfirm(true)}
                  >
                    <Eye className="h-4 w-4 mr-2 shrink-0 text-gray-500" aria-hidden />
                    <span>Preview</span>
                  </BaseMenuItem>
                )}
                {isDraftLike && (
                  <BaseMenuItem
                    disabled={isUpdating}
                    onSelect={() => {
                      setMarkSentNotes('');
                      setShowMarkSentConfirm(true);
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2 shrink-0 text-amber-600" aria-hidden />
                    <span>Mark as sent</span>
                  </BaseMenuItem>
                )}
                <BaseMenuItem
                  disabled={isUpdating}
                  onSelect={() => {
                    setCloseNotes('');
                    setShowCloseConfirm(true);
                  }}
                >
                  <Octagon className="h-4 w-4 mr-2 shrink-0" aria-hidden />
                  <span>Mark as closed</span>
                </BaseMenuItem>
              </BaseMenu>
            )}
          </div>
        </div>
      </div>

      <BaseSection>
        <div>
          {isDraftLike ? (
            <Input
              label="Subject"
              value={editSubject}
              onChange={(e) => setEditSubject(e.target.value)}
              placeholder="Email subject"
            />
          ) : (
            <Input label="Subject" value={email.emailSubject} readOnly className="bg-gray-50" />
          )}
        </div>

        {(isClosed || email.status === 'sent') && email.notes?.trim() ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Notes</p>
            <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{email.notes}</p>
          </div>
        ) : null}

        <div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Body</label>
            {isDraftLike ? (
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
        </div>
      </BaseSection>

      {isDraftLike && (
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

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete email?"
        description="This draft will be permanently removed."
        confirmLabel="Delete"
        confirmVariant="destructive"
        confirmIcon={<Trash2 className="h-4 w-4" aria-hidden />}
        isConfirming={isDeleting}
        blockDismissWhileConfirming={false}
        onConfirm={handleDelete}
      />

      <SendConfirmationModal
        isOpen={showSendToExpertConfirm}
        onClose={() => setShowSendToExpertConfirm(false)}
        isSubmitting={isSendingToExpert}
        title="Send this email to the expert?"
        description="This email will be sent to the expert."
        replyTo={replyTo}
        onReplyToChange={setReplyTo}
        onConfirm={handleSendToExpert}
        confirmLabel="Send"
        confirmIcon={<Send className="h-4 w-4" aria-hidden />}
      />

      <SendConfirmationModal
        isOpen={showPreviewConfirm}
        onClose={() => setShowPreviewConfirm(false)}
        isSubmitting={isSendingPreview}
        title="Send test email"
        description="A test copy is sent to your inbox. Reply To is included on the message for the preview send."
        replyTo={replyTo}
        onReplyToChange={setReplyTo}
        onConfirm={handleSendPreview}
        confirmLabel="Send"
        confirmIcon={<Eye className="h-4 w-4" aria-hidden />}
      />

      <ConfirmationModal
        isOpen={showMarkSentConfirm}
        onClose={() => setShowMarkSentConfirm(false)}
        title="Mark as sent?"
        description="Use this if you already sent the message outside ResearchHub (e.g. from Gmail). Optional note helps your team see how it went out."
        descriptionClassName="mb-3"
        confirmLabel="Mark as sent"
        confirmClassName="gap-2 bg-amber-500 text-white hover:bg-amber-600"
        confirmIcon={<Mail className="h-4 w-4" aria-hidden />}
        isConfirming={isUpdating}
        onConfirm={() => void handleMarkSentSubmit()}
      >
        <Textarea
          label="Notes (optional)"
          value={markSentNotes}
          onChange={(e) => setMarkSentNotes(e.target.value)}
          placeholder="e.g. Sent manually via Gmail"
          rows={3}
          className="mb-4"
        />
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={showCloseConfirm}
        onClose={() => setShowCloseConfirm(false)}
        title="Mark as closed?"
        description="This retires the generated email (inactive). You can add an optional note for your team."
        descriptionClassName="mb-3"
        confirmLabel="Mark closed"
        isConfirming={isUpdating}
        onConfirm={() => void handleCloseEmail()}
      >
        <Textarea
          label="Notes (optional)"
          value={closeNotes}
          onChange={(e) => setCloseNotes(e.target.value)}
          placeholder="e.g. Replaced by outreach email id 456"
          rows={3}
          className="mb-4"
        />
      </ConfirmationModal>
    </div>
  );
}
