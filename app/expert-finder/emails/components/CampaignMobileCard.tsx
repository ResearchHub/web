'use client';

import { Badge } from '@/components/ui/Badge';
import { ListCard } from '@/components/ui/ListCard';
import {
  getOutreachCampaignLabel,
  getOutreachCampaignStatusPresentation,
} from '@/app/expert-finder/lib/outreachCampaignStatus';
import { formatTimestamp } from '@/utils/date';
import type { OutreachCampaign } from '@/types/expertFinder';

export interface CampaignMobileCardProps {
  campaign: OutreachCampaign;
  onClick: () => void;
  className?: string;
}

export function CampaignMobileCard({ campaign, onClick, className }: CampaignMobileCardProps) {
  const status = getOutreachCampaignStatusPresentation(campaign.status);

  return (
    <ListCard onClick={onClick} className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {getOutreachCampaignLabel(campaign)}
        </h3>
        <Badge variant={status.variant} size="sm">
          {status.label}
        </Badge>
      </div>
      <p className="text-xs text-gray-600 mt-1 truncate">
        {campaign.publishedSubject?.trim() || '—'}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Queued {campaign.counts.queued} · Sent {campaign.counts.sent} · Replied{' '}
        {campaign.counts.replied}
      </p>
      {campaign.publishedAt ? (
        <p className="text-xs text-gray-500 mt-2">
          Published {formatTimestamp(campaign.publishedAt, false)}
        </p>
      ) : null}
    </ListCard>
  );
}
