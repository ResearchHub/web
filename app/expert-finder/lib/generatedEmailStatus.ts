export function isGeneratedEmailDraftLike(status: string): boolean {
  return status === 'draft';
}

export function isGeneratedEmailClosed(status: string): boolean {
  return status === 'closed';
}

export function isGeneratedEmailPipelineBusy(status: string): boolean {
  return status === 'processing' || status === 'sending';
}

export function isGeneratedEmailBounced(status: string): boolean {
  return status === 'bounced';
}

export function isGeneratedEmailFailed(status: string): boolean {
  return status === 'failed' || status === 'send_failed';
}

export type GeneratedEmailStatusBadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'successStrong'
  | 'warning'
  | 'error';

export function getGeneratedEmailStatusPresentation(
  status: string,
  openCount: number = 0
): {
  label: string;
  variant: GeneratedEmailStatusBadgeVariant;
} {
  if (status === 'sent' && openCount > 0) {
    return {
      label: openCount === 1 ? 'Opened' : `Opened ${openCount}x`,
      variant: 'successStrong',
    };
  }
  switch (status) {
    case 'bounced':
      return { label: 'Bounced', variant: 'error' };
    case 'draft':
      return { label: 'Draft', variant: 'primary' };
    case 'sent':
      return { label: 'Sent', variant: 'success' };
    case 'closed':
      return { label: 'Closed', variant: 'default' };
    case 'processing':
      return { label: 'Processing', variant: 'warning' };
    case 'sending':
      return { label: 'Sending', variant: 'warning' };
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
