'use client';

import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { PendingAssessmentTooltip } from '@/components/tooltips/PendingAssessmentTooltip';

export const PendingAssessmentBadge = () => {
  return (
    <Tooltip
      className="!bg-amber-50 !border-amber-300 !text-amber-900 !text-left"
      content={<PendingAssessmentTooltip />}
      position="top"
      width="w-[320px]"
    >
      <Badge
        variant="default"
        className="gap-1.5 py-1 border-amber-300 bg-amber-50 text-amber-800 cursor-help"
      >
        <Clock className="h-3.5 w-3.5" />
        Pending assessment
      </Badge>
    </Tooltip>
  );
};
