'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Send, Loader2 } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { GrantService } from '@/services/grant.service';
import { isValidEmail } from '@/utils/validation';
import toast from 'react-hot-toast';

interface InviteExpertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  grantId: string | number;
}

const MAX_EMAILS = 100;

export function InviteExpertsModal({ isOpen, onClose, grantId }: InviteExpertsModalProps) {
  const [emails, setEmails] = useState<string[]>(['']);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmails(['']);
      setSubmitting(false);
    }
  }, [isOpen]);

  const updateEmail = (index: number, value: string) => {
    setEmails((prev) => prev.map((e, i) => (i === index ? value : e)));
  };

  const removeEmail = (index: number) => {
    setEmails((prev) => (prev.length === 1 ? [''] : prev.filter((_, i) => i !== index)));
  };

  const addEmail = () => {
    setEmails((prev) => (prev.length >= MAX_EMAILS ? prev : [...prev, '']));
  };

  const cleanedEmails = emails.map((e) => e.trim()).filter((e) => e.length > 0);
  const hasInvalid = cleanedEmails.some((e) => !isValidEmail(e));
  const canSubmit = cleanedEmails.length > 0 && !hasInvalid && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const result = await GrantService.inviteApplicants(grantId, { emails: cleanedEmails });
      const parts: string[] = [];
      if (result.queued > 0) {
        parts.push(`${result.queued} invitation${result.queued === 1 ? '' : 's'} sent`);
      }
      if (result.skippedExisting.length > 0) {
        parts.push(
          `${result.skippedExisting.length} already invited`
        );
      }
      toast.success(parts.length ? parts.join(' · ') : 'Invitations queued');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send invitations');
    } finally {
      setSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-3">
      <Button variant="outlined" onClick={onClose} disabled={submitting}>
        Cancel
      </Button>
      <Button variant="default" onClick={handleSubmit} disabled={!canSubmit}>
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Send invitations
          </>
        )}
      </Button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite experts to apply"
      size="lg"
      footer={footer}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Enter the email addresses of experts you&apos;d like to invite to apply for this RFP.
          We&apos;ll email each of them an invitation on your behalf.
        </p>

        <div className="space-y-2">
          {emails.map((email, index) => {
            const trimmed = email.trim();
            const showError = trimmed.length > 0 && !isValidEmail(trimmed);
            return (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="expert@university.edu"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    disabled={submitting}
                    error={showError ? 'Enter a valid email address' : undefined}
                    autoFocus={index === 0}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEmail(index)}
                  disabled={submitting || (emails.length === 1 && email === '')}
                  aria-label="Remove email"
                  className="text-gray-400 hover:text-red-600 mt-1"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>

        <Button
          variant="ghost"
          onClick={addEmail}
          disabled={submitting || emails.length >= MAX_EMAILS}
          className="text-primary-600 hover:text-primary-700 -ml-2"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add another email
        </Button>

        {emails.length >= MAX_EMAILS && (
          <p className="text-xs text-gray-500">You can invite up to {MAX_EMAILS} experts at once.</p>
        )}
      </div>
    </BaseModal>
  );
}
