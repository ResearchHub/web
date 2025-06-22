'use client';

import { FC } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AuditStatus } from '@/hooks/useAudit';

interface AuditStatusFilterProps {
  activeStatus: AuditStatus;
  onStatusChange: (status: AuditStatus) => void;
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

export const AuditStatusFilter: FC<AuditStatusFilterProps> = ({
  activeStatus,
  onStatusChange,
  statusCounts,
}) => {
  const statuses: AuditStatus[] = ['pending', 'dismissed', 'removed'];

  return (
    <div className="flex items-center space-x-1 p-1 bg-gray-100 rounded-lg">
      {statuses.map((status) => {
        const isActive = activeStatus === status;
        const count = statusCounts?.[status];

        return (
          <Button
            key={status}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onStatusChange(status)}
            className={`flex items-center space-x-2 ${
              isActive ? 'bg-primary-500 shadow-sm' : 'hover:bg-primary-100/50'
            }`}
          >
            <span>{statusLabels[status]}</span>
            {count !== undefined && (
              <Badge
                className={`text-xs ${
                  isActive ? statusColors[status] : 'bg-gray-200 text-gray-600'
                }`}
              >
                {count}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
};
