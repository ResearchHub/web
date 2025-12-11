'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import { processOrcidCallback } from '@/components/Orcid/lib/services/orcid.service';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { Button } from '@/components/ui/Button';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useUser } from '@/contexts/UserContext';
import toast from 'react-hot-toast';

type CallbackStatus = 'idle' | 'processing' | 'error';

export default function OrcidCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useUser();
  const [status, setStatus] = useState<CallbackStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'idle') return;

    const code = searchParams.get('code');
    const oauthState = searchParams.get('state');

    if (!code || !oauthState) {
      setError('Missing authorization code or state parameter');
      setStatus('error');
      return;
    }

    setStatus('processing');
    router.replace('/auth/orcid/callback', { scroll: false });

    const handleCallback = async () => {
      try {
        const response = await processOrcidCallback(code, oauthState);

        if (response.success && response.authorId) {
          await refreshUser();
          toast.success('ORCID account connected.');
          router.replace(`/author/${response.authorId}`);
        } else {
          throw new Error('Failed to connect ORCID.');
        }
      } catch (err) {
        setError(extractApiErrorMessage(err, 'Failed to connect ORCID.'));
        setStatus('error');
      }
    };

    handleCallback();
  }, [status, searchParams, router, refreshUser]);

  return (
    <PageLayout rightSidebar={false}>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#E3F3C1]">
              <FontAwesomeIcon icon={faOrcid} className="h-8 w-8 text-[#A6CE39]" />
            </div>

            {status !== 'error' && (
              <>
                <h1 className="mb-2 text-xl font-semibold text-gray-900">Connecting ORCID</h1>
                <p className="mb-6 text-sm text-gray-600">
                  Please wait while we connect your ORCID account...
                </p>
                <Loader2 className="h-8 w-8 animate-spin text-[#A6CE39]" />
              </>
            )}

            {status === 'error' && (
              <>
                <h1 className="mb-2 text-xl font-semibold text-gray-900">Connection Failed</h1>
                <p className="mb-6 text-sm text-red-600">{error}</p>
                <Button
                  onClick={() => router.push('/')}
                  className="bg-[#A6CE39] text-white hover:bg-[#95BC33]"
                >
                  Return Home
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
