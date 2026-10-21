'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { TableContainer, SortableColumn } from '@/components/ui/Table/TableContainer';
import {
  getOutreachCampaignLabel,
  getOutreachCampaignStatusPresentation,
} from '@/app/expert-finder/lib/outreachCampaignStatus';
import { formatTimestamp } from '@/utils/date';
import type { OutreachCampaign } from '@/types/expertFinder';

const CAMPAIGN_DETAIL_PATH = '/expert-finder/campaigns';

const COLUMNS: SortableColumn[] = [
  { key: 'name', label: 'Name', sortable: false },
  { key: 'status', label: 'Status', sortable: false },
  { key: 'subject', label: 'Subject', sortable: false },
  { key: 'queued', label: 'Queued', sortable: false },
  { key: 'sent', label: 'Sent', sortable: false },
  { key: 'replied', label: 'Replied', sortable: false },
  { key: 'published', label: 'Published', sortable: false },
];

interface CampaignsTableProps {
  campaigns: OutreachCampaign[];
  onRowClick?: (campaign: OutreachCampaign) => void;
}

export function CampaignsTable({ campaigns, onRowClick }: CampaignsTableProps) {
  const data = campaigns.map((campaign) => {
    const status = getOutreachCampaignStatusPresentation(campaign.status);
    return {
      id: campaign.id,
      name: (
        <Link
          href={`${CAMPAIGN_DETAIL_PATH}/${campaign.id}`}
          className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline truncate block max-w-[200px]"
          onClick={(e) => e.stopPropagation()}
        >
          {getOutreachCampaignLabel(campaign)}
        </Link>
      ),
      status: (
        <Badge variant={status.variant} size="sm">
          {status.label}
        </Badge>
      ),
      subject: (
        <span className="text-xs text-gray-700 truncate block max-w-[180px]">
          {campaign.publishedSubject?.trim() || '—'}
        </span>
      ),
      queued: <span className="text-sm text-gray-700 tabular-nums">{campaign.counts.queued}</span>,
      sent: <span className="text-sm text-gray-700 tabular-nums">{campaign.counts.sent}</span>,
      replied: <span className="text-sm text-gray-700 tabular-nums">{campaign.counts.replied}</span>,
      published: (
        <span className="text-xs text-gray-600 whitespace-nowrap">
          {campaign.publishedAt ? formatTimestamp(campaign.publishedAt, false) : '—'}
        </span>
      ),
    };
  });

  return (
    <TableContainer
      columns={COLUMNS}
      data={data}
      rowKey="id"
      className="w-full cursor-pointer"
      onRowClick={(row) => {
        const campaign = campaigns.find((c) => c.id === row.id);
        if (campaign) onRowClick?.(campaign);
      }}
    />
  );
}

export { COLUMNS as CAMPAIGNS_TABLE_COLUMNS };
