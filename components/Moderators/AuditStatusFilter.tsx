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
  // Temporarily disable 'removed' tab due to backend issues
  const statuses: AuditStatus[] = ['pending', 'dismissed'];
  const disabledStatuses: AuditStatus[] = ['removed'];

  return (
    <div className="flex items-center space-x-1 p-1 bg-gray-100 rounded-lg">
      {/* Active tabs */}
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

      {/* Disabled tabs */}
      {disabledStatuses.map((status) => {
        const count = statusCounts?.[status];

        return (
          <Button
            key={status}
            variant="ghost"
            size="sm"
            disabled
            className="flex items-center space-x-2 opacity-50 cursor-not-allowed"
            title="Temporarily disabled due to server issues"
          >
            <span>{statusLabels[status]}</span>
            {count !== undefined && (
              <Badge className="text-xs bg-gray-200 text-gray-400">{count}</Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
};
