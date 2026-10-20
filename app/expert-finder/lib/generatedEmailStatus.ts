import type { GeneratedEmail } from '@/types/expertFinder';

export function isGeneratedEmailDraftLike(status: string): boolean {
  return status === 'draft';
}

export function isGeneratedEmailClosed(status: string): boolean {
  return status === 'closed';
}

export function isGeneratedEmailPipelineBusy(status: string): boolean {
  return status === 'processing' || status === 'sending';
}

export function isGeneratedEmailBounced(
  email: Pick<GeneratedEmail, 'status' | 'bouncedAt'>
): boolean {
  return email.status === 'bounced' || Boolean(email.bouncedAt);
}

export function isGeneratedEmailFailed(status: string): boolean {
  return status === 'failed' || status === 'send_failed';
}

export type GeneratedEmailStatusBadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error';

export type GeneratedEmailStatusInput = Pick<
  GeneratedEmail,
  'status' | 'openCount' | 'openedAt' | 'bouncedAt' | 'repliedAt' | 'sentAt' | 'complainedAt'
>;

/**
 * Delivery-aware badge presentation.
 * Precedence: complained → bounced → replied → opened → sent → queued/sending → draft → failed.
 */
export function getGeneratedEmailStatusPresentation(email: GeneratedEmailStatusInput): {
  label: string;
  variant: GeneratedEmailStatusBadgeVariant;
} {
  const { status, openCount = 0, openedAt, bouncedAt, repliedAt, sentAt, complainedAt } = email;

  if (status === 'complained' || complainedAt) {
    return { label: 'Complained', variant: 'error' };
  }
  if (status === 'bounced' || bouncedAt) {
    return { label: 'Bounced', variant: 'error' };
  }
  if (repliedAt) {
    return { label: 'Replied', variant: 'success' };
  }
  if (openedAt || openCount > 0) {
    return { label: 'Opened', variant: 'success' };
  }
  if (sentAt || status === 'sent') {
    return { label: 'Sent', variant: 'success' };
  }

  switch (status) {
    case 'draft':
      return { label: 'Draft', variant: 'primary' };
    case 'closed':
      return { label: 'Closed', variant: 'default' };
    case 'processing':
      return { label: 'Queued', variant: 'warning' };
    case 'sending':
      return { label: 'Pending delivery', variant: 'warning' };
    case 'failed':
      return { label: 'Failed', variant: 'error' };
    case 'send_failed':
      return { label: 'Send failed', variant: 'error' };
    default:
      return {
        label: humanizeUnknownStatus(status),
        variant: 'default',
      };
  }
}

function humanizeUnknownStatus(status: string): string {
  const t = status?.trim();
  if (!t) return 'Unknown';
  return t
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
