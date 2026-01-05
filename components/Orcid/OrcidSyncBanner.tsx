'use client';

import { X } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import { OrcidConnectButton } from '@/components/Orcid/OrcidConnectButton';
import { useDismissableFeature } from '@/hooks/useDismissableFeature';
import { Button } from '@/components/ui/Button';

const FEATURE_NAME = 'orcid_sync_banner';

interface OrcidSyncBannerProps {
  readonly isOwnProfile: boolean;
  readonly isOrcidConnected: boolean;
}

export function OrcidSyncBanner({ isOwnProfile, isOrcidConnected }: OrcidSyncBannerProps) {
  const { isDismissed, dismissFeature, dismissStatus } = useDismissableFeature(FEATURE_NAME);

  if (!isOwnProfile || isOrcidConnected || dismissStatus !== 'checked' || isDismissed) {
    return null;
  }

  return (
    <div className="relative mb-6 rounded-lg border border-orcid-200 bg-orcid-50 p-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={dismissFeature}
        className="absolute right-2 top-2 h-6 w-6 rounded-lg p-0.5 text-gray-500 hover:bg-orcid-100"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="flex flex-col gap-3 sm:!flex-row sm:!items-center sm:!pr-8">
        <div className="flex flex-1 items-start gap-3 pr-8 sm:!pr-0">
          <div className="flex shrink-0 items-center justify-center rounded-lg bg-orcid-100 p-2">
            <FontAwesomeIcon icon={faOrcid} className="h-5 w-5 text-orcid-500" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-gray-900">Connect your ORCID account</h3>
            <p className="text-xs text-gray-700">
              Sync your ORCID publications with your ResearchHub profile
            </p>
          </div>
        </div>

        <OrcidConnectButton
          variant="default"
          className="w-full shrink-0 !bg-orcid-500 !text-white hover:!bg-orcid-600 !border-orcid-500 sm:!w-auto"
        />
      </div>
    </div>
  );
}
