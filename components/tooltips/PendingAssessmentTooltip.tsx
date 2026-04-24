'use client';

import { Clock } from 'lucide-react';

export function PendingAssessmentTooltip() {
  return (
    <div className="flex items-start gap-3 text-left">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
        <Clock className="h-4 w-4 text-amber-700" />
      </div>
      <div>
        <div className="font-semibold text-amber-900">Awaiting editor review</div>
        <div className="mt-0.5 text-xs text-amber-800">
          The ResearchHub Foundation Editor Team hasn't assessed this peer review yet. Read it, but
          interpret with caution.
        </div>
      </div>
    </div>
  );
}
