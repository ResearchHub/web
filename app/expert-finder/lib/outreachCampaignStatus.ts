import type { OutreachCampaign } from '@/types/expertFinder';

export function getOutreachCampaignStatusPresentation(status: string): {
  label: string;
  variant: 'success' | 'warning' | 'error' | 'default';
} {
  switch (status) {
    case 'active':
      return { label: 'Active', variant: 'success' };
    case 'paused':
      return { label: 'Paused', variant: 'warning' };
    case 'no_active_mailboxes':
      return { label: 'No active mailbox', variant: 'warning' };
    case 'error':
      return { label: 'Error', variant: 'error' };
    default:
      return { label: status || 'Unknown', variant: 'default' };
  }
}

/** Display name for campaign pickers and lists. */
export function getOutreachCampaignLabel(
  campaign: Pick<OutreachCampaign, 'id' | 'name' | 'templateName'>
): string {
  return campaign.name?.trim() || campaign.templateName?.trim() || `Campaign #${campaign.id}`;
}
