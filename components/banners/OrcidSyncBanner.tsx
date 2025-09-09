'use client';

import { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import { checkOrcidAuth, triggerOrcidSync, redirectToOrcidLogin } from '@/services/orcid.service';
import { toast } from 'react-hot-toast';
import { useDismissableFeature } from '@/hooks/useDismissableFeature';

export function OrcidSyncBanner() {
  const { isDismissed, dismissFeature, dismissStatus } = useDismissableFeature('orcid_sync_banner');
  const [loading, setLoading] = useState(false);
  if (dismissStatus !== 'checked' || isDismissed) return null;
  const onClick = async () => {
    setLoading(true);
    try {
      const ok = await checkOrcidAuth();
      if (ok) {
        await triggerOrcidSync();
        toast.success('Sync started! We’ll refresh your authorship shortly.');
        dismissFeature();
      } else {
        await redirectToOrcidLogin(window.location.href);
      }
    } catch {
      toast.error('Could not start ORCID sync. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5FAEB] p-4 pr-12 sm:pr-20 rounded-lg border border-[#DCEEC4] mb-6 relative">
      <button
        onClick={dismissFeature}
        className="absolute top-3 right-3 z-10 text-[#7FBF27] hover:text-[#5FA71E] transition-colors"
        aria-label="Dismiss"
        title="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Stack on mobile, row on sm+ */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Icon + text block */}
        <div className="flex items-start gap-3 flex-1">
          <div className="bg-[#E3F3C1] rounded-lg p-2 shrink-0 flex items-center justify-center">
            <FontAwesomeIcon icon={faOrcid} className="block h-5 w-5" color="#A6CE39" />
          </div>

          <div className="flex-1">
            <h3 className="font-medium text-gray-900">
              Connect your ORCID iD to auto-sync authorship
            </h3>
            <p className="text-sm text-gray-700 mt-1">
              Securely sync publications from{' '}
              <span className="font-medium text-[#6BAA1D]">ORCID</span> into your ResearchHub
              profile.
            </p>
          </div>
        </div>

        {/* CTA — full width on mobile, auto on desktop */}
        <div className="w-full sm:w-auto">
          <Button
            onClick={onClick}
            disabled={loading}
            className="w-full sm:w-auto bg-[#A6CE39] hover:bg-[#95BC33] text-white focus-visible:ring-[#A6CE39]"
          >
            <RefreshCw className="h-4 w-4 mr-3 text-white" />
            {loading ? 'Checking…' : 'Sync with ORCID'}
          </Button>
        </div>
      </div>
    </div>
  );
}
