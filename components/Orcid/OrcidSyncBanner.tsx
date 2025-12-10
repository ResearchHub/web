'use client';

import { RefreshCw } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import { Button } from '@/components/ui/Button';
import { useConnectOrcid } from '@/components/Orcid/lib/hooks/useConnectOrcid';

export function OrcidSyncBanner() {
  const { connect, isConnecting } = useConnectOrcid();

  return (
    <div className="mb-6 rounded-lg border border-[#DCEEC4] bg-[#F5FAEB] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-start gap-3">
          <div className="flex shrink-0 items-center justify-center rounded-lg bg-[#E3F3C1] p-2">
            <FontAwesomeIcon icon={faOrcid} className="h-5 w-5 text-[#A6CE39]" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900">
              Connect your ORCID iD to auto-sync authorship
            </h3>
            <p className="mt-1 text-sm text-gray-700">
              Securely sync publications from ORCID into your ResearchHub profile.
            </p>
          </div>
        </div>

        <Button
          onClick={connect}
          disabled={isConnecting}
          className="w-full bg-[#A6CE39] text-white hover:bg-[#95BC33] focus-visible:ring-[#A6CE39] sm:w-auto"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isConnecting ? 'animate-spin' : ''}`} />
          {isConnecting ? 'Connecting…' : 'Connect ORCID'}
        </Button>
      </div>
    </div>
  );
}
