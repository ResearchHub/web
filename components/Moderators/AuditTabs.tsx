'use client';

import { FC } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { AuditStatus } from '@/hooks/useAudit';

interface AuditTabsProps {
  activeStatus: AuditStatus;
  onStatusChange: (status: AuditStatus) => void;
  loading?: boolean;
  statusCounts?: {
    pending: number;
    dismissed: number;
    removed: number;
  };
}

const statusLabels: Record<AuditStatus, string> = {
  pending: 'Pending',
  dismissed: 'Dismissed',
  removed: 'Removed',
};

const statusColors: Record<AuditStatus, string> = {
  pending: 'bg-orange-100 text-orange-800',
  dismissed: 'bg-green-100 text-green-800',
  removed: 'bg-red-100 text-red-800',
};

export const AuditTabs: FC<AuditTabsProps> = ({
  activeStatus,
  onStatusChange,
  statusCounts,
  loading,
}) => {
  const statuses: AuditStatus[] = ['pending', 'dismissed', 'removed'];
  const disabledStatuses: AuditStatus[] = [];

  const tabs = [
    // Active tabs
    ...statuses.map((status) => ({
      id: status,
      label: (
        <div className="flex items-center space-x-2">
          <span>{statusLabels[status]}</span>
          {statusCounts?.[status] !== undefined && (
            <Badge
              className={`text-xs ${
                activeStatus === status ? statusColors[status] : 'bg-gray-200 text-gray-600'
              }`}
            >
              {statusCounts[status]}
            </Badge>
          )}
        </div>
      ),
    })),
    // Disabled tabs
    ...disabledStatuses.map((status) => ({
      id: status,
      label: (
        <div className="flex items-center space-x-2 opacity-50">
          <span>{statusLabels[status]}</span>
          {statusCounts?.[status] !== undefined && (
            <Badge className="text-xs bg-gray-200 text-gray-400">{statusCounts[status]}</Badge>
          )}
        </div>
      ),
      disabled: true,
    })),
  ];

  const handleTabChange = (tabId: string) => {
    // Only allow changes to active tabs
    if (statuses.includes(tabId as AuditStatus)) {
      onStatusChange(tabId as AuditStatus);
    }
  };

  return (
    <Tabs
      tabs={tabs}
      activeTab={activeStatus}
      onTabChange={handleTabChange}
      variant="primary"
      disabled={loading}
    />
  );
};
