'use client';

import { X } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import { OrcidConnectButton } from '@/components/Orcid/OrcidConnectButton';
import { useDismissableFeature } from '@/hooks/useDismissableFeature';
import { Button } from '@/components/ui/Button';

export function OrcidSyncBanner() {
  const { isDismissed, dismissFeature } = useDismissableFeature('orcid_sync_banner');

  if (isDismissed) {
    return null;
  }

  return (
    <div className="relative mb-6 rounded-lg border border-[#DCEEC4] bg-[#F5FAEB] p-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={dismissFeature}
        className="absolute right-2 top-2 rounded-lg !p-0.5 text-gray-500 hover:!bg-[#E3F3C1] !h-auto !w-auto"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:pr-8">
        <div className="flex flex-1 items-start gap-3 pr-8 sm:pr-0">
          <div className="flex shrink-0 items-center justify-center rounded-lg bg-[#E3F3C1] p-2">
            <FontAwesomeIcon icon={faOrcid} className="h-5 w-5 text-[#A6CE39]" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900">Sync your ORCID account</h3>
            <p className="mt-1 hidden text-sm text-gray-700 sm:block">
              Sync your ORCID publications with your ResearchHub profile
            </p>
          </div>
        </div>

        <OrcidConnectButton className="w-full shrink-0 sm:w-auto" />
      </div>
    </div>
  );
}
